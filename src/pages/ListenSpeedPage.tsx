import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Play, Pause, SkipBack, SkipForward, RotateCcw, Eye, EyeOff, Settings, X, Hash } from 'lucide-react';
import { getModuleWords, MODULES, type ModuleKey, isValidModule } from '../utils/modules';
import { loadProgress, loadFavorites } from '../utils/storage';
import { speak, stopSpeaking } from '../utils/speech';

type Scope = 'all' | 'unmastered' | 'favorite' | 'wrong';
type Order = 'sequential' | 'random';
type RepeatCount = 1 | 2 | 3 | 4 | 5;

const NORMAL_RATE = 0.85;
const SLOW_RATE = 0.65;
const WORD_SPEAK_DURATION = 1200;
const PAUSE_BETWEEN = 1000;
const PAUSE_AFTER_ALL_REPEATS = 2000;

// localStorage key helpers
const ORDER_KEY = 'ls_playback_order';
const MODULE_KEY = 'ls_playback_module';
const REPEAT_KEY = 'ls_playback_repeat';

type WordItem = { module: ModuleKey; id: number; [k: string]: unknown };

function getWordKey(word: WordItem): string {
  return `${word.module}_${word.id}`;
}

function getPositionKey(module: ModuleKey, scope: Scope, order: Order): string {
  return `ls_position_${module}_${scope}_${order}`;
}

function savePosition(index: number, wordKey: string, module: ModuleKey, scope: Scope, order: Order): void {
  try {
    localStorage.setItem(getPositionKey(module, scope, order), JSON.stringify({
      index,
      wordKey,
      updatedAt: Date.now(),
    }));
  } catch { /* ignore */ }
}

function loadPosition(module: ModuleKey, scope: Scope, order: Order): { index: number; wordKey?: string; wordId?: number; updatedAt: number } | null {
  try {
    const raw = localStorage.getItem(getPositionKey(module, scope, order));
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (typeof data?.index !== 'number') return null;
    return data;
  } catch { return null; }
}

function saveOrderSetting(order: Order): void {
  try { localStorage.setItem(ORDER_KEY, order); } catch { /* ignore */ }
}

function loadOrderSetting(): Order {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    if (raw === 'random' || raw === 'sequential') return raw;
  } catch { /* ignore */ }
  return 'sequential';
}

function saveModuleSetting(module: ModuleKey): void {
  try { localStorage.setItem(MODULE_KEY, module); } catch { /* ignore */ }
}

function loadModuleSetting(): ModuleKey {
  try {
    const raw = localStorage.getItem(MODULE_KEY);
    if (raw && isValidModule(raw)) return raw;
  } catch { /* ignore */ }
  return 'noun';
}

function saveRepeatSetting(repeat: RepeatCount): void {
  try { localStorage.setItem(REPEAT_KEY, String(repeat)); } catch { /* ignore */ }
}

function loadRepeatSetting(): RepeatCount {
  try {
    const raw = localStorage.getItem(REPEAT_KEY);
    const num = Number(raw);
    if ([1, 2, 3, 4, 5].includes(num)) return num as RepeatCount;
  } catch { /* ignore */ }
  return 3;
}

