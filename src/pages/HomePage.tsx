import { Link } from 'react-router-dom';
import { MODULES, getModuleWords } from '../utils/modules';
import { loadProgress } from '../utils/storage';

const SYSTEM_MODULES = [
  { key: 'vocabulary', label: '词汇中心', icon: '📖', color: 'var(--primary)', desc: '单词学习与训练', route: '/vocabulary' },
  { key: 'grammar', label: '语法专项', icon: '📐', color: '#3b82f6', desc: '语法知识梳理', route: '/grammar' },
  { key: 'reading', label: '阅读理解', icon: '📰', color: '#10b981', desc: '阅读理解训练', route: '/reading' },
  { key: 'cloze', label: '完形填空', icon: '📝', color: '#f59e0b', desc: '完形填空练习', route: '/cloze' },
  { key: 'writing', label: '作文训练', icon: '✍️', color: '#8b5cf6', desc: '写作能力提升', route: '/writing' },
  { key: 'mistakes', label: '错题本', icon: '📕', color: 'var(--red)', desc: '错题回顾巩固', route: '/mistakes' },
];

function getVocabStats() {
  let totalWords = 0;
  let totalLearned = 0;
  for (const m of MODULES) {
    const words = getModuleWords(m.key);
    totalWords += words.length;
    const progress = loadProgress(m.key);
    totalLearned += progress.learned.length;
  }
  return { totalWords, totalLearned };
}

export default function HomePage() {
  const { totalWords, totalLearned } = getVocabStats();
  const progressPercent = totalWords > 0 ? Math.round((totalLearned / totalWords) * 100) : 0;

  return (
    <div className="page home-page">
      {/* Compact Brand */}
      <div className="home-hero-compact">
        <h1 className="home-brand">淳淳英语</h1>
        <p className="home-english">TIANJIN ENGLISH LEARNING SYSTEM</p>
        <p className="home-tagline">面向天津中考的英语学习系统</p>
      </div>

      {/* Today's Learning Card */}
      <div className="home-today-card">
        <div className="today-left">
          <div className="today-label">今日学习</div>
          <div className="today-stat">{totalLearned} / {totalWords} 词</div>
        </div>
        <div className="today-right">
          <div className="today-progress-ring">
            <svg viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--gray-200)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeDasharray={`${progressPercent}, 100`}
              />
            </svg>
            <span className="today-percent">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Seven Core Modules */}
      <div className="home-modules-section">
        <h2 className="section-title">核心模块</h2>
        <div className="home-modules-grid">
          {SYSTEM_MODULES.slice(0, 4).map((m) => (
            <Link key={m.key} to={m.route} className="home-module-card">
              <div className="home-module-icon" style={{ color: m.color }}>{m.icon}</div>
              <div className="home-module-name">{m.label}</div>
              <div className="home-module-desc">{m.desc}</div>
            </Link>
          ))}
        </div>
        <div className="home-modules-grid home-modules-grid-3">
          {SYSTEM_MODULES.slice(4).map((m) => (
            <Link key={m.key} to={m.route} className="home-module-card">
              <div className="home-module-icon" style={{ color: m.color }}>{m.icon}</div>
              <div className="home-module-name">{m.label}</div>
              <div className="home-module-desc">{m.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Continue Learning */}
      <div className="home-continue-section">
        <h2 className="section-title">继续学习</h2>
        <div className="home-continue-grid">
          {MODULES.map((m) => {
            const words = getModuleWords(m.key);
            const progress = loadProgress(m.key);
            const learned = progress.learned.length;
            const total = words.length;
            if (total === 0) return null;
            return (
              <Link
                key={m.key}
                to={`/vocabulary/learn?module=${m.key}`}
                className="home-continue-card"
              >
                <span className="continue-icon">{m.icon}</span>
                <div className="continue-info">
                  <span className="continue-name">{m.label}</span>
                  <span className="continue-count">{learned}/{total} 词</span>
                </div>
                <span className="continue-arrow">→</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p>淳淳英语 · 面向天津中考的英语学习系统</p>
      </div>
    </div>
  );
}
