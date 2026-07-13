import { useState } from 'react';
import { Link } from 'react-router-dom';
import { loadProgress } from '../utils/storage';
import { getModuleWords, MODULES } from '../utils/modules';
import { EmptyState } from '../components/shared';

interface Task {
  id: string;
  title: string;
  module: string;
  status: 'pending' | 'done';
}

const STORAGE_KEY = 'tianjin-word-challenge-plan-tasks';

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveTasks(tasks: Task[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch { /* ignore */ }
}

export default function PlanPage() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [newTitle, setNewTitle] = useState('');

  const addTask = () => {
    if (!newTitle.trim()) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTitle.trim(),
      module: 'custom',
      status: 'pending',
    };
    const updated = [...tasks, task];
    setTasks(updated);
    saveTasks(updated);
    setNewTitle('');
  };

  const toggleTask = (id: string) => {
    const updated: Task[] = tasks.map((t) =>
      t.id === id ? { ...t, status: (t.status === 'done' ? 'pending' : 'done') as 'pending' | 'done' } : t
    );
    setTasks(updated);
    saveTasks(updated);
  };

  const deleteTask = (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    setTasks(updated);
    saveTasks(updated);
  };

  // Calculate vocab stats
  let totalWords = 0;
  let totalLearned = 0;
  for (const m of MODULES) {
    const words = getModuleWords(m.key);
    totalWords += words.length;
    const progress = loadProgress(m.key);
    totalLearned += progress.learned.length;
  }

  const totalWrong = MODULES.reduce((sum, m) => sum + loadProgress(m.key).wrongBook.length, 0);

  return (
    <div className="page plan-page">
      <div className="module-page-header">
        <Link to="/" className="btn-back">← 返回首页</Link>
        <h1>📋 学习计划</h1>
        <p className="module-page-subtitle">规划你的学习进度</p>
      </div>

      {/* Today's Overview */}
      <div className="plan-overview">
        <div className="plan-stat-card">
          <div className="plan-stat-number">{totalLearned}</div>
          <div className="plan-stat-label">已学单词</div>
        </div>
        <div className="plan-stat-card">
          <div className="plan-stat-number">{totalWords - totalLearned}</div>
          <div className="plan-stat-label">待学习</div>
        </div>
        <div className="plan-stat-card">
          <div className="plan-stat-number">{totalWrong}</div>
          <div className="plan-stat-label">待复习错题</div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="plan-quick-links">
        <h2 className="section-title">快捷入口</h2>
        <div className="plan-links-grid">
          <Link to="/vocabulary" className="plan-quick-card">
            <span>📖</span>
            <span>词汇学习</span>
          </Link>
          <Link to="/wrongbook" className="plan-quick-card">
            <span>📕</span>
            <span>错词复习</span>
          </Link>
          <Link to="/favorites" className="plan-quick-card">
            <span>⭐</span>
            <span>重点词复习</span>
          </Link>
          <Link to="/grammar" className="plan-quick-card">
            <span>📐</span>
            <span>语法练习</span>
          </Link>
        </div>
      </div>

      {/* Tasks */}
      <div className="plan-tasks-section">
        <h2 className="section-title">我的任务</h2>

        <div className="plan-add-task">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="添加学习任务..."
            className="plan-task-input"
          />
          <button className="btn-action btn-primary" onClick={addTask}>添加</button>
        </div>

        {tasks.length === 0 ? (
          <EmptyState
            icon="📋"
            title="暂无学习任务"
            hint="点击上方输入框添加你的学习计划"
          />
        ) : (
          <div className="plan-task-list">
            {tasks.map((task) => (
              <div key={task.id} className={`plan-task-card ${task.status === 'done' ? 'done' : ''}`}>
                <button className="plan-task-check" onClick={() => toggleTask(task.id)}>
                  {task.status === 'done' ? '✅' : '⬜'}
                </button>
                <span className="plan-task-title">{task.title}</span>
                <button className="plan-task-delete" onClick={() => deleteTask(task.id)}>
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
