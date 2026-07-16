import { useState, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  loadProgress,
  markLearned,
  markUnfamiliar,
  addWrongRecord,
  saveLastPosition,
  addFavorite,
  removeFavorite,
  isFavorited,
} from '../utils/storage';
import { speakWord, stopSpeaking } from '../utils/speech';
import { getModuleWords, type ModuleKey } from '../utils/modules';
import WordCard from '../components/WordCard';

export default function LearnPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'normal';
  const startParam = searchParams.get('start');
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';

  const wordListAll = getModuleWords(module);
  const savedPosition = loadProgress(module).lastPosition;
  const initialIndex = startParam !== null
    ? Math.max(0, Math.min(Number(startParam), wordListAll.length - 1))
    : 0;

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showExample, setShowExample] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [progress, setProgress] = useState(loadProgress(module));
  const [showResume, setShowResume] = useState(
    startParam === null && savedPosition > 0 && mode === 'normal'
  );
  const autoPlayScrollRef = useRef(0);

  const getWordList = useCallback(() => {
    let list = [...wordListAll];

    if (mode === 'day1') {
      const half = Math.ceil(list.length / 2);
      list = list.slice(0, half);
    } else if (mode === 'day2') {
      const half = Math.ceil(list.length / 2);
      list = list.slice(half);
    } else if (mode === 'wrong') {
      const wrongIds = new Set(progress.wrongBook.map((r) => r.wordId));
      list = list.filter((w) => wrongIds.has(w.id));
    } else if (mode === 'unfamiliar') {
      const unfIds = new Set(progress.unfamiliar);
      list = list.filter((w) => unfIds.has(w.id));
    }

    return list;
  }, [mode, wordListAll, progress.wrongBook, progress.unfamiliar]);

  const wordList = getWordList();
  const currentWord = wordList[currentIndex];

  // Save position on index change
  useEffect(() => {
    if (mode === 'normal' && wordList.length > 0) {
      saveLastPosition(currentIndex, module);
    }
  }, [currentIndex, currentWord, mode, wordList.length, module]);

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  // Auto-play effect
  useEffect(() => {
    if (!autoPlay || !currentWord) return;
    autoPlayScrollRef.current = window.scrollY;
    let cancelled = false;
    let speakIndex = 0;
    const speakNext = () => {
      if (cancelled) return;
      if (speakIndex >= 3) {
        if (currentIndex < wordList.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setAutoPlay(false);
        }
        return;
      }
      speakWord(currentWord.word);
      speakIndex++;
      setTimeout(speakNext, 1500);
    };
    speakNext();
    return () => { cancelled = true; };
  }, [autoPlay, currentIndex, currentWord?.id, currentWord?.word, wordList.length]);

  useEffect(() => {
    if (autoPlay && autoPlayScrollRef.current > 0) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: autoPlayScrollRef.current });
      });
    }
  });

  const handleResume = () => {
    setCurrentIndex(savedPosition);
    setShowResume(false);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setShowResume(false);
  };

  const handleKnow = () => {
    if (!currentWord) return;
    const p = markLearned(currentWord.id, module);
    setProgress(p);
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleUnfamiliar = () => {
    if (!currentWord) return;
    markUnfamiliar(currentWord.id, module);
    const p = loadProgress(module);
    setProgress(p);
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleAddWrong = () => {
    if (!currentWord) return;
    addWrongRecord(currentWord.id, module);
    const p = loadProgress(module);
    setProgress(p);
  };

  const handleToggleFavorite = () => {
    if (!currentWord) return;
    if (isFavorited(currentWord.id, module)) {
      removeFavorite(currentWord.id, module);
    } else {
      addFavorite(currentWord.id, module);
    }
  };

  const handleNext = () => {
    stopSpeaking();
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handlePrev = () => {
    stopSpeaking();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  };

  if (wordList.length === 0) {
    return (
      <div className="page">
        <div className="empty-state">
          <p>暂无可学习的单词</p>
          <p className="empty-hint">请从首页选择学习模式</p>
        </div>
      </div>
    );
  }

  if (showResume) {
    return (
      <div className="page">
        <div className="result-card" style={{ marginTop: 40 }}>
          <div className="result-celebration">📖</div>
          <h2>上次学习到第 {savedPosition + 1} 个单词</h2>
          <div className="result-details">
            <span>单词 {savedPosition + 1} / {wordList.length}</span>
          </div>
          <div className="result-actions" style={{ flexDirection: 'column', gap: 12 }}>
            <button className="btn-action btn-primary btn-large" onClick={handleResume}>
              ▶️ 继续学习
            </button>
            <button className="btn-action btn-large" onClick={handleRestart}>
              🔄 重新开始
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page learn-page">
      <div className="learn-toolbar">
        <label className="toolbar-toggle">
          <input type="checkbox" checked={showMeaning} onChange={(e) => setShowMeaning(e.target.checked)} />
          显示中文
        </label>
        <label className="toolbar-toggle">
          <input type="checkbox" checked={showExample} onChange={(e) => setShowExample(e.target.checked)} />
          显示例句
        </label>
        <label className="toolbar-toggle">
          <input type="checkbox" checked={autoPlay} onChange={(e) => setAutoPlay(e.target.checked)} />
          自动播放
        </label>
      </div>

      <div className="learn-progress-bar">
        <span>{currentIndex + 1} / {wordList.length}</span>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${((currentIndex + 1) / wordList.length) * 100}%` }} />
        </div>
      </div>

      {currentWord && (
        <WordCard
          key={currentWord.id}
          word={currentWord}
          showMeaning={showMeaning}
          showExample={showExample}
          isFavorited={isFavorited(currentWord.id, module)}
          onKnow={handleKnow}
          onUnfamiliar={handleUnfamiliar}
          onAddWrong={handleAddWrong}
          onNext={handleNext}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      <div className="learn-nav">
        <button className="btn-nav" onClick={handlePrev} disabled={currentIndex === 0}>
          ← 上一个
        </button>
        <button className="btn-nav btn-speak-all" onClick={() => currentWord && speakWord(currentWord.word)}>
          🔊 朗读
        </button>
        <button className="btn-nav" onClick={handleNext} disabled={currentIndex >= wordList.length - 1}>
          下一个 →
        </button>
      </div>
    </div>
  );
}
