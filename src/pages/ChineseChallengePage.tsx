import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { speakWord } from '../utils/speech';
import {
  saveChallengeRecord,
  loadChallengeRecords,
  type ChallengeRecord,
} from '../utils/storage';
import { getModuleWords, type ModuleKey } from '../utils/modules';

const ROUND_SIZE = 10;

export default function ChineseChallengePage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);

  const [roundWords] = useState(() => {
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, ROUND_SIZE).sort((a, b) => a.id - b.id);
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<'input' | 'reveal' | 'graded'>('input');
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState<{ wordId: number; correct: boolean }[]>([]);
  const [history, setHistory] = useState<ChallengeRecord[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentWord = roundWords[currentIndex];
  const finished = currentIndex >= ROUND_SIZE;

  useEffect(() => {
    setHistory(loadChallengeRecords());
  }, []);

  useEffect(() => {
    if (!finished && phase === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, finished, phase]);

  const handleSubmit = useCallback(() => {
    if (!currentWord || phase !== 'input') return;
    if (!input.trim()) return;
    setPhase('reveal');
  }, [input, currentWord, phase]);

  const handleGrade = useCallback(
    (correct: boolean) => {
      setIsCorrect(correct);
      setPhase('graded');

      const newResults = [...results, { wordId: currentWord.id, correct }];
      setResults(newResults);

      if (currentIndex === ROUND_SIZE - 1) {
        const correctCount = newResults.filter((r) => r.correct).length;
        const record: ChallengeRecord = {
          date: new Date().toISOString(),
          total: ROUND_SIZE,
          correct: correctCount,
          accuracy: Math.round((correctCount / ROUND_SIZE) * 100),
          words: newResults,
        };
        saveChallengeRecord(record);
        setHistory(loadChallengeRecords());
      }
    },
    [currentWord, results, currentIndex]
  );

  const handleNext = useCallback(() => {
    setInput('');
    setPhase('input');
    setIsCorrect(false);
    setCurrentIndex((i) => i + 1);
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setInput('');
    setPhase('input');
    setIsCorrect(false);
    setResults([]);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (phase === 'input' && input.trim()) {
          handleSubmit();
        } else if (phase === 'graded') {
          handleNext();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phase, input, handleSubmit, handleNext]);

  if (finished) {
    const correctCount = results.filter((r) => r.correct).length;
    const accuracy = Math.round((correctCount / ROUND_SIZE) * 100);

    return (
      <div className="page">
        <div className="result-card">
          <div className="result-celebration">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}
          </div>
          <h2>本轮完成！</h2>
          <div className="result-score">{accuracy}%</div>
          <div className="result-details">
            <span>本轮：{ROUND_SIZE} 题</span>
            <span>答对：{correctCount} 题</span>
            <span>正确率：{accuracy}%</span>
          </div>
          {accuracy < 80 && (
            <div className="result-tip">继续加油！多练习几次就能掌握了。</div>
          )}
          <div className="result-actions">
            <button className="btn-action btn-primary btn-large" onClick={handleRestart}>
              🔄 再来一轮
            </button>
          </div>
        </div>

        {history.length > 1 && (
          <div className="progress-details" style={{ marginTop: 16 }}>
            <h3>最近训练记录</h3>
            <div className="challenge-history">
              {history.slice(0, 5).map((r, i) => (
                <div key={i} className="history-row">
                  <span className="history-date">
                    {new Date(r.date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="history-score">
                    {r.correct}/{r.total} ({r.accuracy}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page">
      <div className="learn-progress-bar">
        <span>{currentIndex + 1} / {ROUND_SIZE}</span>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / ROUND_SIZE) * 100}%` }}
          />
        </div>
      </div>

      <div className="challenge-card">
        <div className="challenge-word-display">
          <h2 className="challenge-english">{currentWord.word}</h2>
          <button
            className="btn-speak"
            onClick={() => speakWord(currentWord.word)}
            title="朗读单词"
          >
            🔊
          </button>
        </div>

        {phase === 'input' && (
          <>
            <div className="challenge-input-area">
              <input
                ref={inputRef}
                type="text"
                className="challenge-input"
                placeholder="请输入中文释义"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="challenge-actions">
              <button
                className="btn-action btn-primary btn-large"
                onClick={handleSubmit}
                disabled={!input.trim()}
              >
                确认答案
              </button>
            </div>
          </>
        )}

        {phase === 'reveal' && (
          <div className="challenge-result">
            <div className="challenge-your-answer">
              你的答案：<strong>{input.trim()}</strong>
            </div>
            <div className="challenge-answer">
              正确答案：<strong>{currentWord.meaning}</strong>
            </div>
            <div className="challenge-grade-prompt">请判断你的回答是否正确：</div>
            <div className="challenge-actions challenge-grade-btns">
              <button
                className="btn-action btn-green btn-large"
                onClick={() => handleGrade(true)}
              >
                ✅ 答对了
              </button>
              <button
                className="btn-action btn-red btn-large"
                onClick={() => handleGrade(false)}
              >
                ❌ 答错了
              </button>
            </div>
          </div>
        )}

        {phase === 'graded' && (
          <div className="challenge-result">
            <div className={`challenge-feedback ${isCorrect ? 'correct' : 'wrong'}`}>
              {isCorrect ? '✅ 回答正确' : '❌ 回答错误'}
            </div>
            <div className="challenge-actions">
              <button
                className="btn-action btn-primary btn-large"
                onClick={handleNext}
              >
                {currentIndex < ROUND_SIZE - 1 ? '下一题 →' : '查看结果'}
              </button>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="challenge-score-bar">
          <span className="score-correct">答对：{results.filter((r) => r.correct).length}</span>
          <span className="score-wrong">答错：{results.filter((r) => !r.correct).length}</span>
        </div>
      )}
    </div>
  );
}
