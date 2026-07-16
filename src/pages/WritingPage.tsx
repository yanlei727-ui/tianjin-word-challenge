import { useState } from 'react';
import { PenLine, ArrowLeft, ArrowRight, CheckCircle2, Lightbulb } from 'lucide-react';
import { sampleWritingTopics } from '../data/sample-writing';

type View = 'list' | 'write';

export default function WritingPage() {
  const [view, setView] = useState<View>('list');
  const [selectedTopic, setSelectedTopic] = useState<typeof sampleWritingTopics[0] | null>(null);
  const [userEssay, setUserEssay] = useState('');
  const [showReference, setShowReference] = useState(false);

  if (view === 'write' && selectedTopic) {
    return (
      <div className="page writing-page">
        <div className="module-page-header">
          <button className="btn-back" onClick={() => { setView('list'); setSelectedTopic(null); setUserEssay(''); setShowReference(false); }}>
            <ArrowLeft size={16} style={{ marginRight: 4, verticalAlign: -2 }} /> 返回
          </button>
          <h1><PenLine size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 作文训练</h1>
        </div>

        <div className="writing-exercise">
          <h2 className="writing-topic-title">{selectedTopic.title}</h2>
          {selectedTopic.examYear && <div className="writing-exam-badge">天津中考 {selectedTopic.examYear} 真题训练 · 15 分书面表达</div>}
          {selectedTopic.sourceNote && <p className="writing-source-note">题干依据：{selectedTopic.sourceNote}</p>}

          <div className="writing-prompt-card">
            <h3>写作要求</h3>
            <p>{selectedTopic.prompt}</p>
            <ul className="writing-requirements">
              {selectedTopic.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>

          <div className="writing-outline-card">
            <h3>写作提纲</h3>
            <ol className="writing-outline-list">
              {selectedTopic.outline.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ol>
          </div>

          <div className="writing-method-card">
            <div className="writing-method-title"><Lightbulb size={18} /> 考场写作四步法</div>
            <ol className="writing-method-steps"><li>圈要点：把题目中的人物、事件、结果和感受逐项勾出。</li><li>定时态：故事经过用过去时，观点和感受用现在时。</li><li>搭骨架：开头点题，中间按顺序写，结尾写感受或建议。</li><li>最后检查：人称、动词形式、拼写和词数是否合适。</li></ol>
            {selectedTopic.writingTips && <div className="writing-topic-tips">{selectedTopic.writingTips.map((tip) => <p key={tip}><CheckCircle2 size={15} /> {tip}</p>)}</div>}
          </div>

          <div className="writing-input-card">
            <h3>你的作文</h3>
            <textarea
              className="writing-textarea"
              value={userEssay}
              onChange={(e) => setUserEssay(e.target.value)}
              placeholder="在这里输入你的作文..."
              rows={10}
            />
            <div className="writing-word-count">已输入 {userEssay.split(/\s+/).filter(Boolean).length} 词</div>
          </div>

          {!showReference ? (
            <button className="btn-action btn-primary btn-large" onClick={() => setShowReference(true)}>
              查看参考范文
            </button>
          ) : (
            <div className="writing-reference-card">
              <h3>参考范文</h3>
              <div className="writing-reference-text">
                {selectedTopic.referenceEssay?.split('\n').map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              {selectedTopic.goodSentences && selectedTopic.goodSentences.length > 0 && (
                <div className="writing-good-sentences">
                  <h4>好词好句</h4>
                  <ul>
                    {selectedTopic.goodSentences.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="page writing-page">
      <div className="module-page-header">
        <h1><PenLine size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 作文训练</h1>
        <p className="module-page-subtitle">中考英语写作能力提升</p>
      </div>

      <div className="module-intro-card writing-hero-card">
        <p><strong>先练真题，再学方法。</strong>天津中考书面表达常用书信形式，重点考查“把一件事写清楚，再说出自己的想法”。每道题都配有审题清单和初中生可学会的范文。</p>
      </div>

      <div className="writing-list">
        <h2 className="writing-list-heading">近三年天津中考真题</h2>
        {sampleWritingTopics.filter((topic) => topic.examYear).sort((a, b) => (b.examYear || 0) - (a.examYear || 0)).map((topic) => (
          <button
            key={topic.id}
            className="writing-list-card"
            onClick={() => { setSelectedTopic(topic); setView('write'); }}
          >
            <div className="writing-list-info">
              <div className="writing-list-title">{topic.title} <span className="writing-year-tag">{topic.examYear}</span></div>
              <div className="writing-list-prompt">{topic.prompt}</div>
            </div>
            <div className="writing-list-arrow">
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
        <h2 className="writing-list-heading writing-list-heading-extra">拓展主题练习</h2>
        {sampleWritingTopics.filter((topic) => !topic.examYear).map((topic) => (
          <button key={topic.id} className="writing-list-card" onClick={() => { setSelectedTopic(topic); setView('write'); }}><div className="writing-list-info"><div className="writing-list-title">{topic.title}</div><div className="writing-list-prompt">{topic.prompt}</div></div><div className="writing-list-arrow"><ArrowRight size={16} /></div></button>
        ))}
      </div>

    </div>
  );
}
