import { Link } from 'react-router-dom';
import { MODULES, getModuleWords } from '../utils/modules';
import { loadProgress } from '../utils/storage';

export default function VocabularyCenter() {
  return (
    <div className="page vocabulary-center">
      <div className="vc-header">
        <h1 className="vc-title">📖 词汇中心</h1>
        <p className="vc-subtitle">中考核心词汇学习与训练</p>
      </div>

      {/* Word Lists */}
      <section className="vc-section">
        <h2 className="section-title">📚 单词本</h2>
        <div className="vc-card-grid">
          {MODULES.map((m) => {
            const words = getModuleWords(m.key);
            const progress = loadProgress(m.key);
            const learned = progress.learned.length;
            const count = words.length;
            return (
              <Link
                key={m.key}
                to={`/wordlist?module=${m.key}`}
                className="vc-list-card"
              >
                <span className="vc-list-icon">{m.icon}</span>
                <div className="vc-list-info">
                  <span className="vc-list-name">{m.label}</span>
                  <span className="vc-list-count">{count} 词 · 已学 {learned} 词</span>
                </div>
                <span className="vc-list-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Core Training */}
      <section className="vc-section">
        <h2 className="section-title">🎯 核心训练</h2>
        <div className="vc-training-grid">
          <Link to="/chinese-challenge" className="vc-training-card">
            <span className="vc-training-icon">🀄</span>
            <span className="vc-training-name">释义训练</span>
            <span className="vc-training-desc">看中文写英文</span>
          </Link>
          <Link to="/quick-review" className="vc-training-card">
            <span className="vc-training-icon">⚡</span>
            <span className="vc-training-name">快速识词</span>
            <span className="vc-training-desc">快速标记认识</span>
          </Link>
          <Link to="/choice-quiz" className="vc-training-card">
            <span className="vc-training-icon">📝</span>
            <span className="vc-training-name">选择练习</span>
            <span className="vc-training-desc">选择正确释义</span>
          </Link>
          <div className="vc-training-card coming-soon">
            <span className="vc-training-icon">✏️</span>
            <span className="vc-training-name">拼写训练</span>
            <span className="vc-training-desc">即将上线</span>
          </div>
          <div className="vc-training-card coming-soon">
            <span className="vc-training-icon">🎧</span>
            <span className="vc-training-name">听音选词</span>
            <span className="vc-training-desc">即将上线</span>
          </div>
          <div className="vc-training-card coming-soon">
            <span className="vc-training-icon">📋</span>
            <span className="vc-training-name">例句填空</span>
            <span className="vc-training-desc">即将上线</span>
          </div>
        </div>
      </section>

      {/* Review */}
      <section className="vc-section">
        <h2 className="section-title">🔄 复习强化</h2>
        <div className="vc-training-grid vc-training-grid-2">
          <Link to="/favorites" className="vc-training-card">
            <span className="vc-training-icon">⭐</span>
            <span className="vc-training-name">重点词</span>
            <span className="vc-training-desc">收藏的重点词汇</span>
          </Link>
          <Link to="/wrongbook" className="vc-training-card">
            <span className="vc-training-icon">📕</span>
            <span className="vc-training-name">易错词</span>
            <span className="vc-training-desc">错词本强化练习</span>
          </Link>
          <Link to="/challenge" className="vc-training-card">
            <span className="vc-training-icon">🎯</span>
            <span className="vc-training-name">闯关练习</span>
            <span className="vc-training-desc">分关卡挑战</span>
          </Link>
          <Link to="/favorite-quiz" className="vc-training-card">
            <span className="vc-training-icon">🃏</span>
            <span className="vc-training-name">闪卡复习</span>
            <span className="vc-training-desc">翻卡记忆</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
