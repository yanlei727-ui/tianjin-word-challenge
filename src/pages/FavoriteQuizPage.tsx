import { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  loadFavorites,
  loadProgress,
  addWrongRecord,
  markWrongCorrect,
  markMastered,
  type FavoriteRecord,
} from '../utils/storage';
import { speakWord, stopSpeaking } from '../utils/speech';
import { getModuleInfo, getModuleWords, type ModuleKey } from '../utils/modules';

// Types
type QuizMode = null | 'quiz' | 'flashcard';

interface QuizQuestion {
  wordId: number;
  module: ModuleKey;
  word: string;
  meaning: string;
  phonetic: string;
  options: string[];
  correctIndex: number;
}

interface FavoriteWord extends FavoriteRecord {
  word: string;
  phonetic: string;
  meaning: string;
  partOfSpeech: string;
}

interface Stats {
  total: number;
  mastered: number;
  toReview: number;
  learned: number;
}

// Utils
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  return shuffle(filtered).slice(0, count);
}

// Get all words from all modules for generating distractors
function getAllWords() {
  const modules: ModuleKey[] = ['noun', 'adj_adv', 'verb'];
  const allWords: { word: string; meaning: string; phonetic: string; module: ModuleKey }[] = [];
  for (const m of modules) {
    const words = getModuleWords(m);
    words.forEach((w) => allWords.push({ word: w.word, meaning: w.meaning, phonetic: w.phonetic, module: m }));
  }
  return allWords;
}

function generateFavoriteQuestion(
  targetWord: FavoriteWord,
  allWords: ReturnType<typeof getAllWords>
): QuizQuestion {
  const distractors = pickRandom(allWords, 3, targetWord).map((w) => w.meaning);
  const options = shuffle([targetWord.meaning, ...distractors]);
  return {
    wordId: targetWord.wordId,
    module: targetWord.module,
    word: targetWord.word,
    meaning: targetWord.meaning,
    phonetic: targetWord.phonetic,
    options,
    correctIndex: options.indexOf(targetWord.meaning),
  };
}

