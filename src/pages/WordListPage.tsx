import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  loadProgress,
  saveProgress,
  markMastered,
  markUnfamiliar,
  removeUnfamiliar,
} from '../utils/storage';
import { speakWord } from '../utils/speech';
import { getModuleWords, getModuleInfo, type ModuleKey } from '../utils/modules';

type FilterLetter = string | 'ALL';

export default function WordListPage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);
  const moduleInfo = getModuleInfo(module);

  const [search, setSearch] = useState('');
  const [filterLetter, setFilterLetter] = useState<FilterLetter>('ALL');
  const [progress, setProgress] = useState(loadProgress(module));

  const alphabet = useMemo(() => {
    const letters = new Set(allWords.map(w => w.word[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [allWords]);

  const filtered = useMemo(() => {
    let list = allWords;

    if (filterLetter !== 'ALL') {
      list = list.filter(w => w.word[0].toUpperCase() === filterLetter);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        w =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.includes(q)
      );
    }

    return list;
  }, [allWords, filterLetter, search]);

  const handleToggleMastered = (wordId: number) => {
    if (progress.mastered.includes(wordId)) {
      const p = { ...progress, mastered: progress.mastered.filter((id) => id !== wordId) };
      saveProgress(p, module);
      setProgress(p);
    } else {
      const p = markMastered(wordId, module);
      setProgress(p);
    }
  };

  const handleToggleUnfamiliar = (wordId: number) => {
    if (progress.unfamiliar.includes(wordId)) {
      const p = removeUnfamiliar(wordId, module);
      setProgress(p);
    } else {
      const p = markUnfamiliar(wordId, module);
      setProgress(p);
    }
  };

  return (
    <div className="page wordlist-page">
      <div className="wl-top-bar">
        <Link to="/" className="wl-back">← 返回</Link>
        <span className="wl-module-name">{moduleInfo.icon} {moduleInfo.label}</span>
        <span className="wl-total-count">{allWords.length} 词</span>
      </div>

      <div className="wl-search-row">
        <input
          type="text"
          placeholder="搜索单词或中文..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="wl-search-input"
        />
      </div>

      <div className="wl-letter-filter">
        <button
          className={`wl-letter-btn ${filterLetter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilterLetter('ALL')}
        >
          全部
        </button>
        {alphabet.map(letter => (
          <button
            key={letter}
            className={`wl-letter-btn ${filterLetter === letter ? 'active' : ''}`}
            onClick={() => setFilterLetter(letter)}
          >
            {letter}
          </button>
        ))}
      </div>

      <div className="wl-result-count">
        显示 {filtered.length} 个单词
      </div>

      <div className="wl-list">
        {filtered.map((w) => (
          <div key={w.id} className="wl-item">
            <div className="wl-item-main">
              <div className="wl-item-word-row">
                <span className="wl-item-word">{w.word}</span>
                <span className="wl-item-pos">{w.partOfSpeech}</span>
                <button className="wl-speak-btn" onClick={() => speakWord(w.word)}>
                  🔊
                </button>
              </div>
              <div className="wl-item-phonetic">{w.phonetic}</div>
              <div className="wl-item-meaning">{w.meaning}</div>
              <div className="wl-item-example">{w.example}</div>
            </div>
            <div className="wl-item-actions">
              <button
                className={`wl-mini-btn ${progress.mastered.includes(w.id) ? 'active green' : ''}`}
                onClick={() => handleToggleMastered(w.id)}
                title="标记掌握"
              >
                {progress.mastered.includes(w.id) ? '✓' : '○'}
              </button>
              <button
                className={`wl-mini-btn ${progress.unfamiliar.includes(w.id) ? 'active orange' : ''}`}
                onClick={() => handleToggleUnfamiliar(w.id)}
                title="标记不熟"
              >
                {progress.unfamiliar.includes(w.id) ? '!' : '·'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="wl-actions-bottom">
        <Link to={`/chinese-challenge?module=${module}`} className="btn-primary btn-large btn-purple">
          🀄 释义训练
        </Link>
        <Link to={`/choice-quiz?module=${module}`} className="btn-primary btn-large btn-orange">
          📝 选择练习
        </Link>
      </div>
    </div>
  );
}
