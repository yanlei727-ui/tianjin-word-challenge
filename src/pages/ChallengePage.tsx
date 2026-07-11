import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import words from '../data/words.json';
import {
  loadProgress,
  saveLevelScore,
  addWrongRecord,
  markWrongCorrect,
  saveProgress,
} from '../utils/storage';
import { generateLevelQuiz, generateWrongBookQuiz } from '../utils/quiz';
import { speakWord, speakSentence, stopSpeaking } from '../utils/speech';
import type { QuizQuestion } from '../utils/quiz';

const TOTAL_LEVELS = 14;

function getLevelWordIds(level: number): number[] {
  const start = (level - 1) * 10 + 1;
  const end = level === 14 ? 136 : level * 10;
  return words.filter((w) => w.id >= start && w.id <= end).map((w) => w.id);
}

type Phase = 'select' | 'learn' | 'quiz' | 'spell' | 'result';

export default function ChallengePage() {
  const [progress, setProgress] = useState(loadProgress());
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('select');
  const [learnIndex, setLearnIndex] = useState(0);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [spellInput, setSpellInput] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [freeMode, setFreeMode] = useState(false);
  const [wrongQuizMode, setWrongQuizMode] = useState(false);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  const isLevelUnlocked = (level: number) => {
    if (freeMode) return true;
    if (level === 1) return true;
    const prev = progress.levelScores[level - 1];
    return prev?.completed === true;
  };

  const startLevel = (level: number) => {
    setSelectedLevel(level);
    setPhase('learn');
    setLearnIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setQIndex(0);
    setSelectedAnswer(null);
    setSpellInput('');
    setShowResult(false);
    setWrongQuizMode(false);

    const wordIds = getLevelWordIds(level);
    const qs = generateLevelQuiz(wordIds);
    setQuestions(qs);
  };

  const startWrongQuiz = () => {
    const wrongIds = progress.wrongBook.map((r) => r.wordId);
    if (wrongIds.length === 0) return;
    const qs = generateWrongBookQuiz(wrongIds);
    setQuestions(qs);
    setQIndex(0);
    setCorrectCount(0);
    setWrongCount(0);
    setSelectedAnswer(null);
    setSpellInput('');
    setShowResult(false);
    setPhase('quiz');
    setWrongQuizMode(true);
    setSelectedLevel(null);
  };

  const levelWords = selectedLevel ? getLevelWordIds(selectedLevel).map((id) => words.find((w) => w.id === id)!) : [];

  const finishLearn = () => {
    setPhase('quiz');
    setQIndex(0);
    setSelectedAnswer(null);
    setSpellInput('');
    setShowResult(false);
  };

  const currentQ = questions[qIndex];

  const handleChoiceAnswer = (idx: number) => {
    if (showResult) return;
    setSelectedAnswer(idx);
    setShowResult(true);
    const correct = idx === currentQ.correctIndex;
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
      markWrongCorrect(currentQ.wordId);
    } else {
      setWrongCount((w) => w + 1);
      addWrongRecord(currentQ.wordId);
    }
  };

  const handleSpellSubmit = () => {
    if (showResult) return;
    setShowResult(true);
    const correct = spellInput.trim().toLowerCase() === currentQ.word.toLowerCase();
    setIsCorrect(correct);
    if (correct) {
      setCorrectCount((c) => c + 1);
      markWrongCorrect(currentQ.wordId);
    } else {
      setWrongCount((w) => w + 1);
      addWrongRecord(currentQ.wordId);
    }
  };

  const handleNextQuestion = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setSpellInput('');
    if (qIndex < questions.length - 1) {
      setQIndex((i) => i + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const total = correctCount + wrongCount;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const stars = score >= 100 ? 3 : score >= 90 ? 2 : score >= 80 ? 1 : 0;

    if (selectedLevel && !wrongQuizMode) {
      const p = saveLevelScore(selectedLevel, score, stars);
      // Check if day 1 or day 2 is completed
      const day1Levels = Object.entries(p.levelScores)
        .filter(([l, s]) => Number(l) <= 7 && s.completed)
        .length;
      const day2Levels = Object.entries(p.levelScores)
        .filter(([l, s]) => Number(l) >= 8 && s.completed)
        .length;
      if (day1Levels >= 7) p.dayProgress.day1 = true;
      if (day2Levels >= 7) p.dayProgress.day2 = true;
      saveProgress(p);
      setProgress(p);
    }

    setPhase('result');
  };

  const renderSelect = () => (
    <div className="challenge-select">
      <div className="challenge-header">
        <h2>🎯 闯关模式</h2>
        <p>共 {TOTAL_LEVELS} 关，每关10个单词（最后一关6个）</p>
      </div>

      <div className="challenge-toggle">
        <label className="toolbar-toggle">
          <input
            type="checkbox"
            checked={freeMode}
            onChange={(e) => setFreeMode(e.target.checked)}
          />
          自由学习模式（解锁全部关卡）
        </label>
      </div>

      {progress.wrongBook.length > 0 && (
        <div className="wrong-quiz-banner">
          <span>📝 错题本中有 {progress.wrongBook.length} 个错词</span>
          <button className="btn-action btn-orange" onClick={startWrongQuiz}>
            错词专项练习
          </button>
        </div>
      )}

      <div className="level-grid">
        {Array.from({ length: TOTAL_LEVELS }, (_, i) => i + 1).map((level) => {
          const unlocked = isLevelUnlocked(level);
          const score = progress.levelScores[level];
          const wordCount = level === 14 ? 6 : 10;
          return (
            <button
              key={level}
              className={`level-card ${unlocked ? '' : 'locked'} ${score?.completed ? 'completed' : ''}`}
              onClick={() => unlocked && startLevel(level)}
              disabled={!unlocked}
            >
              <div className="level-number">第 {level} 关</div>
              <div className="level-words">{wordCount} 个单词</div>
              {score && (
                <div className="level-score">
                  <span className="level-stars">
                    {'⭐'.repeat(score.stars)}
                  </span>
                  <span>{score.score}分</span>
                </div>
              )}
              {!unlocked && <div className="level-lock">🔒</div>}
              {score?.completed && <div className="level-check">✅</div>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderLearn = () => (
    <div className="challenge-learn">
      <div className="challenge-phase-header">
        <span className="phase-label">📖 第一阶段：认识单词</span>
        <span>{learnIndex + 1} / {levelWords.length}</span>
      </div>
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${((learnIndex + 1) / levelWords.length) * 100}%` }}
        />
      </div>

      {levelWords[learnIndex] && (
        <div className="word-card">
          <div className="word-card-header">
            <h2 className="word-english">{levelWords[learnIndex].word}</h2>
            <button
              className="btn-speak"
              onClick={() => speakWord(levelWords[learnIndex].word)}
            >
              🔊
            </button>
          </div>
          <div className="word-phonetic">{levelWords[learnIndex].phonetic}</div>
          <div className="word-pos">{levelWords[learnIndex].partOfSpeech}</div>
          <div className="word-meaning">{levelWords[learnIndex].meaning}</div>
          {levelWords[learnIndex].note && (
            <div className="word-note">💡 {levelWords[learnIndex].note}</div>
          )}
          {levelWords[learnIndex].example && (
            <div className="word-example">
              <div className="example-en">
                <span>{levelWords[learnIndex].example}</span>
                <button
                  className="btn-speak-sm"
                  onClick={() => speakSentence(levelWords[learnIndex].example)}
                >
                  🔊
                </button>
              </div>
              <div className="example-zh">{levelWords[learnIndex].exampleZh}</div>
            </div>
          )}
        </div>
      )}

      <div className="challenge-nav">
        <button
          className="btn-nav"
          onClick={() => setLearnIndex((i) => Math.max(0, i - 1))}
          disabled={learnIndex === 0}
        >
          ← 上一个
        </button>
        {learnIndex < levelWords.length - 1 ? (
          <button
            className="btn-action btn-primary"
            onClick={() => setLearnIndex((i) => i + 1)}
          >
            下一个 →
          </button>
        ) : (
          <button className="btn-action btn-green" onClick={finishLearn}>
            开始答题 →
          </button>
        )}
      </div>
    </div>
  );

  const renderQuiz = () => {
    if (!currentQ) return null;

    if (currentQ.type === 'spell') {
      return (
        <div className="challenge-quiz">
          <div className="challenge-phase-header">
            <span className="phase-label">
              {wrongQuizMode ? '📝 错词专项练习' : `🎯 第${selectedLevel}关`}
            </span>
            <span>拼写题 {qIndex + 1} / {questions.length}</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-bar-fill"
              style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="quiz-card">
            <div className="quiz-type-label">✏️ 拼写题</div>
            <div className="quiz-prompt-meaning">{currentQ.meaning}</div>
            <div className="quiz-prompt-phonetic">{currentQ.phonetic}</div>
            <button
              className="btn-speak"
              onClick={() => speakWord(currentQ.word)}
            >
              🔊 听朗读
            </button>

            <div className="spell-input-area">
              <input
                type="text"
                className={`spell-input ${showResult ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                value={spellInput}
                onChange={(e) => setSpellInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSpellSubmit()}
                placeholder="输入英文单词..."
                disabled={showResult}
                autoFocus
              />
            </div>

            {showResult && (
              <div className={`quiz-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
                {isCorrect ? '✅ 回答正确！继续保持。' : `❌ 正确答案是：${currentQ.word}`}
              </div>
            )}

            <div className="quiz-score-bar">
              <span className="score-correct">✅ {correctCount}</span>
              <span className="score-wrong">❌ {wrongCount}</span>
            </div>

            <div className="quiz-actions">
              {!showResult ? (
                <button className="btn-action btn-primary" onClick={handleSpellSubmit}>
                  提交答案
                </button>
              ) : (
                <button className="btn-action btn-primary" onClick={handleNextQuestion}>
                  {qIndex < questions.length - 1 ? '下一题 →' : '查看结果'}
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="challenge-quiz">
        <div className="challenge-phase-header">
          <span className="phase-label">
            {wrongQuizMode ? '📝 错词专项练习' : `🎯 第${selectedLevel}关`}
          </span>
          <span>
            {currentQ.type === 'en2cn' && '英译中'}
            {currentQ.type === 'cn2en' && '中译英'}
            {currentQ.type === 'listen' && '听音选词'}
            {' '} {qIndex + 1} / {questions.length}
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((qIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        <div className="quiz-card">
          {currentQ.type === 'en2cn' && (
            <>
              <div className="quiz-type-label">🔤 英译中</div>
              <div className="quiz-word">{currentQ.word}</div>
              <button className="btn-speak" onClick={() => speakWord(currentQ.word)}>
                🔊 朗读
              </button>
            </>
          )}
          {currentQ.type === 'cn2en' && (
            <>
              <div className="quiz-type-label">🔤 中译英</div>
              <div className="quiz-word-cn">{currentQ.meaning}</div>
            </>
          )}
          {currentQ.type === 'listen' && (
            <>
              <div className="quiz-type-label">🎧 听音选词</div>
              <button
                className="btn-speak btn-large-speak"
                onClick={() => speakWord(currentQ.word)}
              >
                🔊 点击播放
              </button>
            </>
          )}

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
                onClick={() => handleChoiceAnswer(idx)}
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
              {isCorrect ? '✅ 回答正确！继续保持。' : `❌ 再想一想。正确答案是：${currentQ.type === 'en2cn' ? currentQ.meaning : currentQ.word}`}
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
      </div>
    );
  };

  const renderResult = () => {
    const total = correctCount + wrongCount;
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const stars = score >= 100 ? 3 : score >= 90 ? 2 : score >= 80 ? 1 : 0;
    const passed = score >= 80;

    return (
      <div className="challenge-result">
        <div className="result-card">
          {passed && (
            <div className="result-celebration">
              🎉
            </div>
          )}
          <h2>{passed ? `太棒了！你已完成第${selectedLevel || ''}关！` : '继续努力！'}</h2>
          <div className="result-stars">
            {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
          </div>
          <div className="result-score">{score}分</div>
          <div className="result-details">
            <div>✅ 答对：{correctCount} 题</div>
            <div>❌ 答错：{wrongCount} 题</div>
            <div>📊 正确率：{score}%</div>
          </div>
          {!passed && (
            <div className="result-tip">
              正确率达到 80% 即可过关，再练一次吧！
            </div>
          )}
          <div className="result-actions">
            {!passed && selectedLevel && (
              <button className="btn-action btn-primary" onClick={() => startLevel(selectedLevel)}>
                再练一次
              </button>
            )}
            <Link to="/wrongbook" className="btn-action btn-orange">
              查看错题本
            </Link>
            <button className="btn-action" onClick={() => { setPhase('select'); setSelectedLevel(null); }}>
              返回关卡
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="page challenge-page">
      {phase === 'select' && renderSelect()}
      {phase === 'learn' && renderLearn()}
      {phase === 'quiz' && renderQuiz()}
      {phase === 'result' && renderResult()}
    </div>
  );
}
