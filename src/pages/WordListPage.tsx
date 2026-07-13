import { useState } from 'react';
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

export default function WordListPage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);
  const moduleInfo = getModuleInfo(module);

  const [search, setSearch] = useState('');
  const [progress, setProgress] = useState(loadProgress(module));

  const filtered = search.trim()
    ? allWords.filter(
        (w) =>
          w.word.toLowerCase().includes(search.trim().toLowerCase()) ||
          w.meaning.includes(search.trim())
      )
    : allWords;

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
      <div className="wordlist-header">
        <span className="wordlist-icon">{moduleInfo.icon}</span>
        <h1 className="wordlist-title">{moduleInfo.label}</h1>
        <span className="wordlist-count">共 {allWords.length} 词</span>
      </div>

      <div className="wordlist-actions-top">
        <Link to={`/chinese-challenge?module=${module}`} className="btn-primary btn-large btn-purple">
          🀄 开始释义训练
        </Link>
        <Link to={`/choice-quiz?module=${module}`} className="btn-primary btn-large btn-orange">
          📝 开始选择练习
        </Link>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="搜索单词或中文..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="wordlist-cards">
        {filtered.map((w) => (
          <div key={w.id} className="wordlist-card-full">
            <div className="wl-card-header">
              <div className="wl-card-word-row">
                <span className="wl-word">{w.word}</span>
                <span className="wl-pos">{w.partOfSpeech}</span>
                <button className="btn-speak-sm" onClick={() => speakWord(w.word)}>
                  🔊
                </button>
              </div>
              <div className="wl-phonetic">{w.phonetic}</div>
              <div className="wl-meaning">{w.meaning}</div>
            </div>

            <div className="wl-card-example">
              <div className="wl-example-en">{w.example}</div>
              <div className="wl-example-zh">{w.exampleZh}</div>
            </div>

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
    </div>
  );
}
