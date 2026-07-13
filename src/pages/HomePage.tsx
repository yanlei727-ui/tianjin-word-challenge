import { Link } from 'react-router-dom';
import { BookOpen, Shapes, FileText, ListChecks, PenLine, NotebookTabs } from 'lucide-react';

const SYSTEM_MODULES = [
  { key: 'vocabulary', label: '词汇中心', Icon: BookOpen, desc: '单词学习与训练', route: '/vocabulary' },
  { key: 'grammar', label: '语法专项', Icon: Shapes, desc: '语法知识梳理', route: '/grammar' },
  { key: 'reading', label: '阅读理解', Icon: FileText, desc: '阅读理解训练', route: '/reading' },
  { key: 'cloze', label: '完形填空', Icon: ListChecks, desc: '完形填空练习', route: '/cloze' },
  { key: 'writing', label: '作文训练', Icon: PenLine, desc: '写作能力提升', route: '/writing' },
  { key: 'mistakes', label: '错题本', Icon: NotebookTabs, desc: '错题回顾巩固', route: '/mistakes' },
];

export default function HomePage() {
  return (
    <div className="page home-page">
      {/* Compact Brand Hero */}
      <div className="home-hero-compact">
        <h1 className="home-brand">严梓淳的天津中考英语学习系统</h1>
        <p className="home-english">TIANJIN ENGLISH LEARNING SYSTEM</p>
        <p className="home-tagline">每天进步一点，稳步迎战天津中考</p>
      </div>

      {/* Six Core Modules - 3x2 Grid */}
      <div className="home-modules-section">
        <h2 className="section-title">核心模块</h2>
        <div className="home-modules-grid">
          {SYSTEM_MODULES.map((m) => (
            <Link key={m.key} to={m.route} className="home-module-card">
              <div className="home-module-icon">
                <m.Icon size={28} strokeWidth={2} />
              </div>
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
          <Link to="/vocabulary/learn?module=noun" className="home-continue-card">
            <div className="home-module-icon" style={{ width: 40, height: 40, borderRadius: 10 }}>
              <BookOpen size={22} strokeWidth={2} />
            </div>
            <div className="continue-info">
              <span className="continue-name">从名词专项开始学习</span>
              <span className="continue-count">136 个核心词汇</span>
            </div>
            <span className="continue-arrow">继续学习 →</span>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="home-footer">
        <p>淳淳英语 · 面向天津中考的英语学习系统</p>
      </div>
    </div>
  );
}
