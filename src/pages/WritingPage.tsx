import { useState } from 'react';
import { PenLine, ArrowLeft, ArrowRight, Construction } from 'lucide-react';
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

        <div className="grammar-sample-tag">📌 示例内容，仅供框架验证</div>
      </div>
    );
  }

  return (
    <div className="page writing-page">
      <div className="module-page-header">
        <h1><PenLine size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 作文训练</h1>
        <p className="module-page-subtitle">中考英语写作能力提升</p>
      </div>

      <div className="module-intro-card">
        <p>作文训练涵盖书信、日记、议论文、看图作文等常考题型，提供审题指导和范文参考。</p>
      </div>

      <div className="writing-list">
        {sampleWritingTopics.map((topic) => (
          <button
            key={topic.id}
            className="writing-list-card"
            onClick={() => { setSelectedTopic(topic); setView('write'); }}
          >
            <div className="writing-list-info">
              <div className="writing-list-title">{topic.title}</div>
              <div className="writing-list-prompt">{topic.prompt}</div>
            </div>
            <div className="writing-list-arrow">
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>

      <div className="shared-coming-soon">
        <div className="shared-coming-icon">
          <Construction size={20} />
        </div>
        <div className="shared-coming-body">
          <div className="shared-coming-title">更多作文题目持续更新中</div>
          <div className="shared-coming-tags">书信写作 · 日记写作 · 议论文 · 看图作文 · 话题作文</div>
        </div>
      </div>

      <div className="grammar-sample-tag">📌 以上为示例内容，更多作文题目持续添加中</div>
    </div>
  );
}
