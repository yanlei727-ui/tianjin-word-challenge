import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  loadProgress,
  markLearned,
  markUnfamiliar,
  addWrongRecord,
  addFavorite,
  removeFavorite,
  isFavorited,
} from '../utils/storage';
import { speakWord, stopSpeaking } from '../utils/speech';
import { getModuleWords, type ModuleKey } from '../utils/modules';

const ROUND_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Phase = 'reveal' | 'graded';

export default function QuickReviewPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'all';
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);

  const [progress, setProgress] = useState(loadProgress(module));
  const [roundWords, setRoundWords] = useState<typeof allWords>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('reveal');
  const [results, setResults] = useState<{ wordId: number; status: 'know' | 'familiar' | 'wrong' }[]>([]);
  const [finished, setFinished] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Initialize round words
  useEffect(() => {
    let pool: typeof allWords;
    if (mode === 'wrong') {
      const wrongIds = new Set(progress.wrongBook.map((r) => r.wordId));
      pool = allWords.filter((w) => wrongIds.has(w.id));
    } else if (mode === 'unfamiliar') {
      const unfIds = new Set(progress.unfamiliar);
      pool = allWords.filter((w) => unfIds.has(w.id));
    } else {
      pool = [...allWords];
    }

    const selected = shuffle(pool).slice(0, Math.min(ROUND_SIZE, pool.length));
    setRoundWords(selected);
  }, [mode, progress.wrongBook, progress.unfamiliar, allWords]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const currentWord = roundWords[currentIndex];

  const handleReveal = useCallback(() => {
    if (phase !== 'reveal') return;
    setPhase('graded');
    if (currentWord) speakWord(currentWord.word);
  }, [phase, currentWord]);

  const handleToggleFavorite = useCallback(() => {
    if (!currentWord) return;
    if (isFavorited(currentWord.id, module)) {
      removeFavorite(currentWord.id, module);
    } else {
      addFavorite(currentWord.id, module);
    }
  }, [currentWord, module]);

  const handleGrade = useCallback((status: 'know' | 'familiar' | 'wrong') => {
    if (!currentWord) return;

    if (status === 'know') {
      markLearned(currentWord.id, module);
    } else if (status === 'familiar') {
      markUnfamiliar(currentWord.id, module);
    } else {
      addWrongRecord(currentWord.id, module);
    }

    const newResults = [...results, { wordId: currentWord.id, status }];
    setResults(newResults);

    const p = loadProgress(module);
    setProgress(p);

    if (currentIndex >= roundWords.length - 1) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setPhase('reveal');
    }
  }, [currentWord, currentIndex, roundWords.length, results, module]);

  // Touch swipe handling
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0 && phase === 'graded' && currentIndex < roundWords.length - 1) {
        // Swipe left → next
        setCurrentIndex((i) => i + 1);
        setPhase('reveal');
      } else if (diff < 0 && currentIndex > 0) {
        // Swipe right → prev
        setCurrentIndex((i) => i - 1);
        setPhase('reveal');
      }
    }
    setTouchStart(null);
  }, [touchStart, phase, currentIndex, roundWords.length]);

  // Keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (phase === 'reveal') {
          handleReveal();
        }
      }
      if (phase === 'graded') {
        if (e.key === '1') handleGrade('know');
        if (e.key === '2') handleGrade('familiar');
        if (e.key === '3') handleGrade('wrong');
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phase, handleReveal, handleGrade]);

  if (roundWords.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>{mode === 'wrong' ? '错词本为空' : mode === 'unfamiliar' ? '没有标记不熟的单词' : '暂无可练习的单词'}</p>
          <p className="empty-hint">
            {mode === 'wrong' ? '答题做错的单词会自动添加到这里' : '请先学习一些单词'}
          </p>
          <Link to={`/?module=${module}`} className="btn-action btn-primary" style={{ marginTop: 16 }}>返回首页</Link>
        </div>
      </div>
    );
  }

  if (finished) {
    const knowCount = results.filter((r) => r.status === 'know').length;
    const familiarCount = results.filter((r) => r.status === 'familiar').length;
    const wrongCount = results.filter((r) => r.status === 'wrong').length;
    const accuracy = Math.round((knowCount / results.length) * 100);

    return (
      <div className="page">
        <div className="result-card">
          <div className="result-celebration">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}
          </div>
          <h2>本轮完成！</h2>
          <div className="result-score">{accuracy}%</div>
          <div className="result-details">
            <div>✅ 认识：{knowCount} 词</div>
            <div>🤔 模糊：{familiarCount} 词</div>
            <div>❌ 不认识：{wrongCount} 词</div>
          </div>
          {wrongCount > 0 && (
            <div className="result-tip">
              {wrongCount} 个不认识的单词已加入错词本，去选择练习巩固一下吧！
            </div>
          )}
          <div className="result-actions">
            <button className="btn-action btn-primary btn-large" onClick={() => {
              const pool = mode === 'wrong'
                ? allWords.filter((w) => loadProgress(module).wrongBook.some((r) => r.wordId === w.id))
                : mode === 'unfamiliar'
                ? allWords.filter((w) => loadProgress(module).unfamiliar.includes(w.id))
                : [...allWords];
              setRoundWords(shuffle(pool).slice(0, Math.min(ROUND_SIZE, pool.length)));
              setCurrentIndex(0);
              setPhase('reveal');
              setResults([]);
              setFinished(false);
              setProgress(loadProgress(module));
            }}>
              🔄 再来一轮
            </button>
            <Link to={`/choice-quiz?module=${module}`} className="btn-action btn-orange">
              📝 去做选择题
            </Link>
            <Link to={`/?module=${module}`} className="btn-action">
              返回首页
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page quick-review-page">
      <div className="learn-progress-bar">
        <span>{currentIndex + 1} / {roundWords.length}</span>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / roundWords.length) * 100}%` }}
          />
        </div>
      </div>

      <div
        ref={cardRef}
        className={`qr-card ${phase === 'graded' ? 'flipped' : ''}`}
        onClick={phase === 'reveal' ? handleReveal : undefined}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="qr-card-inner">
          {/* Front: English word */}
          <div className="qr-card-front">
            {currentWord && (
              <button
                className={`btn-favorite ${isFavorited(currentWord.id, module) ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite();
                }}
                title={isFavorited(currentWord.id, module) ? '取消收藏' : '收藏重点词'}
              >
                {isFavorited(currentWord.id, module) ? '⭐' : '☆'}
              </button>
            )}
            <div className="qr-word">{currentWord?.word}</div>
            <div className="qr-phonetic">{currentWord?.phonetic}</div>
            <div className="qr-pos">{currentWord?.partOfSpeech}</div>
            <div className="qr-hint">点击任意位置查看释义</div>
          </div>

          {/* Back: Chinese meaning */}
          {phase === 'graded' && (
            <div className="qr-card-back">
              <div className="qr-word">{currentWord?.word}</div>
              <div className="qr-meaning">{currentWord?.meaning}</div>
              {currentWord?.note && (
                <div className="qr-note">💡 {currentWord.note}</div>
              )}
              {currentWord?.example && (
                <div className="qr-example">
                  <div className="qr-example-en">{currentWord.example}</div>
                  <div className="qr-example-zh">{currentWord.exampleZh}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {phase === 'graded' && (
        <div className="qr-actions">
          <button
            className="btn-action btn-green btn-large qr-btn"
            onClick={() => handleGrade('know')}
          >
            ✅ 认识
          </button>
          <button
            className="btn-action btn-orange btn-large qr-btn"
            onClick={() => handleGrade('familiar')}
          >
            🤔 模糊
          </button>
          <button
            className="btn-action btn-red btn-large qr-btn"
            onClick={() => handleGrade('wrong')}
          >
            ❌ 不认识
          </button>
        </div>
      )}

      {phase === 'reveal' && (
        <div className="qr-actions">
          <button
            className="btn-action btn-primary btn-large"
            onClick={handleReveal}
            style={{ flex: 1 }}
          >
            👆 点击查看释义
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="challenge-score-bar">
          <span className="score-correct">✅ {results.filter((r) => r.status === 'know').length}</span>
          <span style={{ color: 'var(--orange)' }}>🤔 {results.filter((r) => r.status === 'familiar').length}</span>
          <span className="score-wrong">❌ {results.filter((r) => r.status === 'wrong').length}</span>
        </div>
      )}

      <div className="qr-tips">
        <span>💡 滑动切换 · 键盘 1=认识 2=模糊 3=不认识</span>
      </div>
    </div>
  );
}