// Main Component
export default function FavoriteQuizPage() {
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(loadFavorites());
  const [mode, setMode] = useState<QuizMode>(null);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongWords, setWrongWords] = useState<{ word: string; meaning: string }[]>([]);

  // Flashcard state
  const [flashIndex, setFlashIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [flashResults, setFlashResults] = useState<{ wordId: number; known: boolean }[]>([]);

  const allWords = getAllWords();

  // Get favorite words with data
  const favoriteWords: FavoriteWord[] = favorites.map((fav) => {
    const words = getModuleWords(fav.module);
    const wordData = words.find((w) => w.id === fav.wordId);
    if (!wordData) return null;
    return {
      ...fav,
      word: wordData.word,
      phonetic: wordData.phonetic,
      meaning: wordData.meaning,
      partOfSpeech: wordData.partOfSpeech,
    };
  }).filter(Boolean) as FavoriteWord[];

  // Stats
  const stats: Stats = {
    total: favoriteWords.length,
    mastered: favoriteWords.filter((w) => {
      const progress = loadProgress(w.module);
      return progress.mastered.includes(w.wordId);
    }).length,
    toReview: favoriteWords.filter((w) => {
      const progress = loadProgress(w.module);
      return progress.wrongBook.some((r) => r.wordId === w.wordId);
    }).length,
    learned: favoriteWords.filter((w) => {
      const progress = loadProgress(w.module);
      return progress.learned.includes(w.wordId);
    }).length,
  };

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Generate quiz questions
  const startQuiz = useCallback(() => {
    if (favoriteWords.length === 0) return;
    const qs = shuffle(favoriteWords).map((w) => generateFavoriteQuestion(w, allWords));
    setQuestions(qs);
    setQIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setWrongCount(0);
    setFinished(false);
    setWrongWords([]);
    setMode('quiz');
  }, [favoriteWords, allWords]);

  // Start flashcard
  const startFlashcard = useCallback(() => {
    if (favoriteWords.length === 0) return;
    setFlashIndex(0);
    setShowBack(false);
    setFlashResults([]);
    setFinished(false);
    setMode('flashcard');
  }, [favoriteWords]);

  const currentQ = questions[qIndex];
  const currentFlash = favoriteWords[flashIndex];

  // Handle quiz answer
  const handleAnswer = useCallback((idx: number) => {
    if (showResult || !currentQ) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const correct = idx === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((c) => c + 1);
      markWrongCorrect(currentQ.wordId, currentQ.module);
    } else {
      setWrongCount((w) => w + 1);
      addWrongRecord(currentQ.wordId, currentQ.module);
      setWrongWords((prev) => [...prev, { word: currentQ.word, meaning: currentQ.meaning }]);
    }
    speakWord(currentQ.word);
  }, [showResult, currentQ]);

  const handleNextQuestion = useCallback(() => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }, [qIndex, questions.length]);

  // Handle flashcard
  const handleFlashKnow = useCallback(() => {
    if (!currentFlash) return;
    setFlashResults((prev) => [...prev, { wordId: currentFlash.wordId, known: true }]);
    markMastered(currentFlash.wordId, currentFlash.module);

    if (flashIndex < favoriteWords.length - 1) {
      setFlashIndex((i) => i + 1);
      setShowBack(false);
    } else {
      setFinished(true);
    }
  }, [currentFlash, flashIndex, favoriteWords.length]);

  const handleFlashDontKnow = useCallback(() => {
    if (!currentFlash) return;
    setFlashResults((prev) => [...prev, { wordId: currentFlash.wordId, known: false }]);
    addWrongRecord(currentFlash.wordId, currentFlash.module);

    if (flashIndex < favoriteWords.length - 1) {
      setFlashIndex((i) => i + 1);
      setShowBack(false);
    } else {
      setFinished(true);
    }
  }, [currentFlash, flashIndex, favoriteWords.length]);

  // Keyboard support for quiz
  useEffect(() => {
    if (mode !== 'quiz') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (finished) return;
      if (!showResult) {
        if (e.key >= '1' && e.key <= '4') {
          handleAnswer(parseInt(e.key) - 1);
        }
        if (e.key === 'a' || e.key === 'A') handleAnswer(0);
        if (e.key === 'b' || e.key === 'B') handleAnswer(1);
        if (e.key === 'c' || e.key === 'C') handleAnswer(2);
        if (e.key === 'd' || e.key === 'D') handleAnswer(3);
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNextQuestion();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showResult, finished, mode, handleAnswer, handleNextQuestion]);

  // Keyboard support for flashcard
  useEffect(() => {
    if (mode !== 'flashcard' || finished) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (!showBack) {
          setShowBack(true);
          if (currentFlash) speakWord(currentFlash.word);
        }
      }
      if (showBack) {
        if (e.key === '1' || e.key === 'y' || e.key === 'Y') {
          handleFlashKnow();
        }
        if (e.key === '2' || e.key === 'n' || e.key === 'N') {
          handleFlashDontKnow();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showBack, finished, mode, currentFlash, handleFlashKnow, handleFlashDontKnow]);

  const handleRestart = () => {
    setMode(null);
    setFinished(false);
    setFavorites(loadFavorites());
  };

  // Empty state
  if (favoriteWords.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <p>还没有收藏重点词</p>
          <p className="empty-hint">在学习页面点击 ☆ 收藏重点词</p>
          <Link to="/" className="btn-action btn-primary" style={{ marginTop: 16 }}>
            去学习
          </Link>
        </div>
      </div>
    );
  }

  // Mode selection
  if (!mode) {
    return (
      <div className="page favorite-quiz-page">
        <div className="favorite-quiz-header">
          <h2>⭐ 重点词训练</h2>
          <p className="favorite-quiz-subtitle">基于你的收藏词进行专项训练</p>
        </div>

        {/* Stats */}
        <div className="favorite-stats">
          <div className="favorite-stat-card">
            <div className="favorite-stat-number">{stats.total}</div>
            <div className="favorite-stat-label">收藏总数</div>
          </div>
          <div className="favorite-stat-card">
            <div className="favorite-stat-number">{stats.mastered}</div>
            <div className="favorite-stat-label">已掌握</div>
          </div>
          <div className="favorite-stat-card">
            <div className="favorite-stat-number">{stats.toReview}</div>
            <div className="favorite-stat-label">待复习</div>
          </div>
        </div>

        {/* Mode selection */}
        <div className="favorite-mode-cards">
          <button className="favorite-mode-card" onClick={startQuiz}>
            <div className="favorite-mode-icon">📝</div>
            <div className="favorite-mode-title">英文选中文</div>
            <div className="favorite-mode-desc">四选一选择题训练</div>
          </button>
          <button className="favorite-mode-card" onClick={startFlashcard}>
            <div className="favorite-mode-icon">🃏</div>
            <div className="favorite-mode-title">闪卡复习</div>
            <div className="favorite-mode-desc">翻卡记忆，标记掌握情况</div>
          </button>
        </div>

        {/* Word list preview */}
        <div className="favorite-words-preview">
          <h3>收藏词列表 ({favoriteWords.length})</h3>
          <div className="favorite-preview-list">
            {favoriteWords.slice(0, 10).map((w) => (
              <div key={`${w.module}-${w.wordId}`} className="favorite-preview-item">
                <span className="preview-word">{w.word}</span>
                <span className="preview-meaning">{w.meaning}</span>
                <span className="preview-module">{getModuleInfo(w.module).icon}</span>
              </div>
            ))}
            {favoriteWords.length > 10 && (
              <div className="favorite-preview-more">
                还有 {favoriteWords.length - 10} 个词...
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz finished
  if (finished && mode === 'quiz') {
    const accuracy = correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

    return (
      <div className="page">
        <div className="result-card">
          <div className="result-celebration">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}
          </div>
          <h2>训练完成！</h2>
          <div className="result-score">{accuracy}%</div>
          <div className="result-details">
            <div>✅ 答对：{correctCount} 题</div>
            <div>❌ 答错：{wrongCount} 题</div>
            <div>📊 正确率：{accuracy}%</div>
          </div>

          {wrongWords.length > 0 && (
            <div className="wrong-review-section">
              <h3>答错的单词：</h3>
              <div className="wrong-review-list">
                {wrongWords.map((w, i) => (
                  <div key={i} className="wrong-review-item">
                    <span className="wr-word">{w.word}</span>
                    <span className="wr-meaning">{w.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="result-actions">
            <button className="btn-action btn-primary btn-large" onClick={startQuiz}>
              🔄 再来一轮
            </button>
            <button className="btn-action btn-green" onClick={startFlashcard}>
              🃏 闪卡复习
            </button>
            <button className="btn-action" onClick={handleRestart}>
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Flashcard finished
  if (finished && mode === 'flashcard') {
    const knownCount = flashResults.filter((r) => r.known).length;
    const unknownCount = flashResults.filter((r) => !r.known).length;

    return (
      <div className="page">
        <div className="result-card">
          <div className="result-celebration">
            {unknownCount === 0 ? '🎉' : knownCount > unknownCount ? '💪' : '📚'}
          </div>
          <h2>闪卡复习完成！</h2>
          <div className="result-score">
            {Math.round((knownCount / flashResults.length) * 100)}%
          </div>
          <div className="result-details">
            <div>✅ 掌握：{knownCount} 词</div>
            <div>❌ 需复习：{unknownCount} 词</div>
          </div>

          {unknownCount > 0 && (
            <div className="result-tip">
              {unknownCount} 个单词已加入错词本，继续加油！
            </div>
          )}

          <div className="result-actions">
            <button className="btn-action btn-primary btn-large" onClick={startFlashcard}>
              🔄 再来一轮
            </button>
            <button className="btn-action btn-orange" onClick={startQuiz}>
              📝 做选择题
            </button>
            <button className="btn-action" onClick={handleRestart}>
              返回
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Quiz mode
  if (mode === 'quiz' && currentQ) {
    return (
      <div className="page favorite-quiz-page">
        <div className="learn-progress-bar">
          <span>{qIndex + 1} / {questions.length}</span>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="quiz-card">
          <div className="quiz-type-label">📝 英译中</div>
          <div className="quiz-word">{currentQ.word}</div>
          <div className="quiz-phonetic">{currentQ.phonetic}</div>
          <button className="btn-speak" onClick={() => speakWord(currentQ.word)}>
            🔊 朗读
          </button>

          <div className="quiz-options">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                className={`quiz-option ${
                  selectedAnswer !== null
                    ? idx === currentQ.correctIndex
                      ? 'correct'
                      : idx === selectedAnswer && !isCorrect
                      ? 'wrong'
                      : 'disabled'
                    : ''
                }`}
                onClick={() => handleAnswer(idx)}
                disabled={showResult}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="option-text">{opt}</span>
              </button>
            ))}
          </div>

          {showResult && (
            <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? '✅ 回答正确！' : `❌ 正确答案是：${currentQ.meaning}`}
            </div>
          )}

          <div className="quiz-score-bar">
            <span className="score-correct">✅ {correctCount}</span>
            <span className="score-wrong">❌ {wrongCount}</span>
          </div>

          {showResult && (
            <div className="quiz-actions">
              <button className="btn-action btn-primary" onClick={handleNextQuestion}>
                {qIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
              </button>
            </div>
          )}
        </div>

        <div className="qr-tips">
          <span>💡 键盘 A/B/C/D 或 1/2/3/4 选择 · Enter 下一题</span>
        </div>
      </div>
    );
  }

  // Flashcard mode
  if (mode === 'flashcard' && currentFlash) {
    return (
      <div className="page favorite-quiz-page">
        <div className="learn-progress-bar">
          <span>{flashIndex + 1} / {favoriteWords.length}</span>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((flashIndex + 1) / favoriteWords.length) * 100}%` }}
            />
          </div>
        </div>

        <div
          className={`qr-card ${showBack ? 'flipped' : ''}`}
          onClick={!showBack ? () => { setShowBack(true); speakWord(currentFlash.word); } : undefined}
        >
          <div className="qr-card-inner">
            <div className="qr-card-front">
              <button
                className="btn-favorite active"
                onClick={(e) => {
                  e.stopPropagation();
                }}
                title="重点词"
              >
                ⭐
              </button>
              <div className="qr-word">{currentFlash.word}</div>
              <div className="qr-phonetic">{currentFlash.phonetic}</div>
              <div className="qr-pos">{currentFlash.partOfSpeech}</div>
              <div className="qr-hint">点击任意位置查看释义</div>
            </div>

            {showBack && (
              <div className="qr-card-back">
                <div className="qr-word">{currentFlash.word}</div>
                <div className="qr-meaning">{currentFlash.meaning}</div>
                <div className="qr-example" style={{ marginTop: 16 }}>
                  <span style={{ color: 'var(--primary)' }}>
                    {getModuleInfo(currentFlash.module).icon} {getModuleInfo(currentFlash.module).label}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showBack && (
          <div className="qr-actions">
            <button
              className="btn-action btn-green btn-large qr-btn"
              onClick={handleFlashKnow}
            >
              ✅ 掌握
            </button>
            <button
              className="btn-action btn-red btn-large qr-btn"
              onClick={handleFlashDontKnow}
            >
              ❌ 不会
            </button>
          </div>
        )}

        {!showBack && (
          <div className="qr-actions">
            <button
              className="btn-action btn-primary btn-large"
              onClick={() => { setShowBack(true); speakWord(currentFlash.word); }}
              style={{ flex: 1 }}
            >
              👆 点击查看释义
            </button>
          </div>
        )}

        <div className="qr-tips">
          <span>💡 空格翻卡 · 1=掌握 2=不会</span>
        </div>
      </div>
    );
  }

  return null;
}
