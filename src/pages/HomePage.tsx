import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MODULES, getModuleWords, type ModuleKey } from '../utils/modules';

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [selectedModule] = useState<ModuleKey>(
    (searchParams.get('module') as ModuleKey) || 'noun'
  );

  return (
    <div className="page home-page">
      <div className="home-hero">
        <h1 className="home-title">天津中考英语词汇闯关</h1>
        <p className="home-subtitle">中考高频词汇 · 分类专项训练</p>
      </div>

      {/* 单词本浏览 */}
      <section className="home-section">
        <h2 className="section-title">📚 单词本</h2>
        <div className="module-selector">
          {MODULES.map((m) => {
            const words = getModuleWords(m.key);
            const count = words.length;
            return (
              <Link
                key={m.key}
                to={`/wordlist?module=${m.key}`}
                className={`module-card ${count === 0 ? 'empty' : ''}`}
              >
                <span className="module-icon">{m.icon}</span>
                <span className="module-label">{m.label}</span>
                <span className="module-count">{count} 词</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 核心训练 */}
      <section className="home-section">
        <h2 className="section-title">🎯 核心训练</h2>
        <div className="home-training-grid">
          <Link to={`/chinese-challenge?module=${selectedModule}`} className="training-card">
            <span className="training-icon">🀄</span>
            <span className="training-name">释义训练</span>
            <span className="training-desc">看中文写英文</span>
          </Link>
          <Link to={`/quick-review?module=${selectedModule}`} className="training-card">
            <span className="training-icon">⚡</span>
            <span className="training-name">快速识词</span>
            <span className="training-desc">快速标记认识</span>
          </Link>
          <Link to={`/choice-quiz?module=${selectedModule}`} className="training-card">
            <span className="training-icon">📝</span>
            <span className="training-name">选择练习</span>
            <span className="training-desc">选择正确释义</span>
          </Link>
        </div>
      </section>

      {/* 复习强化 */}
      <section className="home-section">
        <h2 className="section-title">🔄 复习强化</h2>
        <div className="home-training-grid home-training-grid-2">
          <Link to={`/favorite-quiz?module=${selectedModule}`} className="training-card">
            <span className="training-icon">⭐</span>
            <span className="training-name">重点词</span>
            <span className="training-desc">收藏的重点词汇</span>
          </Link>
          <Link to={`/wrongbook?module=${selectedModule}`} className="training-card">
            <span className="training-icon">📕</span>
            <span className="training-name">错词本</span>
            <span className="training-desc">易错词强化练习</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
