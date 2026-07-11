import { Link } from 'react-router-dom';
import { loadProgress } from '../utils/storage';
import words from '../data/words.json';

export default function HomePage() {
  const progress = loadProgress();
  const totalWords = words.length;
  const learned = progress.learned.length;
  const mastered = progress.mastered.length;
  const toReview = progress.wrongBook.length;
  const completedLevels = Object.values(progress.levelScores).filter((s) => s.completed).length;
  const progressPercent = Math.round((completedLevels / 14) * 100);

  const day1Done = progress.dayProgress.day1;
  const day2Done = progress.dayProgress.day2;
  const suggestion = !day1Done ? '第1天：学习第1—68个单词，完成前7关' : !day2Done ? '第2天：学习第69—136个单词，完成后7关' : '恭喜！你已完成全部学习计划！';

  return (
    <div className="page home-page">
      <div className="home-hero">
        <h1 className="home-title">天津中考名词闯关</h1>
        <p className="home-subtitle">136个中考高频名词 · 每天学习一点 · 两天完成第一轮</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{totalWords}</div>
          <div className="stat-label">单词总数</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{learned}</div>
          <div className="stat-label">已学习</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{mastered}</div>
          <div className="stat-label">已掌握</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{toReview}</div>
          <div className="stat-label">待复习</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-label">
          <span>闯关进度</span>
          <span>{completedLevels}/14 关 ({progressPercent}%)</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="home-suggestion">
        <span className="suggestion-icon">💡</span>
        <span>{suggestion}</span>
      </div>

      <div className="home-actions">
        <Link to="/learn" className="btn-primary btn-large">📖 开始学习</Link>
        <Link to="/challenge" className="btn-primary btn-large btn-green">🎯 继续闯关</Link>
        <Link to="/wrongbook" className="btn-primary btn-large btn-orange">📝 复习错词</Link>
        <Link to="/wordlist" className="btn-primary btn-large btn-purple">📋 查看全部单词</Link>
      </div>

      <div className="plan-section">
        <h2 className="section-title">📅 两天学习计划</h2>
        <div className="plan-cards">
          <div className={`plan-card ${day1Done ? 'completed' : ''}`}>
            <div className="plan-day">第1天</div>
            <div className="plan-desc">
              学习第 1 — 68 个单词<br />
              完成前 7 关
            </div>
            <div className="plan-words">单词 1-68</div>
            {day1Done && <div className="plan-check">✅ 已完成</div>}
          </div>
          <div className={`plan-card ${day2Done ? 'completed' : ''}`}>
            <div className="plan-day">第2天</div>
            <div className="plan-desc">
              学习第 69 — 136 个单词<br />
              完成后 7 关 + 总复习
            </div>
            <div className="plan-words">单词 69-136</div>
            {day2Done && <div className="plan-check">✅ 已完成</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
