import { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  loadProgress,
  loadFavorites,
  addFavorite,
  removeFavorite,
} from '../utils/storage';
import { speakWord } from '../utils/speech';
import { getModuleWords, getModuleInfo, type ModuleKey } from '../utils/modules';

type FilterMode = 'all' | 'unlearned' | 'mastered' | 'favorite';
type FilterLetter = string | 'ALL';

export default function WordListPage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);
  const moduleInfo = getModuleInfo(module);

  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [filterLetter, setFilterLetter] = useState<FilterLetter>('ALL');
  const [progress] = useState(loadProgress(module));
  const [favorites, setFavorites] = useState(loadFavorites());

  const favoriteIds = useMemo(() => {
    return new Set(favorites.filter(f => f.module === module).map(f => f.wordId));
  }, [favorites, module]);

  const alphabet = useMemo(() => {
    const letters = new Set(allWords.map(w => w.word[0].toUpperCase()));
    return Array.from(letters).sort();
  }, [allWords]);

  const filtered = useMemo(() => {
    let list = allWords;

    if (filterMode === 'unlearned') {
      list = list.filter(w => !progress.mastered.includes(w.id));
    } else if (filterMode === 'mastered') {
      list = list.filter(w => progress.mastered.includes(w.id));
    } else if (filterMode === 'favorite') {
      list = list.filter(w => favoriteIds.has(w.id));
    }

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
  }, [allWords, filterMode, filterLetter, search, progress, favoriteIds]);

  const handleToggleFavorite = (wordId: number) => {
    if (favoriteIds.has(wordId)) {
      const updated = removeFavorite(wordId, module);
      setFavorites(updated);
    } else {
      const updated = addFavorite(wordId, module);
      setFavorites(updated);
    }
  };

  const masteredCount = progress.mastered.length;
  const favoriteCount = favorites.filter(f => f.module === module).length;

  return (
    <div className="page wordlist-page">
      <div className="wl-header">
        <Link to="/" className="wl-back">← 返回</Link>
        <div className="wl-title-area">
          <h1 className="wl-title">{moduleInfo.icon} {moduleInfo.label}</h1>
          <p className="wl-subtitle">{allWords.length}个中考高频词</p>
        </div>
        <Link
          to={`/auto-recognize?module=${module}&filter=${filterMode}${filterLetter !== 'ALL' ? `&letter=${filterLetter}` : ''}`}
          className="wl-auto-recognize-btn"
        >
          🎧 自动认词
        </Link>
      </div>

      <div className="wl-search">
        <input
          type="text"
          placeholder="搜索单词或中文..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="wl-search-input"
        />
      </div>

      <div className="wl-filter-row">
        <button
          className={`wl-filter-btn ${filterMode === 'all' ? 'active' : ''}`}
          onClick={() => setFilterMode('all')}
        >
          全部 <span className="wl-filter-count">{allWords.length}</span>
        </button>
        <button
          className={`wl-filter-btn ${filterMode === 'unlearned' ? 'active' : ''}`}
          onClick={() => setFilterMode('unlearned')}
        >
          未掌握 <span className="wl-filter-count">{allWords.length - masteredCount}</span>
        </button>
        <button
          className={`wl-filter-btn ${filterMode === 'mastered' ? 'active' : ''}`}
          onClick={() => setFilterMode('mastered')}
        >
          已掌握 <span className="wl-filter-count">{masteredCount}</span>
        </button>
        <button
          className={`wl-filter-btn ${filterMode === 'favorite' ? 'active' : ''}`}
          onClick={() => setFilterMode('favorite')}
        >
          收藏 <span className="wl-filter-count">{favoriteCount}</span>
        </button>
      </div>

      <div className="wl-letter-bar">
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

      <div className="wl-list">
        {filtered.map((w) => (
          <div key={w.id} className="wl-card">
            <div className="wl-card-left">
              <div className="wl-card-word">{w.word}</div>
              <div className="wl-card-meta">
                <span className="wl-card-pos">{w.partOfSpeech}</span>
                <span className="wl-card-phonetic">{w.phonetic}</span>
              </div>
              <div className="wl-card-meaning">{w.meaning}</div>
              <div className="wl-card-example">
                <div className="wl-example-en">{w.example}</div>
                <div className="wl-example-zh">{w.exampleZh}</div>
              </div>
            </div>
            <div className="wl-card-right">
              <button
                className="wl-circle-btn speak"
                onClick={() => speakWord(w.word)}
                title="朗读"
              >
                🔊
              </button>
              <button
                className={`wl-circle-btn favorite ${favoriteIds.has(w.id) ? 'active' : ''}`}
                onClick={() => handleToggleFavorite(w.id)}
                title="收藏"
              >
                {favoriteIds.has(w.id) ? '★' : '☆'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="wl-empty">没有找到匹配的单词</div>
      )}

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
