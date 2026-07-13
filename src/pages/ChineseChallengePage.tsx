import { useState, useCallback, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { speakWord } from '../utils/speech';
import {
  loadProgress,
  addWrongRecord,
  saveChineseChallengePosition,
  loadChineseChallengePosition,
  saveChineseChallengeResult,
  loadChineseChallengeResults,
  resetChineseChallenge,
  type ChineseChallengeResult,
} from '../utils/storage';
import {
  getModuleWords,
  getModuleInfo,
  MODULES,
  type ModuleKey,
} from '../utils/modules';

type Phase = 'select' | 'input' | 'reveal' | 'complete';

export default function ChineseChallengePage() {
  const [searchParams] = useSearchParams();
  const initialModule = (searchParams.get('module') as ModuleKey) || '';

  const [selectedModule, setSelectedModule] = useState<ModuleKey | ''>(initialModule);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>(initialModule ? 'input' : 'select');
  const [results, setResults] = useState<ChineseChallengeResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const allWords = selectedModule ? getModuleWords(selectedModule) : [];
  const moduleInfo = selectedModule ? getModuleInfo(selectedModule) : null;
  const totalWords = allWords.length;
  const currentWord = allWords[currentIndex];
  const finished = currentIndex >= totalWords;

  // Load existing position and results when module is selected
  useEffect(() => {
    if (selectedModule) {
      const savedPos = loadChineseChallengePosition(selectedModule);
      const savedResults = loadChineseChallengeResults(selectedModule);
      setCurrentIndex(savedPos);
      setResults(savedResults);
    }
  }, [selectedModule]);

  // Focus input when phase changes to input
  useEffect(() => {
    if (phase === 'input' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [phase, currentIndex]);

  const handleSelectModule = useCallback((module: ModuleKey) => {
    setSelectedModule(module);
    setPhase('input');
  }, []);

  const handleRestart = useCallback(() => {
    if (!selectedModule) return;
    resetChineseChallenge(selectedModule);
    setCurrentIndex(0);
    setResults([]);
    setPhase('input');
  }, [selectedModule]);

  const handleSubmit = useCallback(() => {
    if (!currentWord || phase !== 'input') return;
    if (!input.trim()) return;
    setPhase('reveal');
  }, [input, currentWord, phase]);

  const handleGrade = useCallback(
    (status: 'mastered' | 'familiar' | 'unfamiliar') => {
      if (!currentWord || !selectedModule) return;

      const result: ChineseChallengeResult = {
        wordId: currentWord.id,
        status,
      };
      const newResults = [...results, result];
      setResults(newResults);

      // Save result
      saveChineseChallengeResult(selectedModule, result);

      // If unfamiliar, add to wrong book
      if (status === 'unfamiliar') {
        addWrongRecord(currentWord.id, selectedModule);
      }

      // Move to next
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setInput('');
      setPhase('input');

      // Save position
      saveChineseChallengePosition(selectedModule, nextIndex);

      // Check if finished
      if (nextIndex >= totalWords) {
        setPhase('complete');
      }
    },
    [currentWord, selectedModule, results, currentIndex, totalWords]
  );

  const handleBackToSelect = useCallback(() => {
    setSelectedModule('');
    setCurrentIndex(0);
    setInput('');
    setResults([]);
    setPhase('select');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (phase === 'input' && input.trim()) {
          handleSubmit();
        }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [phase, input, handleSubmit]);

  // Module Selection Screen
  if (phase === 'select') {
    return (
      <div className="page">
        <div className="module-select-header">
          <h2>📖 分类释义训练</h2>
          <p>选择词库开始训练，支持断点续练</p>
        </div>

        <div className="module-select-list">
          {MODULES.map((m) => {
            const words = getModuleWords(m.key);
            const moduleProgress = loadProgress(m.key);
            const savedPos = loadChineseChallengePosition(m.key);
            const learnedCount = moduleProgress?.learned?.length || 0;
            const hasProgress = savedPos > 0;

            return (
              <div
                key={m.key}
                className="module-select-card"
                onClick={() => handleSelectModule(m.key)}
              >
                <div className="module-select-icon">{m.icon}</div>
                <div className="module-select-info">
                  <div className="module-select-title">{m.label}</div>
                  <div className="module-select-stats">
                    <span>共 {words.length} 词</span>
                    <span>已学 {learnedCount} 词</span>
                  </div>
                  {hasProgress && (
                    <div className="module-select-progress">
                      <span className="progress-hint">
                        📌 上次训练到第 {savedPos} 词
                      </span>
                    </div>
                  )}
                </div>
                <div className="module-select-arrow">→</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Complete Screen
  if (phase === 'complete' || finished) {
    const masteredCount = results.filter((r) => r.status === 'mastered').length;
    const familiarCount = results.filter((r) => r.status === 'familiar').length;
    const unfamiliarCount = results.filter((r) => r.status === 'unfamiliar').length;
    const accuracy = totalWords > 0 ? Math.round((masteredCount / totalWords) * 100) : 0;

    return (
      <div className="page">
        <div className="result-card">
          <div className="result-celebration">
            {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}
          </div>
          <h2>{moduleInfo?.icon} {moduleInfo?.label} 训练完成！</h2>
          <div className="result-score">{accuracy}%</div>
          <div className="result-details">
            <span>共训练：{totalWords} 词</span>
            <span>掌握：{masteredCount} 词</span>
            <span>熟悉：{familiarCount} 词</span>
            <span>陌生：{unfamiliarCount} 词</span>
          </div>

          {unfamiliarCount > 0 && (
            <div className="result-tip">
              有 {unfamiliarCount} 个陌生单词已加入错词本，建议重点复习。
            </div>
          )}

          <div className="result-actions">
            <button className="btn-action btn-primary btn-large" onClick={handleRestart}>
              🔄 重新训练
            </button>
            <button className="btn-action btn-secondary btn-large" onClick={handleBackToSelect}>
              ← 返回选择
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Training Screen
  if (!currentWord) return null;

  const masteredCount = results.filter((r) => r.status === 'mastered').length;
  const familiarCount = results.filter((r) => r.status === 'familiar').length;
  const unfamiliarCount = results.filter((r) => r.status === 'unfamiliar').length;

  return (
    <div className="page">
      <div className="chinese-challenge-header">
        <button className="btn-back" onClick={handleBackToSelect}>
          ← 返回
        </button>
        <div className="chinese-challenge-title">
          {moduleInfo?.icon} {moduleInfo?.label}
        </div>
        <div className="chinese-challenge-progress-text">
          {currentIndex + 1} / {totalWords}
        </div>
      </div>

      <div className="learn-progress-bar">
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / totalWords) * 100}%` }}
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
          <div className="chinese-reveal">
            <div className="reveal-meaning">
              <span className="reveal-label">中文释义：</span>
              <span className="reveal-value">{currentWord.meaning}</span>
            </div>
            <div className="reveal-phonetic">
              <span className="reveal-label">音标：</span>
              <span className="reveal-value">{currentWord.phonetic}</span>
            </div>
            {currentWord.example && (
              <div className="reveal-example">
                <div className="reveal-example-en">{currentWord.example}</div>
                <div className="reveal-example-zh">{currentWord.exampleZh}</div>
              </div>
            )}
            {currentWord.note && (
              <div className="reveal-note">💡 {currentWord.note}</div>
            )}

            <div className="challenge-grade-prompt">请评估你的掌握程度：</div>
            <div className="challenge-actions challenge-grade-btns">
              <button
                className="btn-action btn-green btn-large"
                onClick={() => handleGrade('mastered')}
              >
                ✅ 认识
              </button>
              <button
                className="btn-action btn-yellow btn-large"
                onClick={() => handleGrade('familiar')}
              >
                🤔 模糊
              </button>
              <button
                className="btn-action btn-red btn-large"
                onClick={() => handleGrade('unfamiliar')}
              >
                ❌ 不会
              </button>
            </div>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="challenge-score-bar">
          <span className="score-correct">掌握：{masteredCount}</span>
          <span className="score-neutral">模糊：{familiarCount}</span>
          <span className="score-wrong">陌生：{unfamiliarCount}</span>
        </div>
      )}
    </div>
  );
}