export default function ListenSpeedPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Settings
  const [module, setModule] = useState<ModuleKey>(() => {
    const param = searchParams.get('module');
    if (param && isValidModule(param)) return param;
    return loadModuleSetting();
  });
  const [repeatCount, setRepeatCount] = useState<RepeatCount>(loadRepeatSetting);
  const [order, setOrder] = useState<Order>(loadOrderSetting);
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

  const handleSetOrder = (newOrder: Order) => {
    setOrder(newOrder);
    saveOrderSetting(newOrder);
  };

  const handleSetModule = (newModule: ModuleKey) => {
    setModule(newModule);
    setSearchParams({ module: newModule });
    saveModuleSetting(newModule);
  };

  // Jump modal
  const [showJumpModal, setShowJumpModal] = useState(false);
  const [jumpInput, setJumpInput] = useState('');
  const [jumpError, setJumpError] = useState('');

  // Resume prompt
  const [resumeInfo, setResumeInfo] = useState<{ index: number; show: boolean }>({ index: 0, show: false });

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isPausedRef = useRef(false);
  const isPlayingRef = useRef(false);
  const currentIndexRef = useRef(0);
  const repeatCountRef = useRef<RepeatCount>(3);
  const wordsRef = useRef<{ word: string; phonetic: string; meaning: string; partOfSpeech: string; id: number; module: ModuleKey; example?: string; exampleZh?: string }[]>([]);

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

    // Filter by module if specified
    if (module) {
      allWords = allWords.filter(w => w.module === module);
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
  }, [scope, order, module]);

  wordsRef.current = words;
  const currentWord = words[currentIndex];

  // Keep refs in sync
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { repeatCountRef.current = repeatCount; }, [repeatCount]);

  // ── Unified timer helpers ──────────────────────────────────
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

  // ── Unified goToWord ───────────────────────────────────────
  const goToWord = useCallback((targetIndex: number, opts?: { autoPlay?: boolean }) => {
    const currentWords = wordsRef.current;
    if (targetIndex < 0 || targetIndex >= currentWords.length) return;

    // 1. Stop everything
    clearAllTimers();

    // 2. Update state
    setCurrentIndex(targetIndex);
    setShowMeaning(false);
    setCurrentRepeat(0);
    setIsCompleted(false);

    // 3. Save position
    const targetWord = wordsRef.current[targetIndex];
    if (targetWord) savePosition(targetIndex, getWordKey(targetWord), module, scope, order);

    // 4. Auto-play if requested (or if currently playing and not paused)
    const shouldPlay = opts?.autoPlay ?? (isPlayingRef.current && !isPausedRef.current);
    if (shouldPlay) {
      setIsPlaying(true);
      setIsPaused(false);
      // Small delay to let React render before speaking
      scheduleTimer(() => {
        if (isPlayingRef.current && !isPausedRef.current) {
          const w = wordsRef.current[targetIndex];
          if (w) speakCurrentWord(w.word, 0);
        }
      }, 80);
    }
  }, [clearAllTimers, scheduleTimer, scope, order]);

  // ── Play logic ─────────────────────────────────────────────
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
      goToWord(next, { autoPlay: true });
    } else {
      const next = currentIndexRef.current + 1;
      if (next >= currentWords.length) {
        setIsCompleted(true);
        setIsPlaying(false);
        return;
      }
      goToWord(next, { autoPlay: true });
    }
  }, [order, goToWord]);

  const speakCurrentWord = useCallback((word: string, fromRepeat: number = 0) => {
    clearAllTimers();
    setCurrentRepeat(fromRepeat);

    const speakNext = (rep: number) => {
      if (rep >= repeatCountRef.current) {
        scheduleTimer(() => {
          if (!isPausedRef.current && isPlayingRef.current) {
            advanceToNext();
          }
        }, PAUSE_AFTER_ALL_REPEATS);
        return;
      }

      const isLastRepeat = rep === repeatCountRef.current - 1;
      const rate = isLastRepeat ? SLOW_RATE : NORMAL_RATE;
      speak(word, rate);
      setCurrentRepeat(rep + 1);
      setTotalSpokenCount(prev => prev + 1);

      // Show Chinese meaning on last repeat
      if (isLastRepeat) {
        setShowMeaning(true);
      }

      const pause = isLastRepeat ? PAUSE_AFTER_ALL_REPEATS : PAUSE_BETWEEN;
      scheduleTimer(() => {
        if (!isPausedRef.current && isPlayingRef.current) {
          speakNext(rep + 1);
        }
      }, WORD_SPEAK_DURATION + pause);
    };

    speakNext(fromRepeat);
  }, [clearAllTimers, scheduleTimer, advanceToNext]);

  // ── Auto-play driver ───────────────────────────────────────
  useEffect(() => {
    if (isPlaying && !isPaused && !isCompleted && words.length > 0 && currentWord) {
      speakCurrentWord(currentWord.word, 0);
    }
    return () => clearAllTimers();
  }, [currentIndex, isPlaying, isPaused, isCompleted, currentWord?.id]);

  // ── Elapsed time counter ───────────────────────────────────
  useEffect(() => {
    if (!isPlaying || isPaused || isCompleted) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused, isCompleted, startTime]);

  // ── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => { clearAllTimers(); };
  }, []);

  // ── Resume prompt on entry ─────────────────────────────────
  useEffect(() => {
    if (words.length === 0) return;
    const saved = loadPosition(module, scope, order);
    if (!saved || saved.index <= 0) return;

    if (order === 'random') {
      let foundIndex = -1;

      // New format: wordKey (module_id)
      if (saved.wordKey) {
        foundIndex = words.findIndex(w => getWordKey(w) === saved.wordKey);
      }

      // Legacy fallback: wordId (may match wrong word if IDs overlap)
      if (foundIndex < 0 && saved.wordId) {
        foundIndex = words.findIndex(w => w.id === saved.wordId);
      }

      if (foundIndex > 0) {
        setResumeInfo({ index: foundIndex, show: true });
      } else if (saved.index > 0 && saved.index < words.length) {
        // Final fallback: use saved index
        setResumeInfo({ index: saved.index, show: true });
      }
    } else {
      // Sequential mode: use saved index directly
      if (saved.index < words.length) {
        setResumeInfo({ index: saved.index, show: true });
      }
    }
  }, [scope, order, words.length]);

  // ── Handlers ───────────────────────────────────────────────
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
    const firstWord = wordsRef.current[0];
    if (firstWord) savePosition(0, getWordKey(firstWord), module, scope, order);
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
    const prev = order === 'random'
      ? Math.floor(Math.random() * words.length)
      : (currentIndex - 1 + words.length) % words.length;
    goToWord(prev, { autoPlay: isPlayingRef.current && !isPausedRef.current });
  };

  const handleNext = () => {
    const next = order === 'random'
      ? Math.floor(Math.random() * words.length)
      : (currentIndex + 1) % words.length;
    goToWord(next, { autoPlay: isPlayingRef.current && !isPausedRef.current });
  };

  const handleReplay = () => {
    clearAllTimers();
    setShowMeaning(false);
    setCurrentRepeat(0);
    if (currentWord) {
      speakCurrentWord(currentWord.word, 0);
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

  // ── Jump modal ─────────────────────────────────────────────
  const openJumpModal = () => {
    setJumpInput(String(currentIndex + 1));
    setJumpError('');
    setShowJumpModal(true);
  };

  const handleJumpConfirm = () => {
    const trimmed = jumpInput.trim();
    if (!trimmed) {
      setJumpError('请输入序号');
      return;
    }
    const num = Number(trimmed);
    if (!Number.isInteger(num) || num < 1 || num > words.length) {
      setJumpError(`请输入1—${words.length}之间的整数`);
      return;
    }
    const targetIndex = num - 1;
    setShowJumpModal(false);
    goToWord(targetIndex, { autoPlay: isPlayingRef.current && !isPausedRef.current });
  };

  const handleJumpQuick = (targetIndex: number) => {
    setShowJumpModal(false);
    goToWord(targetIndex, { autoPlay: isPlayingRef.current && !isPausedRef.current });
  };

  // ── Resume handlers ────────────────────────────────────────
  const handleResumeContinue = () => {
    const idx = resumeInfo.index;
    setResumeInfo({ index: 0, show: false });
    goToWord(idx, { autoPlay: false });
  };

  const handleResumeFromStart = () => {
    setResumeInfo({ index: 0, show: false });
    const firstWord = wordsRef.current[0];
    if (firstWord) savePosition(0, getWordKey(firstWord), module, scope, order);
    goToWord(0, { autoPlay: false });
  };

  // ── Helpers ────────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return m > 0 ? `${m}分${s}秒` : `${s}秒`;
  };

  const scopeLabel = { all: '全部单词', unmastered: '未掌握单词', favorite: '收藏单词', wrong: '错题单词' };

  // ── Empty state ────────────────────────────────────────────
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

  // ── Completion state ───────────────────────────────────────
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
            <div className="ls-completion-title">本轮自动认词完成！</div>
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
                handleSetOrder('random');
                handleStart();
              }}>随机复习</button>
              <Link to="/vocabulary" className="ls-exit-link" onClick={handleExit}>返回词汇中心</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────
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

        {/* Progress — clickable */}
        <div className="ls-progress-row">
          <span className="ls-progress-text ls-progress-clickable" onClick={openJumpModal} title="点击选择起始位置">
            第 {currentIndex + 1} / {words.length} 个
          </span>
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
              <div className="ls-meaning-hint">最后一遍自动显示中文 · 点击卡片提前显示</div>
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
            <button
              className={`ls-toggle-btn ${order === 'random' ? 'disabled' : ''}`}
              onClick={order === 'random' ? undefined : openJumpModal}
              title={order === 'random' ? '随机模式下无法指定起始位置' : '点击选择起始位置'}
            >
              <Hash size={14} /> 从第 {currentIndex + 1} 个开始
            </button>
            <button className={`ls-toggle-btn ${showMeaning ? 'active' : ''}`} onClick={handleToggleMeaning}>
              {showMeaning ? <><EyeOff size={14} /> 隐藏释义</> : <><Eye size={14} /> 显示释义</>}
            </button>
            <Link to="/vocabulary" className="ls-exit-btn" onClick={handleExit}>退出学习</Link>
          </div>
        </div>
      </div>

      {/* ── Resume prompt ──────────────────────────────── */}
      {resumeInfo.show && (
        <div className="ls-resume-bar">
          <span className="ls-resume-text">上次听到第 {resumeInfo.index + 1} 个单词</span>
          <div className="ls-resume-actions">
            <button className="ls-resume-btn primary" onClick={handleResumeContinue}>继续上次</button>
            <button className="ls-resume-btn" onClick={handleResumeFromStart}>从头开始</button>
          </div>
        </div>
      )}

      {/* ── Jump-to-position modal ─────────────────────── */}
      {showJumpModal && (
        <div className="ls-modal-overlay" onClick={() => setShowJumpModal(false)}>
          <div className="ls-modal ls-modal-sm" onClick={e => e.stopPropagation()}>
            <div className="ls-modal-header">
              <h3>选择开始位置</h3>
              <button className="ls-modal-close" onClick={() => setShowJumpModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="ls-modal-body">
              <div className="ls-jump-input-row">
                <input
                  className="ls-jump-input"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={words.length}
                  value={jumpInput}
                  onChange={e => {
                    setJumpInput(e.target.value);
                    setJumpError('');
                  }}
                  onKeyDown={e => { if (e.key === 'Enter') handleJumpConfirm(); }}
                  autoFocus
                />
                <span className="ls-jump-total">/ {words.length}</span>
              </div>
              {jumpError && <div className="ls-jump-error">{jumpError}</div>}

              <div className="ls-jump-shortcuts">
                <button className="ls-option-btn" onClick={() => handleJumpQuick(0)}>
                  从第1个开始
                </button>
                <button className="ls-option-btn" onClick={() => {
                  const saved = loadPosition(module, scope, order);
                  if (saved && saved.index > 0 && saved.index < words.length) {
                    handleJumpQuick(saved.index);
                  }
                }}>
                  继续上次位置
                </button>
                <button className="ls-option-btn" onClick={() => handleJumpQuick(currentIndex)}>
                  从当前单词开始
                </button>
              </div>
            </div>

            <div className="ls-modal-footer">
              <button className="ls-option-btn" onClick={() => setShowJumpModal(false)}>取消</button>
              <button className="ls-start-btn" style={{ fontSize: '0.95rem', padding: '10px 28px' }} onClick={handleJumpConfirm}>
                从这里开始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings modal ─────────────────────────────── */}
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
                <label className="ls-setting-label">学习模块</label>
                <div className="ls-setting-options">
                  {MODULES.map(m => (
                    <button
                      key={m.key}
                      className={`ls-option-btn ${module === m.key ? 'active' : ''}`}
                      onClick={() => handleSetModule(m.key)}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="ls-setting-group">
                <label className="ls-setting-label">播放次数</label>
                <div className="ls-setting-options">
                  <select
                    className="ls-select"
                    value={repeatCount}
                    onChange={e => {
                      const val = Number(e.target.value) as RepeatCount;
                      setRepeatCount(val);
                      saveRepeatSetting(val);
                    }}
                  >
                    {([1, 2, 3, 4, 5] as RepeatCount[]).map(n => (
                      <option key={n} value={n}>{n}次</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ls-setting-group">
                <label className="ls-setting-label">播放顺序</label>
                <div className="ls-setting-options">
                  <button
                    className={`ls-option-btn ${order === 'sequential' ? 'active' : ''}`}
                    onClick={() => handleSetOrder('sequential')}
                  >
                    顺序播放
                  </button>
                  <button
                    className={`ls-option-btn ${order === 'random' ? 'active' : ''}`}
                    onClick={() => handleSetOrder('random')}
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
