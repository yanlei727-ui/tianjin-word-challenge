import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  loadProgress,
  addWrongRecord,
  markWrongCorrect,
} from '../utils/storage';
import { speakWord, stopSpeaking } from '../utils/speech';
import { generateChoiceQuestion } from '../utils/quiz';
import { getModuleWords, type ModuleKey } from '../utils/modules';
import type { QuizQuestion } from '../utils/quiz';

const ROUND_SIZE = 20;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateRound(pool: ReturnType<typeof getModuleWords>, count: number): QuizQuestion[] {
  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  return selected.map((w) => generateChoiceQuestion(w, 'en2cn'));
}

export default function ChoiceQuizPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'all';
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);

  const [progress, setProgress] = useState(loadProgress(module));
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [wrongWords, setWrongWords] = useState<{ word: string; meaning: string }[]>([]);

  const currentQ = questions[qIndex];

  // Initialize questions
  useEffect(() => {
    let pool: typeof allWords;
    if (mode === 'wrong') {
      const wrongIds = new Set(progress.wrongBook.map((r) => r.wordId));
      pool = allWords.filter((w) => wrongIds.has(w.id));
    } else {
      pool = [...allWords];
    }
    setQuestions(generateRound(pool, ROUND_SIZE));
  }, [mode, allWords, progress.wrongBook]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const handleAnswer = useCallback((idx: number) => {
    if (showResult || !currentQ) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const correct = idx === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      setCorrectCount((c) => c + 1);
      markWrongCorrect(currentQ.wordId, module);
    } else {
      setWrongCount((w) => w + 1);
      addWrongRecord(currentQ.wordId, module);
      setWrongWords((prev) => [...prev, { word: currentQ.word, meaning: currentQ.meaning }]);
    }
    speakWord(currentQ.word);
  }, [showResult, currentQ, module]);

  const handleNext = useCallback(() => {
    setShowResult(false);
    setSelectedAnswer(null);
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      setFinished(true);
    }
  }, [qIndex, questions.length]);

  const handleRestart = useCallback(() => {
    let pool: typeof allWords;
    if (mode === 'wrong') {
      const p = loadProgress(module);
      const wrongIds = new Set(p.wrongBook.map((r) => r.wordId));
      pool = allWords.filter((w) => wrongIds.has(w.id));
    } else {
      pool = [...allWords];
    }
    setQuestions(generateRound(pool, ROUND_SIZE));
    setQIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setCorrectCount(0);
    setWrongCount(0);
    setFinished(false);
    setWrongWords([]);
    setProgress(loadProgress(module));
  }, [mode, allWords, module]);

  // Keyboard support
  useEffect(() => {
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
          handleNext();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [showResult, finished, handleAnswer, handleNext]);

  if (questions.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p>{mode === 'wrong' ? '错词本为空，没有可练习的单词' : '暂无可练习的单词'}</p>
          <Link to={`/?module=${module}`} className="btn-action btn-primary" style={{ marginTop: 16 }}>返回首页</Link>
        </div>
      </div>
    );
  }

  if (finished) {
    const accuracy = correctCount + wrongCount > 0
      ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
      : 0;

    return (
      <div className="page">
        <div className="result-card">
          <div className="result-celebration">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}
          </div>
          <h2>本轮练习完成！</h2>
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
            <button className="btn-action btn-primary btn-large" onClick={handleRestart}>
              🔄 再来一轮
            </button>
            <Link to={`/quick-review?module=${module}`} className="btn-action btn-green">
              ⚡ 去识词
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
    <div className="page choice-quiz-page">
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
        <div className="quiz-type-label">🔤 英译中</div>
        <div className="quiz-word">{currentQ.word}</div>
        <div className="quiz-phonetic">{currentQ.phonetic}</div>
        <button className="btn-speak" onClick={() => speakWord(currentQ.word)}>
          🔊 朗读
        </button>

        <div className="quiz-options">
          {currentQ.options?.map((opt, idx) => (
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
            <button className="btn-action btn-primary" onClick={handleNext}>
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
