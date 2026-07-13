import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { loadProgress } from '../utils/storage';
import { getModuleWords, MODULES, type ModuleKey } from '../utils/modules';
import { EmptyState } from '../components/shared';

type FilterTab = 'all' | 'vocabulary' | 'grammar' | 'reading' | 'cloze' | 'writing';
type StatusTab = 'all' | 'pending' | 'reviewing' | 'mastered';

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'vocabulary', label: '词汇' },
  { key: 'grammar', label: '语法' },
  { key: 'reading', label: '阅读' },
  { key: 'cloze', label: '完形' },
  { key: 'writing', label: '作文' },
];

export default function MistakesPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [statusTab, setStatusTab] = useState<StatusTab>('all');

  // Collect vocabulary wrong records from all modules
  const vocabMistakes = useMemo(() => {
    const mistakes: { word: string; phonetic: string; meaning: string; module: ModuleKey; wordId: number; count: number; lastWrongTime: string }[] = [];
    for (const m of MODULES) {
      const progress = loadProgress(m.key);
      const words = getModuleWords(m.key);
      for (const record of progress.wrongBook) {
        const wordData = words.find((w) => w.id === record.wordId);
        if (wordData) {
          mistakes.push({
            word: wordData.word,
            phonetic: wordData.phonetic,
            meaning: wordData.meaning,
            module: m.key,
            wordId: record.wordId,
            count: record.count,
            lastWrongTime: record.lastWrongTime,
          });
        }
      }
    }
    return mistakes;
  }, []);

  const filteredMistakes = useMemo(() => {
    let list = vocabMistakes;
    if (activeTab !== 'all') {
      if (activeTab === 'vocabulary') {
        // already filtered
      } else {
        // Other tabs have no data yet
        list = [];
      }
    }
    return list;
  }, [vocabMistakes, activeTab]);

  const totalCount = vocabMistakes.length;

  return (
    <div className="page mistakes-page">
      <div className="module-page-header">
        <Link to="/" className="btn-back">← 返回首页</Link>
        <h1>📕 错题本</h1>
        <p className="module-page-subtitle">全部错题集中管理</p>
      </div>

      {/* Filter tabs */}
      <div className="mistakes-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`mistakes-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="mistakes-status-tabs">
        <button className={`mistakes-status ${statusTab === 'all' ? 'active' : ''}`} onClick={() => setStatusTab('all')}>
          全部 ({totalCount})
        </button>
        <button className={`mistakes-status ${statusTab === 'pending' ? 'active' : ''}`} onClick={() => setStatusTab('pending')}>
          待复习 ({totalCount})
        </button>
        <button className={`mistakes-status ${statusTab === 'mastered' ? 'active' : ''}`} onClick={() => setStatusTab('mastered')}>
          已掌握 (0)
        </button>
      </div>

      {/* Mistakes list */}
      {filteredMistakes.length === 0 ? (
        <EmptyState
          icon="🎉"
          title={activeTab === 'all' ? '错题本为空' : `${TABS.find((t) => t.key === activeTab)?.label}暂无错题`}
          hint={totalCount > 0 ? '切换分类查看更多错题' : '继续加油，做错了会自动添加到这里'}
          action={
            <Link to="/vocabulary" className="btn-action btn-primary">
              去学习
            </Link>
          }
        />
      ) : (
        <div className="mistakes-list">
          {filteredMistakes.map((m) => (
            <div key={`${m.module}-${m.wordId}`} className="mistake-card">
              <div className="mistake-top">
                <div>
                  <span className="mistake-word">{m.word}</span>
                  <span className="mistake-phonetic">{m.phonetic}</span>
                </div>
                <span className="mistake-count">错误 {m.count} 次</span>
              </div>
              <div className="mistake-meaning">{m.meaning}</div>
              <div className="mistake-bottom">
                <span className="mistake-module">{MODULES.find((mod) => mod.key === m.module)?.icon} {MODULES.find((mod) => mod.key === m.module)?.label}</span>
                <span className="mistake-time">{new Date(m.lastWrongTime).toLocaleDateString('zh-CN')}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
