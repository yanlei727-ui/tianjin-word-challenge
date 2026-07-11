import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import words from '../data/words.json';
import {
  loadProgress,
  markLearned,
  markUnfamiliar,
  addWrongRecord,
} from '../utils/storage';
import { speakWord, stopSpeaking } from '../utils/speech';
import WordCard from '../components/WordCard';

export default function LearnPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'normal';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(true);
  const [showExample, setShowExample] = useState(true);
  const [autoPlay, setAutoPlay] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState(false);
  const [progress, setProgress] = useState(loadProgress());

  const getWordList = useCallback(() => {
    let list = [...words];

    if (mode === 'day1') {
      list = list.filter((w) => w.id <= 68);
    } else if (mode === 'day2') {
      list = list.filter((w) => w.id > 68);
    } else if (mode === 'wrong') {
      const wrongIds = new Set(progress.wrongBook.map((r) => r.wordId));
      list = list.filter((w) => wrongIds.has(w.id));
    } else if (mode === 'unfamiliar') {
      const unfIds = new Set(progress.unfamiliar);
      list = list.filter((w) => unfIds.has(w.id));
    }

    if (shuffleOrder) {
      list = [...list].sort(() => Math.random() - 0.5);
    }

    return list;
  }, [mode, shuffleOrder, progress.wrongBook, progress.unfamiliar]);

  const wordList = getWordList();
  const currentWord = wordList[currentIndex];

  useEffect(() => {
    return () => stopSpeaking();
  }, []);

  useEffect(() => {
    if (autoPlay && currentWord) {
      speakWord(currentWord.word);
      const timer = setTimeout(() => {
        if (currentIndex < wordList.length - 1) {
          setCurrentIndex((i) => i + 1);
        } else {
          setAutoPlay(false);
        }
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [autoPlay, currentIndex, currentWord, wordList.length]);

  const handleKnow = () => {
    if (!currentWord) return;
    const p = markLearned(currentWord.id);
    setProgress(p);
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleUnfamiliar = () => {
    if (!currentWord) return;
    markUnfamiliar(currentWord.id);
    const p = loadProgress();
    setProgress(p);
    if (currentIndex < wordList.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleAddWrong = () => {
    if (!currentWord) return;
    addWrongRecord(currentWord.id);
    const p = loadProgress();
    setProgress(p);
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

  return (
    <div className="page learn-page">
      <div className="learn-toolbar">
        <label className="toolbar-toggle">
          <input
            type="checkbox"
            checked={showMeaning}
            onChange={(e) => setShowMeaning(e.target.checked)}
          />
          显示中文
        </label>
        <label className="toolbar-toggle">
          <input
            type="checkbox"
            checked={showExample}
            onChange={(e) => setShowExample(e.target.checked)}
          />
          显示例句
        </label>
        <label className="toolbar-toggle">
          <input
            type="checkbox"
            checked={autoPlay}
            onChange={(e) => {
              setAutoPlay(e.target.checked);
              if (e.target.checked) setCurrentIndex(0);
            }}
          />
          自动播放
        </label>
        <label className="toolbar-toggle">
          <input
            type="checkbox"
            checked={shuffleOrder}
            onChange={(e) => {
              setShuffleOrder(e.target.checked);
              setCurrentIndex(0);
            }}
          />
          随机顺序
        </label>
      </div>

      <div className="learn-progress-bar">
        <span>{currentIndex + 1} / {wordList.length}</span>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${((currentIndex + 1) / wordList.length) * 100}%` }}
          />
        </div>
      </div>

      {currentWord && (
        <WordCard
          key={currentWord.id}
          word={currentWord}
          showMeaning={showMeaning}
          showExample={showExample}
          onKnow={handleKnow}
          onUnfamiliar={handleUnfamiliar}
          onAddWrong={handleAddWrong}
          onNext={handleNext}
        />
      )}

      <div className="learn-nav">
        <button
          className="btn-nav"
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          ← 上一个
        </button>
        <button
          className="btn-nav btn-speak-all"
          onClick={() => currentWord && speakWord(currentWord.word)}
        >
          🔊 朗读
        </button>
        <button
          className="btn-nav"
          onClick={handleNext}
          disabled={currentIndex >= wordList.length - 1}
        >
          下一个 →
        </button>
      </div>
    </div>
  );
}
