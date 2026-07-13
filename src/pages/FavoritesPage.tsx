import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  loadFavorites,
  removeFavorite,
  type FavoriteRecord,
} from '../utils/storage';
import { MODULES, getModuleInfo, getModuleWords, type ModuleKey } from '../utils/modules';
import { speakWord } from '../utils/speech';

export default function FavoritesPage() {
  const [searchParams] = useSearchParams();
  const filterModule = searchParams.get('module') as ModuleKey | null;
  const [favorites, setFavorites] = useState<FavoriteRecord[]>(
    loadFavorites()
  );
  const [selectedModule, setSelectedModule] = useState<ModuleKey | 'all'>(
    filterModule || 'all'
  );

  const filteredFavorites = selectedModule === 'all'
    ? favorites
    : favorites.filter((f) => f.module === selectedModule);

  // Group by module
  const groupedByModule = MODULES.reduce((acc, m) => {
    const moduleFavorites = favorites.filter((f) => f.module === m.key);
    if (moduleFavorites.length > 0) {
      acc.push({ module: m.key, label: m.label, icon: m.icon, count: moduleFavorites.length });
    }
    return acc;
  }, [] as { module: ModuleKey; label: string; icon: string; count: number }[]);

  const handleRemoveFavorite = (wordId: number, module: ModuleKey) => {
    removeFavorite(wordId, module);
    setFavorites(loadFavorites());
  };

  const handleSpeak = (word: string) => {
    speakWord(word);
  };

  // Get word data by id and module
  const getWordData = (wordId: number, module: ModuleKey) => {
    const words = getModuleWords(module);
    return words.find((w) => w.id === wordId);
  };

  return (
    <div className="page favorites-page">
      <div className="favorites-header">
        <h2>⭐ 我的重点词</h2>
        <p className="favorites-count">共 {favorites.length} 个重点词</p>
      </div>

      {/* Module filter tabs */}
      <div className="module-filter-tabs">
        <button
          className={`filter-tab ${selectedModule === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedModule('all')}
        >
          全部 ({favorites.length})
        </button>
        {groupedByModule.map((m) => (
          <button
            key={m.module}
            className={`filter-tab ${selectedModule === m.module ? 'active' : ''}`}
            onClick={() => setSelectedModule(m.module)}
          >
            {m.icon} {m.label} ({m.count})
          </button>
        ))}
      </div>

      {/* Favorites list */}
      {filteredFavorites.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">⭐</div>
          <p>还没有收藏重点词</p>
          <p className="empty-hint">在学习页面点击 ☆ 收藏重点词</p>
          <Link to="/" className="btn-action btn-primary" style={{ marginTop: 16 }}>
            去学习
          </Link>
        </div>
      ) : (
        <div className="favorites-list">
          {filteredFavorites.map((fav) => {
            const wordData = getWordData(fav.wordId, fav.module);
            if (!wordData) return null;

            return (
              <div key={`${fav.module}-${fav.wordId}`} className="favorite-card">
                <div className="favorite-card-header">
                  <div className="favorite-word-info">
                    <span className="favorite-word">{wordData.word}</span>
                    <span className="favorite-phonetic">{wordData.phonetic}</span>
                  </div>
                  <div className="favorite-card-actions">
                    <button
                      className="btn-speak-sm"
                      onClick={() => handleSpeak(wordData.word)}
                      title="朗读"
                    >
                      🔊
                    </button>
                    <button
                      className="btn-remove-favorite"
                      onClick={() => handleRemoveFavorite(fav.wordId, fav.module)}
                      title="取消收藏"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <div className="favorite-meaning">{wordData.meaning}</div>
                <div className="favorite-meta">
                  <span className="favorite-module-tag">
                    {getModuleInfo(fav.module).icon} {getModuleInfo(fav.module).label}
                  </span>
                  <span className="favorite-time">
                    {new Date(fav.addedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      {favorites.length > 0 && (
        <div className="favorites-actions">
          <Link
            to="/favorite-quiz"
            className="btn-action btn-primary btn-large"
          >
            ⭐ 重点词训练
          </Link>
        </div>
      )}
    </div>
  );
}
