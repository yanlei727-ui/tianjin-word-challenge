import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  loadProgress,
  exportProgress,
  importProgress,
  resetProgress,
} from '../utils/storage';
import { getModuleWords, type ModuleKey } from '../utils/modules';

export default function ProgressPage() {
  const [searchParams] = useSearchParams();
  const module: ModuleKey = (searchParams.get('module') as ModuleKey) || 'noun';
  const allWords = getModuleWords(module);

  const [progress, setProgress] = useState(loadProgress(module));
  const [importText, setImportText] = useState('');
  const [importMsg, setImportMsg] = useState('');
  const [showReset, setShowReset] = useState(false);

  const totalWords = allWords.length;
  const learned = progress.learned.length;
  const mastered = progress.mastered.length;
  const unfamiliar = progress.unfamiliar.length;
  const wrongCount = progress.wrongBook.length;
  const completedLevels = Object.values(progress.levelScores).filter((s) => s.completed).length;

  const handleExport = () => {
    const json = exportProgress(module);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tianjin-word-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (!importText.trim()) {
      setImportMsg('请粘贴学习记录 JSON 数据');
      return;
    }
    const ok = importProgress(importText);
    if (ok) {
      setProgress(loadProgress(module));
      setImportMsg('导入成功！');
      setImportText('');
    } else {
      setImportMsg('导入失败，请检查数据格式');
    }
  };

  const handleReset = () => {
    resetProgress(module);
    setProgress(loadProgress(module));
    setShowReset(false);
  };

  const avgStars = () => {
    const scores = Object.values(progress.levelScores);
    if (scores.length === 0) return 0;
    const totalStars = scores.reduce((sum, s) => sum + s.stars, 0);
    return (totalStars / 14).toFixed(1);
  };

  return (
    <div className="page progress-page">
      <h2 className="section-title">📊 学习进度</h2>

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
          <div className="stat-number">{unfamiliar}</div>
          <div className="stat-label">需复习</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{wrongCount}</div>
          <div className="stat-label">错词本</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{completedLevels}/14</div>
          <div className="stat-label">已完成关卡</div>
        </div>
      </div>

      <div className="progress-details">
        <h3>📅 两天学习计划</h3>
        <div className="plan-progress-cards">
          <div className="plan-progress-card">
            <div className="pp-label">第1天（单词 1-68，关卡 1-7）</div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill green"
                style={{
                  width: `${Math.min(
                    100,
                    (Object.entries(progress.levelScores)
                      .filter(([l, s]) => Number(l) <= 7 && s.completed).length / 7) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="pp-status">
              {progress.dayProgress.day1 ? '✅ 已完成' : '进行中'}
            </div>
          </div>
          <div className="plan-progress-card">
            <div className="pp-label">第2天（单词 69-136，关卡 8-14）</div>
            <div className="progress-bar">
              <div
                className="progress-bar-fill blue"
                style={{
                  width: `${Math.min(
                    100,
                    (Object.entries(progress.levelScores)
                      .filter(([l, s]) => Number(l) >= 8 && s.completed).length / 7) * 100
                  )}%`,
                }}
              />
            </div>
            <div className="pp-status">
              {progress.dayProgress.day2 ? '✅ 已完成' : '进行中'}
            </div>
          </div>
        </div>
      </div>

      <div className="progress-details">
        <h3>⭐ 闯关星级</h3>
        <div className="level-progress-grid">
          {Array.from({ length: 14 }, (_, i) => i + 1).map((level) => {
            const score = progress.levelScores[level];
            return (
              <div key={level} className="level-progress-item">
                <span className="lp-level">第{level}关</span>
                <span className="lp-stars">
                  {score ? '⭐'.repeat(score.stars) + '☆'.repeat(3 - score.stars) : '☆☆☆'}
                </span>
                <span className="lp-score">{score ? `${score.score}分` : '未完成'}</span>
              </div>
            );
          })}
        </div>
        <div className="lp-summary">
          平均星级：{avgStars()} | 总星数：{Object.values(progress.levelScores).reduce((s, v) => s + v.stars, 0)}/42
        </div>
      </div>

      <div className="progress-actions">
        <h3>⚙️ 数据管理</h3>
        <div className="data-actions">
          <button className="btn-action btn-primary" onClick={handleExport}>
            📤 导出学习记录
          </button>
          <div className="import-area">
            <textarea
              className="import-textarea"
              placeholder="粘贴学习记录 JSON 数据..."
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              rows={4}
            />
            <button className="btn-action btn-green" onClick={handleImport}>
              📥 导入学习记录
            </button>
            {importMsg && <div className="import-msg">{importMsg}</div>}
          </div>
          {!showReset ? (
            <button
              className="btn-action btn-red"
              onClick={() => setShowReset(true)}
            >
              🗑️ 重置学习记录
            </button>
          ) : (
            <div className="reset-confirm">
              <p>⚠️ 确定要重置所有学习记录吗？此操作不可恢复！</p>
              <div className="reset-buttons">
                <button className="btn-action btn-red" onClick={handleReset}>
                  确认重置
                </button>
                <button className="btn-action" onClick={() => setShowReset(false)}>
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
