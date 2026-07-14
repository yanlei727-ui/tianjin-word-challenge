import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getModuleWords, getModuleInfo, type ModuleKey } from '../utils/modules';
import { loadProgress, loadFavorites } from '../utils/storage';
import { speak, stopSpeaking } from '../utils/speech';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

const NORMAL_RATE = 0.85;
const SLOW_RATE = 0.65;
const WORD_DURATION = 800;
const PAUSE_AFTER = 1000;
const PAUSE_AFTER_LAST = 1500;

type FilterParam = 'all' | 'unlearned' | 'mastered' | 'favorite';

export default function AutoRecognizePage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const filterParam = (searchParams.get('filter') as FilterParam) || 'all';
  const letterParam = searchParams.get('letter');
  const moduleInfo = getModuleInfo(module);

  const words = useMemo(() => {
    const allWords = getModuleWords(module);
    const progress = loadProgress(module);
    const favorites = loadFavorites();
    const favoriteIds = new Set(
      favorites.filter(f => f.module === module).map(f => f.wordId)
    );

    let list = allWords;
    if (filterParam === 'unlearned') {
      list = list.filter(w => !progress.mastered.includes(w.id));
    } else if (filterParam === 'mastered') {
      list = list.filter(w => progress.mastered.includes(w.id));
    } else if (filterParam === 'favorite') {
      list = list.filter(w => favoriteIds.has(w.id));
    }
    if (letterParam) {
      list = list.filter(w => w.word[0].toUpperCase() === letterParam);
    }
    return list;
  }, [module, filterParam, letterParam]);

  const backUrl = useMemo(() => {
    let url = `/wordlist?module=${module}`;
    if (filterParam && filterParam !== 'all') url += `&filter=${filterParam}`;
    if (letterParam) url += `&letter=${letterParam}`;
    return url;
  }, [module, filterParam, letterParam]);

  const filterLabel = useMemo(() => {
    const labels: Record<string, string> = {
      all: '全部', unlearned: '未掌握', mastered: '已掌握', favorite: '收藏',
    };
    let label = labels[filterParam] || '全部';
    if (letterParam) label += ` · ${letterParam}`;
    return label;
  }, [filterParam, letterParam]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [showAfterThird, setShowAfterThird] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState(false);
  const [repeatCount, setRepeatCount] = useState<1 | 2 | 3>(3);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const showAfterThirdRef = useRef(false);
  const repeatCountRef = useRef<1 | 2 | 3>(3);

  const currentWord = words[currentIndex];

  // Keep refs in sync
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { showAfterThirdRef.current = showAfterThird; }, [showAfterThird]);
  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);

  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
    stopSpeaking();
  }, []);

  const scheduleTimer = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      timersRef.current = timersRef.current.filter(t => t !== id);
      fn();
    }, delay);
    timersRef.current.push(id);
  }, []);

  const advanceToNext = useCallback(() => {
    if (shuffleOrder) {
      if (words.length <= 1) {
        setIsCompleted(true);
        setIsPlaying(false);
        return;
      }
      let next: number;
      do {
        next = Math.floor(Math.random() * words.length);
      } while (next === currentIndexRef.current);
      setCurrentIndex(next);
    } else {
      const next = currentIndexRef.current + 1;
      if (next >= words.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        return;
      }
      setCurrentIndex(next);
    }
    setShowMeaning(false);
    setCurrentRepeat(0);
  }, [shuffleOrder, words.length]);

  const playCurrentWord = useCallback((word: string, fromRepeat: number = 0) => {
    clearAllTimers();
    setCurrentRepeat(fromRepeat);

    const speakNext = (rep: number) => {
      if (rep >= repeatCountRef.current) {
        if (showAfterThirdRef.current) setShowMeaning(true);
        const pause = rep === repeatCountRef.current ? PAUSE_AFTER_LAST : PAUSE_AFTER;
        scheduleTimer(() => {
          if (!isPausedRef.current && isPlayingRef.current) {
            advanceToNext();
          }
        }, WORD_DURATION + pause);
        return;
      }

      const rate = rep === 1 ? SLOW_RATE : NORMAL_RATE;
      speak(word, rate);
      setCurrentRepeat(rep + 1);

      const pause = rep === repeatCountRef.current - 1 ? PAUSE_AFTER_LAST : PAUSE_AFTER;
      scheduleTimer(() => {
        if (!isPausedRef.current && isPlayingRef.current) {
          speakNext(rep + 1);
        }
      }, WORD_DURATION + pause);
    };

    speakNext(fromRepeat);
  }, [clearAllTimers, scheduleTimer, advanceToNext]);

  // Auto-play driver
  useEffect(() => {
    if (isPlaying && !isPaused && !isCompleted && words.length > 0 && currentWord) {
      playCurrentWord(currentWord.word, 0);
    }
    return () => clearAllTimers();
  }, [currentIndex, isPlaying, isPaused, isCompleted, currentWord?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { clearAllTimers(); };
  }, []);

  const handleStart = () => {
    setIsPlaying(true);
    setIsPaused(false);
    setCurrentIndex(0);
    setIsCompleted(false);
    setShowMeaning(false);
    setCurrentRepeat(0);
  };

  const handlePauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
    } else {
      clearAllTimers();
      setIsPaused(true);
    }
  };

  const handlePrev = () => {
    clearAllTimers();
    const prev = shuffleOrder
      ? Math.floor(Math.random() * words.length)
      : (currentIndex - 1 + words.length) % words.length;
    setCurrentIndex(prev);
    setShowMeaning(false);
    setCurrentRepeat(0);
    if (isPlaying && !isPaused) {
      scheduleTimer(() => {
        if (isPlayingRef.current && !isPausedRef.current) {
          playCurrentWord(words[prev].word, 0);
        }
      }, 100);
    }
  };

  const handleNext = () => {
    clearAllTimers();
    const next = shuffleOrder
      ? Math.floor(Math.random() * words.length)
      : (currentIndex + 1) % words.length;
    setCurrentIndex(next);
    setShowMeaning(false);
    setCurrentRepeat(0);
    if (isPlaying && !isPaused) {
      scheduleTimer(() => {
        if (isPlayingRef.current && !isPausedRef.current) {
          playCurrentWord(words[next].word, 0);
        }
      }, 100);
    }
  };

  const handleReplay = () => {
    clearAllTimers();
    setShowMeaning(false);
    setCurrentRepeat(0);
    if (currentWord) {
      playCurrentWord(currentWord.word, 0);
    }
  };

  const handleToggleMeaning = () => {
    setShowMeaning(prev => !prev);
  };

  const handleToggleShuffle = () => {
    setShuffleOrder(prev => !prev);
  };

  const handleCycleRepeat = () => {
    setRepeatCount(prev => (prev === 3 ? 1 : (prev + 1) as 1 | 2 | 3));
  };

  const handleExit = () => {
    clearAllTimers();
    setIsPlaying(false);
    setIsPaused(false);
  };

  // Empty state
  if (words.length === 0) {
    return (
      <div className="page">
        <div className="ar-page">
          <div className="ar-header">
            <Link to={backUrl} className="ar-back">← 返回单词本</Link>
          </div>
          <div className="ar-empty">
            <p style={{ fontSize: '1.1rem' }}>当前筛选没有单词</p>
            <p style={{ fontSize: '0.85rem' }}>请返回单词本选择其他筛选条件</p>
            <Link to={backUrl} className="btn-action btn-primary" style={{ marginTop: 8, textDecoration: 'none' }}>
              返回单词本
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (isCompleted) {
    return (
      <div className="page">
        <div className="ar-page">
          <div className="ar-header">
            <Link to={backUrl} className="ar-back">← 返回单词本</Link>
            <div className="ar-header-info">
              <div className="ar-module-label">{moduleInfo.icon} {moduleInfo.label}</div>
              <div className="ar-filter-label">{filterLabel} · {words.length}个单词</div>
            </div>
          </div>
          <div className="ar-completion">
            <div className="ar-completion-icon">🎉</div>
            <div className="ar-completion-title">本轮认词完成！</div>
            <div className="ar-completion-sub">已连续朗读 {words.length} 个单词</div>
            <div className="ar-completion-actions">
              <button className="ar-start-btn" onClick={handleStart}>重新播放</button>
              <Link to={backUrl} className="ar-exit-btn" style={{ padding: '14px 28px', fontSize: '1rem', textDecoration: 'none' }}>
                返回单词本
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ar-page">
        {/* Header */}
        <div className="ar-header">
          <Link to={backUrl} className="ar-back" onClick={handleExit}>← 返回单词本</Link>
          <div className="ar-header-info">
            <div className="ar-module-label">{moduleInfo.icon} {moduleInfo.label}</div>
            <div className="ar-filter-label">{filterLabel} · {words.length}个单词</div>
          </div>
        </div>

        {/* Progress */}
        <div className="ar-progress-row">
          <span className="ar-progress-text">第 {currentIndex + 1} / {words.length} 个</span>
          <div className="ar-progress-bar">
            <div
              className="ar-progress-fill"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Word card */}
        <div className="ar-word-card" onClick={handleToggleMeaning}>
          {!isPlaying && !isCompleted && (
            <div className="ar-start-overlay">
              <button className="ar-start-btn" onClick={(e) => { e.stopPropagation(); handleStart(); }}>
                ▶ 开始播放
              </button>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
                每个单词将朗读 {repeatCount} 遍
              </p>
            </div>
          )}

          <div className="ar-word">{currentWord.word}</div>
          <div className="ar-phonetic">{currentWord.phonetic}</div>
          <div className="ar-pos">{currentWord.partOfSpeech}</div>

          {/* Repeat indicator */}
          {isPlaying && !isPaused && (
            <div className="ar-repeat-indicator">
              {Array.from({ length: repeatCount }, (_, i) => (
                <div key={i} className={`ar-repeat-dot ${i < currentRepeat ? 'active' : ''}`} />
              ))}
            </div>
          )}

          {/* Meaning */}
          {showMeaning ? (
            <div className="ar-meaning">{currentWord.meaning}</div>
          ) : (
            isPlaying && (
              <div className="ar-meaning-hint">中文释义已隐藏 · 点击显示</div>
            )
          )}
        </div>

        {/* Controls */}
        <div className="ar-controls">
          <div className="ar-controls-main">
            <button className="ar-ctrl-btn" onClick={handlePrev} title="上一个">
              <SkipBack size={20} />
            </button>
            <button className="ar-ctrl-btn primary" onClick={handlePauseResume} title={isPaused ? '继续' : '暂停'}>
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
            <button className="ar-ctrl-btn" onClick={handleNext} title="下一个">
              <SkipForward size={20} />
            </button>
            <button className="ar-ctrl-btn" onClick={handleReplay} title="重新朗读">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="ar-controls-secondary">
            <button
              className={`ar-toggle-btn ${showAfterThird ? 'active' : ''}`}
              onClick={() => setShowAfterThird(prev => !prev)}
            >
              第三遍后显示中文
            </button>
            <button
              className={`ar-toggle-btn ${shuffleOrder ? 'active' : ''}`}
              onClick={handleToggleShuffle}
            >
              {shuffleOrder ? '随机播放' : '顺序播放'}
            </button>
            <button className="ar-toggle-btn" onClick={handleCycleRepeat}>
              每词 {repeatCount} 次
            </button>
            <Link to={backUrl} className="ar-exit-btn" onClick={handleExit}>退出</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
