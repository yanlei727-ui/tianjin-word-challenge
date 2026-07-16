import { Link } from 'react-router-dom';
import { BookOpen, Shapes, FileText, ListChecks, NotebookTabs, Star, Target, Zap, Pencil, Headphones, FileInput, ArrowRight } from 'lucide-react';
import { MODULES, getModuleWords } from '../utils/modules';
import { loadProgress } from '../utils/storage';

const SAMPLE_WORDS: Record<string, string[]> = {
  noun: ['school', 'family', 'country', 'water'],
  adj_adv: ['happy', 'quickly', 'beautiful', 'carefully'],
  verb: ['accept', 'achieve', 'believe', 'choose'],
};

const MODULE_ICONS: Record<string, typeof BookOpen> = {
  noun: BookOpen,
  adj_adv: Shapes,
  verb: FileText,
};

const MODULE_COLORS: Record<string, string> = {
  noun: 'var(--primary)',
  adj_adv: 'var(--green)',
  verb: 'var(--orange)',
};

export default function VocabularyCenter() {
  return (
    <div className="page vocabulary-center">
      {/* Word Lists */}
      <section className="vc-section">
        <h2 className="vc-section-title">单词本</h2>
        <p className="vc-section-desc">按词性分类学习，系统掌握中考核心词汇</p>
        <div className="vc-card-grid">
          {MODULES.map((m) => {
            const words = getModuleWords(m.key);
            const progress = loadProgress(m.key);
            const learned = progress.learned.length;
            const count = words.length;
            const samples = SAMPLE_WORDS[m.key] || [];
            const IconComp = MODULE_ICONS[m.key] || BookOpen;
            const iconColor = MODULE_COLORS[m.key] || 'var(--primary)';
            return (
              <Link
                key={m.key}
                to={`/wordlist?module=${m.key}`}
                className="vc-list-card"
              >
                <div className="home-module-icon" style={{ width: 40, height: 40, borderRadius: 10, background: `${iconColor}15` }}>
                  <IconComp size={22} strokeWidth={2} color={iconColor} />
                </div>
                <div className="vc-list-info">
                  <span className="vc-list-name">{m.label}</span>
                  <span className="vc-list-count">
                    {count > 0 ? `${count} 个单词${learned > 0 ? ` · 已学 ${learned} 个` : ''}` : '内容持续更新中'}
                  </span>
                  {count > 0 && samples.length > 0 && (
                    <div className="vc-list-bottom">
                      <span className="vc-list-samples">
                        {samples.join(' · ')}
                      </span>
                      <span className="vc-list-arrow-wrap">
                        <ArrowRight size={16} />
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Core Training */}
      <section className="vc-section vc-section-gap">
        <h2 className="vc-section-title">核心训练</h2>
        <p className="vc-section-desc">通过多种题型强化词义理解和快速识别</p>
        <div className="vc-training-grid">
          <Link to="/chinese-challenge" className="vc-training-card">
            <div className="vc-training-icon">
              <FileText size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">释义训练</span>
            <span className="vc-training-desc">看中文，写出对应英文</span>
          </Link>
          <Link to="/quick-review" className="vc-training-card">
            <div className="vc-training-icon">
              <Zap size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">快速识词</span>
            <span className="vc-training-desc">快速判断单词与中文释义</span>
          </Link>
          <Link to="/choice-quiz" className="vc-training-card">
            <div className="vc-training-icon">
              <ListChecks size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">选择练习</span>
            <span className="vc-training-desc">根据题目选择正确答案</span>
          </Link>
          <Link to="/auto-recognize" className="vc-training-card">
            <div className="vc-training-icon">
              <Headphones size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">听词速记</span>
            <span className="vc-training-desc">自动连续朗读单词，隐藏中文释义，快速建立词形与发音联系</span>
          </Link>

          <Link to="/spelling" className="vc-training-card">
            <div className="vc-training-icon">
              <Pencil size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">拼写训练</span>
            <span className="vc-training-desc">根据提示完成单词拼写</span>
          </Link>
          <Link to="/context-fill" className="vc-training-card">
            <div className="vc-training-icon">
              <FileInput size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">例句填空</span>
            <span className="vc-training-desc">结合语境完成单词填空</span>
          </Link>
        </div>
      </section>

      {/* Review */}
      <section className="vc-section vc-section-gap">
        <h2 className="vc-section-title">复习强化</h2>
        <p className="vc-section-desc">集中复习重点词和易错词，巩固学习成果</p>
        <div className="vc-training-grid vc-training-grid-2">
          <Link to="/favorites" className="vc-training-card">
            <div className="vc-training-icon">
              <Star size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">重点词</span>
            <span className="vc-training-desc">收藏的重点词汇</span>
          </Link>
          <Link to="/wrongbook" className="vc-training-card">
            <div className="vc-training-icon">
              <NotebookTabs size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">易错词</span>
            <span className="vc-training-desc">错词本强化练习</span>
          </Link>
          <Link to="/challenge" className="vc-training-card">
            <div className="vc-training-icon">
              <Target size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">闯关练习</span>
            <span className="vc-training-desc">分关卡挑战</span>
          </Link>
          <Link to="/favorite-quiz" className="vc-training-card">
            <div className="vc-training-icon">
              <Shapes size={26} strokeWidth={2} />
            </div>
            <span className="vc-training-name">闪卡复习</span>
            <span className="vc-training-desc">翻卡记忆</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
