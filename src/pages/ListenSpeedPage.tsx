import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Eye, EyeOff, Settings, X, ArrowLeft } from 'lucide-react';
import { getModuleWords, MODULES, type ModuleKey } from '../utils/modules';
import { loadProgress, loadFavorites } from '../utils/storage';
import { speak, stopSpeaking } from '../utils/speech';

type Scope = 'all' | 'unmastered' | 'favorite' | 'wrong';
type Order = 'sequential' | 'random';
type RepeatCount = 1 | 2 | 3 | 5;

const NORMAL_RATE = 0.85;
const SLOW_RATE = 0.65;
const WORD_SPEAK_DURATION = 1200;
const PAUSE_BETWEEN = 1000;
const PAUSE_AFTER_ALL_REPEATS = 2000;

export default function ListenSpeedPage() {
  // Settings
  const [repeatCount, setRepeatCount] = useState<RepeatCount>(3);
  const [order, setOrder] = useState<Order>('sequential');
  const [scope, setScope] = useState<Scope>('all');
  const [showSettings, setShowSettings] = useState(false);

  // Playback state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showMeaning, setShowMeaning] = useState(false);
  const [currentRepeat, setCurrentRepeat] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Stats
  const [totalSpokenCount, setTotalSpokenCount] = useState(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const repeatCountRef = useRef<RepeatCount>(3);
  const wordsRef = useRef<ReturnType<typeof getModuleWords>>([]);

  // Build word list from all modules based on scope
  const words = useMemo(() => {
    let allWords: { word: string; phonetic: string; meaning: string; partOfSpeech: string; id: number; module: ModuleKey; example?: string; exampleZh?: string }[] = [];

    for (const m of MODULES) {
      const moduleWords = getModuleWords(m.key);
      const progress = loadProgress(m.key);
      const favorites = loadFavorites();
      const favoriteIds = new Set(
        favorites.filter(f => f.module === m.key).map(f => f.wordId)
      );
      const wrongIds = new Set(progress.wrongBook.map(r => r.wordId));

      let filtered = moduleWords.map(w => ({ ...w, module: m.key }));

      if (scope === 'unmastered') {
        filtered = filtered.filter(w => !progress.mastered.includes(w.id));
      } else if (scope === 'favorite') {
        filtered = filtered.filter(w => favoriteIds.has(w.id));
      } else if (scope === 'wrong') {
        filtered = filtered.filter(w => wrongIds.has(w.id));
      }

      allWords = allWords.concat(filtered);
    }

    if (order === 'random') {
      const shuffled = [...allWords];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    }

    return allWords;
  }, [scope, order]);

  wordsRef.current = words;
  const currentWord = words[currentIndex];

  // Keep refs in sync
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
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
    const currentWords = wordsRef.current;
    if (order === 'random') {
      if (currentWords.length <= 1) {
        setIsCompleted(true);
        setIsPlaying(false);
        return;
      }
      let next: number;
      do {
        next = Math.floor(Math.random() * currentWords.length);
      } while (next === currentIndexRef.current);
      setCurrentIndex(next);
    } else {
      const next = currentIndexRef.current + 1;
      if (next >= currentWords.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        return;
      }
      setCurrentIndex(next);
    }
    setShowMeaning(false);
    setCurrentRepeat(0);
  }, [order]);

  const playCurrentWord = useCallback((word: string, fromRepeat: number = 0) => {
    clearAllTimers();
    setCurrentRepeat(fromRepeat);

    const speakNext = (rep: number) => {
      if (rep >= repeatCountRef.current) {
        // All repeats done, pause then advance
        scheduleTimer(() => {
          if (!isPausedRef.current && isPlayingRef.current) {
            advanceToNext();
          }
        }, PAUSE_AFTER_ALL_REPEATS);
        return;
      }

      // Slow rate on the last repeat
      const rate = rep === repeatCountRef.current - 1 ? SLOW_RATE : NORMAL_RATE;
      speak(word, rate);
      setCurrentRepeat(rep + 1);
      setTotalSpokenCount(prev => prev + 1);

      const pause = rep === repeatCountRef.current - 1 ? PAUSE_AFTER_ALL_REPEATS : PAUSE_BETWEEN;
      scheduleTimer(() => {
        if (!isPausedRef.current && isPlayingRef.current) {
          speakNext(rep + 1);
        }
      }, WORD_SPEAK_DURATION + pause);
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

  // Elapsed time counter
  useEffect(() => {
    if (!isPlaying || isPaused || isCompleted) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isCompleted, startTime]);

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
    setTotalSpokenCount(0);
    setStartTime(Date.now());
    setElapsedTime(0);
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
    const prev = order === 'random'
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
    const next = order === 'random'
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

  const handleExit = () => {
    clearAllTimers();
    setIsPlaying(false);
    setIsPaused(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  };

  const scopeLabel = { all: '全部单词', unmastered: '未掌握单词', favorite: '收藏单词', wrong: '错题单词' };
  const repeatLabel: Record<RepeatCount, string> = { 1: '1次', 2: '2次', 3: '3次', 5: '5次' };

  // Empty state
  if (words.length === 0) {
    return (
      <div className="page">
        <div className="ls-page">
          <div className="ls-header">
            <Link to="/vocabulary" className="ls-back">← 返回词汇中心</Link>
          </div>
          <div className="ls-empty">
            <p style={{ fontSize: '1.1rem' }}>当前范围内没有单词</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)', marginTop: 4 }}>请在设置中切换学习范围</p>
            <button className="ls-start-btn" style={{ marginTop: 16 }} onClick={() => setShowSettings(true)}>
              打开设置
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (isCompleted) {
    return (
      <div className="page">
        <div className="ls-page">
          <div className="ls-header">
            <Link to="/vocabulary" className="ls-back" onClick={handleExit}>← 返回词汇中心</Link>
            <button className="ls-settings-btn" onClick={() => setShowSettings(true)}>
              <Settings size={16} /> 设置
            </button>
          </div>
          <div className="ls-completion">
            <div className="ls-completion-icon">🎉</div>
            <div className="ls-completion-title">本轮听词速记完成！</div>
            <div className="ls-completion-stats">
              <div className="ls-stat-item">
                <span className="ls-stat-value">{words.length}</span>
                <span className="ls-stat-label">学习单词数</span>
              </div>
              <div className="ls-stat-item">
                <span className="ls-stat-value">{totalSpokenCount}</span>
                <span className="ls-stat-label">总朗读次数</span>
              </div>
              <div className="ls-stat-item">
                <span className="ls-stat-value">{formatTime(elapsedTime)}</span>
                <span className="ls-stat-label">学习用时</span>
              </div>
            </div>
            <div className="ls-completion-actions">
              <button className="ls-start-btn" onClick={handleStart}>再听一遍</button>
              <button className="ls-start-btn secondary" onClick={() => {
                setOrder('random');
                handleStart();
              }}>随机复习</button>
              <Link to="/vocabulary" className="ls-exit-link" onClick={handleExit}>返回词汇中心</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="ls-page">
        {/* Header */}
        <div className="ls-header">
          <Link to="/vocabulary" className="ls-back" onClick={handleExit}>← 返回词汇中心</Link>
          <div className="ls-header-actions">
            <span className="ls-scope-badge">{scopeLabel[scope]}</span>
            <button className="ls-settings-btn" onClick={() => setShowSettings(true)}>
              <Settings size={16} /> 设置
            </button>
          </div>
        </div>

        {/* Progress */}
        <div className="ls-progress-row">
          <span className="ls-progress-text">{currentIndex + 1} / {words.length}</span>
          <div className="ls-progress-bar">
            <div
              className="ls-progress-fill"
              style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Word card */}
        <div className="ls-word-card" onClick={handleToggleMeaning}>
          {!isPlaying && !isCompleted && (
            <div className="ls-start-overlay">
              <button className="ls-start-btn" onClick={(e) => { e.stopPropagation(); handleStart(); }}>
                <Play size={20} /> 开始播放
              </button>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-400)' }}>
                每个单词将朗读 {repeatCount} 遍
              </p>
            </div>
          )}

          {/* Audio wave animation */}
          {isPlaying && !isPaused && (
            <div className="ls-wave-container">
              <div className="ls-wave-bar" style={{ animationDelay: '0s' }} />
              <div className="ls-wave-bar" style={{ animationDelay: '0.15s' }} />
              <div className="ls-wave-bar" style={{ animationDelay: '0.3s' }} />
              <div className="ls-wave-bar" style={{ animationDelay: '0.45s' }} />
              <div className="ls-wave-bar" style={{ animationDelay: '0.6s' }} />
            </div>
          )}

          <div className={`ls-word ${isPlaying && !isPaused ? 'ls-word-active' : ''}`}>
            {currentWord.word}
          </div>
          <div className="ls-phonetic">{currentWord.phonetic}</div>

          {/* Repeat indicator */}
          {isPlaying && !isPaused && (
            <div className="ls-repeat-info">
              第 {currentRepeat} 次朗读 / 共 {repeatCount} 次
            </div>
          )}

          {/* Meaning */}
          {showMeaning ? (
            <div className="ls-meaning">{currentWord.meaning}</div>
          ) : (
            isPlaying && (
              <div className="ls-meaning-hint">中文释义已隐藏 · 点击卡片显示</div>
            )
          )}
        </div>

        {/* Controls */}
        <div className="ls-controls">
          <div className="ls-controls-main">
            <button className="ls-ctrl-btn" onClick={handlePrev} title="上一个">
              <SkipBack size={20} />
            </button>
            <button className="ls-ctrl-btn primary" onClick={handlePauseResume} title={isPaused ? '继续' : '暂停'}>
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
            <button className="ls-ctrl-btn" onClick={handleNext} title="下一个">
              <SkipForward size={20} />
            </button>
            <button className="ls-ctrl-btn" onClick={handleReplay} title="重新朗读">
              <RotateCcw size={18} />
            </button>
          </div>

          <div className="ls-controls-secondary">
            <button className={`ls-toggle-btn ${showMeaning ? 'active' : ''}`} onClick={handleToggleMeaning}>
              {showMeaning ? <><EyeOff size={14} /> 隐藏释义</> : <><Eye size={14} /> 显示释义</>}
            </button>
            <Link to="/vocabulary" className="ls-exit-btn" onClick={handleExit}>退出学习</Link>
          </div>
        </div>
      </div>

      {/* Settings modal */}
      {showSettings && (
        <div className="ls-modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="ls-modal" onClick={e => e.stopPropagation()}>
            <div className="ls-modal-header">
              <h3>学习设置</h3>
              <button className="ls-modal-close" onClick={() => setShowSettings(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="ls-modal-body">
              <div className="ls-setting-group">
                <label className="ls-setting-label">播放次数</label>
                <div className="ls-setting-options">
                  {([1, 2, 3, 5] as RepeatCount[]).map(n => (
                    <button
                      key={n}
                      className={`ls-option-btn ${repeatCount === n ? 'active' : ''}`}
                      onClick={() => setRepeatCount(n)}
                    >
                      {n}次
                    </button>
                  ))}
                </div>
              </div>

              <div className="ls-setting-group">
                <label className="ls-setting-label">播放顺序</label>
                <div className="ls-setting-options">
                  <button
                    className={`ls-option-btn ${order === 'sequential' ? 'active' : ''}`}
                    onClick={() => setOrder('sequential')}
                  >
                    顺序播放
                  </button>
                  <button
                    className={`ls-option-btn ${order === 'random' ? 'active' : ''}`}
                    onClick={() => setOrder('random')}
                  >
                    随机播放
                  </button>
                </div>
              </div>

              <div className="ls-setting-group">
                <label className="ls-setting-label">学习范围</label>
                <div className="ls-setting-options">
                  {([
                    { key: 'all' as Scope, label: '全部单词' },
                    { key: 'unmastered' as Scope, label: '未掌握单词' },
                    { key: 'favorite' as Scope, label: '收藏单词' },
                    { key: 'wrong' as Scope, label: '错题单词' },
                  ]).map(s => (
                    <button
                      key={s.key}
                      className={`ls-option-btn ${scope === s.key ? 'active' : ''}`}
                      onClick={() => setScope(s.key)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="ls-modal-footer">
              <button className="ls-start-btn" onClick={() => { setShowSettings(false); handleStart(); }}>
                开始学习
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
