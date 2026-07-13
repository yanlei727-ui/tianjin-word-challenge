import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  loadProgress,
  saveProgress,
  markMastered,
  markUnfamiliar,
  removeUnfamiliar,
} from '../utils/storage';
import { speakWord } from '../utils/speech';
import { getModuleWords, type ModuleKey } from '../utils/modules';

type SortMode = 'alpha' | 'group';
type FilterMode = 'all' | 'learned' | 'mastered' | 'unfamiliar' | 'wrong' | 'unlearned';

export default function WordListPage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);

  const [sortMode, setSortMode] = useState<SortMode>('group');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(loadProgress(module));
  const [showMeanings, setShowMeanings] = useState(true);

  const getFilteredWords = () => {
    let list = [...allWords];

    if (filterMode === 'learned') {
      list = list.filter((w) => progress.learned.includes(w.id));
    } else if (filterMode === 'mastered') {
      list = list.filter((w) => progress.mastered.includes(w.id));
    } else if (filterMode === 'unfamiliar') {
      list = list.filter((w) => progress.unfamiliar.includes(w.id));
    } else if (filterMode === 'wrong') {
      const wrongIds = new Set(progress.wrongBook.map((r) => r.wordId));
      list = list.filter((w) => wrongIds.has(w.id));
    } else if (filterMode === 'unlearned') {
      list = list.filter((w) => !progress.learned.includes(w.id));
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.word.toLowerCase().includes(q) ||
          w.meaning.includes(q)
      );
    }

    if (sortMode === 'alpha') {
      list.sort((a, b) => a.word.localeCompare(b.word));
    }
    // group sort is default order (by id)

    return list;
  };

  const filtered = getFilteredWords();

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

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div className="page wordlist-page">
      <div className="wordlist-toolbar">
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索单词或中文..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-row">
          <select
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value as SortMode)}
            className="select-input"
          >
            <option value="group">按闯关分组</option>
            <option value="alpha">按字母排序</option>
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value as FilterMode)}
            className="select-input"
          >
            <option value="all">全部单词</option>
            <option value="learned">已学习</option>
            <option value="mastered">已掌握</option>
            <option value="unfamiliar">需复习</option>
            <option value="wrong">错词</option>
            <option value="unlearned">未学习</option>
          </select>

          <label className="toolbar-toggle small">
            <input
              type="checkbox"
              checked={showMeanings}
              onChange={(e) => setShowMeanings(e.target.checked)}
            />
            显示释义
          </label>
        </div>
      </div>

      <div className="wordlist-count">
        共 {filtered.length} 个单词
      </div>

      {isMobile ? (
        <div className="wordlist-cards">
          {filtered.map((w) => (
            <div key={w.id} className="wordlist-card">
              <div className="wl-card-top">
                <span className="wl-word">{w.word}</span>
                <button className="btn-speak-sm" onClick={() => speakWord(w.word)}>
                  🔊
                </button>
              </div>
              <div className="wl-phonetic">{w.phonetic}</div>
              {showMeanings && <div className="wl-meaning">{w.meaning}</div>}
              <div className="wl-card-actions">
                <button
                  className={`wl-btn ${progress.mastered.includes(w.id) ? 'active green' : ''}`}
                  onClick={() => handleToggleMastered(w.id)}
                >
                  {progress.mastered.includes(w.id) ? '✅ 已掌握' : '标记掌握'}
                </button>
                <button
                  className={`wl-btn ${progress.unfamiliar.includes(w.id) ? 'active orange' : ''}`}
                  onClick={() => handleToggleUnfamiliar(w.id)}
                >
                  {progress.unfamiliar.includes(w.id) ? '🔄 需复习' : '标记不熟'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="wordlist-table-wrapper">
          <table className="wordlist-table">
            <thead>
              <tr>
                <th>#</th>
                <th>单词</th>
                <th>音标</th>
                {showMeanings && <th>中文释义</th>}
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((w, i) => (
                <tr key={w.id} className={progress.mastered.includes(w.id) ? 'row-mastered' : ''}>
                  <td>{i + 1}</td>
                  <td>
                    <span className="tl-word">{w.word}</span>
                    <button className="btn-speak-xs" onClick={() => speakWord(w.word)}>
                      🔊
                    </button>
                  </td>
                  <td className="tl-phonetic">{w.phonetic}</td>
                  {showMeanings && <td>{w.meaning}</td>}
                  <td>
                    {progress.mastered.includes(w.id) && <span className="badge green">已掌握</span>}
                    {progress.unfamiliar.includes(w.id) && <span className="badge orange">需复习</span>}
                    {!progress.learned.includes(w.id) && <span className="badge gray">未学习</span>}
                  </td>
                  <td>
                    <button
                      className="wl-btn-sm"
                      onClick={() => handleToggleMastered(w.id)}
                    >
                      {progress.mastered.includes(w.id) ? '取消掌握' : '掌握'}
                    </button>
                    <button
                      className="wl-btn-sm"
                      onClick={() => handleToggleUnfamiliar(w.id)}
                    >
                      {progress.unfamiliar.includes(w.id) ? '取消不熟' : '不熟'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
