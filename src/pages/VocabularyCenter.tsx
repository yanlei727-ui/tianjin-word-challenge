import { Link } from 'react-router-dom';
import { BookOpen, Shapes, FileText, ListChecks, NotebookTabs, Star, Target, Zap, Pencil, Headphones, FileInput, ArrowRight } from 'lucide-react';
import { MODULES, getModuleWords } from '../utils/modules';
import { loadProgress } from '../utils/storage';

const SAMPLE_WORDS: Record<string, string[]> = {
  noun: ['school', 'family', 'country', 'water'],
  adj_adv: ['happy', 'quickly', 'beautiful', 'carefully'],
  verb: ['accept', 'achieve', 'believe', 'choose'],
};

export default function VocabularyCenter() {
  return (
    <div className="page vocabulary-center">
      <div className="vc-header">
        <h1 className="vc-title">词汇中心</h1>
        <p className="vc-subtitle" style={{ color: 'var(--gray-600)' }}>中考核心词汇学习与训练</p>
      </div>

      {/* Word Lists */}
      <section className="vc-section">
        <h2 className="section-title">单词本</h2>
        <div className="vc-card-grid">
          {MODULES.map((m) => {
            const words = getModuleWords(m.key);
            const progress = loadProgress(m.key);
            const learned = progress.learned.length;
            const count = words.length;
            const samples = SAMPLE_WORDS[m.key] || [];
            return (
              <Link
                key={m.key}
                to={`/wordlist?module=${m.key}`}
                className="vc-list-card"
              >
                <div className="home-module-icon" style={{ width: 40, height: 40, borderRadius: 10 }}>
                  <BookOpen size={22} strokeWidth={2} />
                </div>
                <div className="vc-list-info">
                  <span className="vc-list-name">{m.label}</span>
                  <span className="vc-list-count">
                    {count > 0 ? `${count} 词${learned > 0 ? ` · 已学 ${learned} 词` : ''}` : '内容持续更新中'}
                  </span>
                  {count > 0 && samples.length > 0 && (
                    <span className="vc-list-count" style={{ marginTop: 1, fontSize: '0.72rem', color: 'var(--gray-400)' }}>
                      {samples.join(' · ')}
                    </span>
                  )}
                </div>
                {count > 0 && <ArrowRight size={16} color="var(--gray-400)" />}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Core Training */}
      <section className="vc-section">
        <h2 className="section-title">核心训练</h2>
        <div className="vc-training-grid">
          <Link to="/chinese-challenge" className="vc-training-card">
            <div className="vc-training-icon">
              <FileText size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">释义训练</span>
            <span className="vc-training-desc">看中文写英文</span>
          </Link>
          <Link to="/quick-review" className="vc-training-card">
            <div className="vc-training-icon">
              <Zap size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">快速识词</span>
            <span className="vc-training-desc">快速标记认识</span>
          </Link>
          <Link to="/choice-quiz" className="vc-training-card">
            <div className="vc-training-icon">
              <ListChecks size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">选择练习</span>
            <span className="vc-training-desc">选择正确释义</span>
          </Link>
          <div className="vc-training-card coming-soon">
            <span className="vc-training-badge">即将上线</span>
            <div className="vc-training-icon">
              <Pencil size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">拼写训练</span>
            <span className="vc-training-desc">拼写强化练习</span>
          </div>
          <div className="vc-training-card coming-soon">
            <span className="vc-training-badge">即将上线</span>
            <div className="vc-training-icon">
              <Headphones size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">听音选词</span>
            <span className="vc-training-desc">听力词汇训练</span>
          </div>
          <div className="vc-training-card coming-soon">
            <span className="vc-training-badge">即将上线</span>
            <div className="vc-training-icon">
              <FileInput size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">例句填空</span>
            <span className="vc-training-desc">语境词汇运用</span>
          </div>
        </div>
      </section>

      {/* Review */}
      <section className="vc-section">
        <h2 className="section-title">复习强化</h2>
        <div className="vc-training-grid vc-training-grid-2">
          <Link to="/favorites" className="vc-training-card">
            <div className="vc-training-icon">
              <Star size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">重点词</span>
            <span className="vc-training-desc">收藏的重点词汇</span>
          </Link>
          <Link to="/wrongbook" className="vc-training-card">
            <div className="vc-training-icon">
              <NotebookTabs size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">易错词</span>
            <span className="vc-training-desc">错词本强化练习</span>
          </Link>
          <Link to="/challenge" className="vc-training-card">
            <div className="vc-training-icon">
              <Target size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">闯关练习</span>
            <span className="vc-training-desc">分关卡挑战</span>
          </Link>
          <Link to="/favorite-quiz" className="vc-training-card">
            <div className="vc-training-icon">
              <Shapes size={24} strokeWidth={2} />
            </div>
            <span className="vc-training-name">闪卡复习</span>
            <span className="vc-training-desc">翻卡记忆</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
