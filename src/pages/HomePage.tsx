import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { loadProgress } from '../utils/storage';
import { MODULES, getModuleWords, type ModuleKey } from '../utils/modules';

export default function HomePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedModule, setSelectedModule] = useState<ModuleKey>(
    (searchParams.get('module') as ModuleKey) || 'noun'
  );

  const moduleWords = getModuleWords(selectedModule);
  const progress = loadProgress(selectedModule);
  const totalWords = moduleWords.length;
  const learned = progress.learned.length;
  const mastered = progress.mastered.length;
  const unfamiliar = progress.unfamiliar.length;
  const wrongCount = progress.wrongBook.length;
  const unlearned = totalWords - learned;
  const progressPercent = totalWords > 0 ? Math.round((learned / totalWords) * 100) : 0;

  const lastPos = progress.lastPosition;
  const [startInput, setStartInput] = useState(String(lastPos > 0 ? lastPos + 1 : 1));

  const handleModuleChange = (key: ModuleKey) => {
    setSelectedModule(key);
    const p = loadProgress(key);
    setStartInput(String(p.lastPosition > 0 ? p.lastPosition + 1 : 1));
  };

  const handleStartLearn = () => {
    const num = parseInt(startInput, 10);
    if (num >= 1 && num <= totalWords) {
      navigate(`/learn?module=${selectedModule}&start=${num - 1}`);
    }
  };

  const getDaySuggestion = () => {
    const day1Done = progress.dayProgress.day1;
    const day2Done = progress.dayProgress.day2;
    if (!day1Done) return '第1天：学习前一半单词，完成前7关';
    if (!day2Done) return '第2天：学习后一半单词，完成后7关';
    return '恭喜！你已完成全部学习计划！';
  };

  return (
    <div className="page home-page">
      <div className="home-hero">
        <h1 className="home-title">天津中考英语词汇闯关</h1>
        <p className="home-subtitle">中考高频词汇 · 分类专项训练</p>
      </div>

      {/* Module Selector */}
      <div className="module-selector">
        {MODULES.map((m) => {
          const words = getModuleWords(m.key);
          const p = loadProgress(m.key);
          const count = p.learned.length;
          const total = words.length;
          return (
            <button
              key={m.key}
              className={`module-card ${selectedModule === m.key ? 'active' : ''} ${total === 0 ? 'empty' : ''}`}
              onClick={() => handleModuleChange(m.key)}
            >
              <span className="module-icon">{m.icon}</span>
              <span className="module-label">{m.label}</span>
              <span className="module-count">{count}/{total}</span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{learned}</div>
          <div className="stat-label">已学习</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{unlearned}</div>
          <div className="stat-label">未学习</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{mastered}</div>
          <div className="stat-label">已掌握</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{wrongCount}</div>
          <div className="stat-label">待复习</div>
        </div>
      </div>

      <div className="progress-bar-container">
        <div className="progress-bar-label">
          <span>学习进度</span>
          <span>{learned}/{totalWords} 词 ({progressPercent}%)</span>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {wrongCount > 0 && (
        <div className="home-suggestion">
          <span className="suggestion-icon">📝</span>
          <span>你有 {wrongCount} 个单词需要复习{unfamiliar > 0 ? `，还有 ${unfamiliar} 个标记为不熟` : ''}</span>
        </div>
      )}
      {wrongCount === 0 && unlearned > 0 && totalWords > 0 && (
        <div className="home-suggestion">
          <span className="suggestion-icon">💡</span>
          <span>{getDaySuggestion()}</span>
        </div>
      )}
      {totalWords === 0 && (
        <div className="home-suggestion">
          <span className="suggestion-icon">🚧</span>
          <span>该模块词库正在建设中，敬请期待！</span>
        </div>
      )}

      {/* Quick Actions */}
      <div className="home-actions-primary">
        <Link to={`/quick-review?module=${selectedModule}`} className="btn-primary btn-xlarge btn-green">
          ⚡ 快速识词
        </Link>
        <Link to={`/choice-quiz?module=${selectedModule}`} className="btn-primary btn-xlarge btn-orange">
          📝 选择练习
        </Link>
      </div>

      {/* Learn Start */}
      {totalWords > 0 && (
        <div className="learn-start-section">
          <div className="learn-start-header">
            <span className="learn-start-icon">📖</span>
            <span className="learn-start-title">逐词学习</span>
          </div>
          {lastPos > 0 && (
            <div className="learn-start-hint">
              上次学习到第 {lastPos + 1} 个单词
            </div>
          )}
          <div className="learn-start-row">
            <label className="learn-start-label">从第</label>
            <input
              type="number"
              className="learn-start-input"
              min={1}
              max={totalWords}
              value={startInput}
              onChange={(e) => setStartInput(e.target.value)}
            />
            <label className="learn-start-label">个开始</label>
            <button className="btn-action btn-primary" onClick={handleStartLearn}>
              开始学习
            </button>
          </div>
        </div>
      )}

      {/* Other Actions */}
      <div className="home-actions">
        <Link to={`/challenge?module=${selectedModule}`} className="btn-primary btn-large btn-purple">🎯 闯关模式</Link>
        <Link to={`/wrongbook?module=${selectedModule}`} className="btn-primary btn-large btn-red">📝 错词本 {wrongCount > 0 ? `(${wrongCount})` : ''}</Link>
        <Link to={`/chinese-challenge?module=${selectedModule}`} className="btn-primary btn-large">🀄 释义挑战</Link>
      </div>

      <div className="plan-section">
        <h2 className="section-title">📅 两天学习计划</h2>
        <div className="plan-cards">
          <div className={`plan-card ${progress.dayProgress.day1 ? 'completed' : ''}`}>
            <div className="plan-day">第1天</div>
            <div className="plan-desc">
              学习前一半单词<br />
              完成前 7 关
            </div>
            {progress.dayProgress.day1 && <div className="plan-check">✅ 已完成</div>}
          </div>
          <div className={`plan-card ${progress.dayProgress.day2 ? 'completed' : ''}`}>
            <div className="plan-day">第2天</div>
            <div className="plan-desc">
              学习后一半单词<br />
              完成后 7 关 + 总复习
            </div>
            {progress.dayProgress.day2 && <div className="plan-check">✅ 已完成</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
