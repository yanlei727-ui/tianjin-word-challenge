import { useState, useMemo } from 'react';
import { Shapes, ArrowLeft, ArrowRight, Construction, CheckCircle, XCircle } from 'lucide-react';
import { grammarTopics, getGrammarTopic } from '../data/grammar-topics';
import { addGrammarWrongRecord } from '../utils/storage';
import type { GrammarTopic } from '../types';

type View = 'list' | 'detail';

export default function GrammarPage() {
  const [view, setView] = useState<View>('list');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('knowledge');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const selectedTopic = useMemo(() => {
    if (!selectedTopicId) return null;
    return getGrammarTopic(selectedTopicId) || null;
  }, [selectedTopicId]);

  const handleSelectTopic = (topic: GrammarTopic) => {
    setSelectedTopicId(topic.id);
    setView('detail');
    setActiveSection('knowledge');
    setAnswers({});
    setSubmitted(false);
  };

  const handleBack = () => {
    setView('list');
    setSelectedTopicId(null);
    setAnswers({});
    setSubmitted(false);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!selectedTopic) return;
    setSubmitted(true);
    // Record wrong answers
    for (const ex of selectedTopic.exercises) {
      const userAnswer = answers[ex.id];
      if (userAnswer && userAnswer !== ex.correctAnswer) {
        addGrammarWrongRecord({
          questionId: ex.id,
          topicId: selectedTopic.id,
          wrongAnswer: userAnswer,
          correctAnswer: ex.correctAnswer,
          explanation: ex.explanation,
        });
      }
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
  };

  const sectionTabs = [
    { key: 'knowledge', label: '知识讲解' },
    { key: 'examples', label: '例句理解' },
    { key: 'mistakes', label: '易错辨析' },
    { key: 'exercises', label: '专项练习' },
  ];

  if (view === 'detail' && selectedTopic) {
    return (
      <div className="page grammar-page">
        <div className="module-page-header">
          <button className="btn-back" onClick={handleBack}>
            <ArrowLeft size={16} style={{ marginRight: 4, verticalAlign: -2 }} /> 返回
          </button>
          <h1><Shapes size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 语法专项</h1>
        </div>

        {/* Topic Header */}
        <div className="grammar-topic-header">
          <h2>{selectedTopic.title}</h2>
          <p>{selectedTopic.subtitle}</p>
        </div>

        {/* Section Tabs */}
        <div className="grammar-section-tabs">
          {sectionTabs.map((tab) => (
            <button
              key={tab.key}
              className={`grammar-section-tab ${activeSection === tab.key ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Knowledge Section */}
        {activeSection === 'knowledge' && (
          <div className="grammar-section-content">
            {selectedTopic.sections
              .filter((s) => s.type === 'knowledge' || s.type === 'tips')
              .map((section) => (
                <div key={section.id} className="grammar-knowledge-block">
                  <h3 className="grammar-kb-title">{section.title}</h3>
                  {section.content && <p className="grammar-kb-content">{section.content}</p>}
                  {section.items && section.items.length > 0 && (
                    <div className="grammar-kb-items">
                      {section.items.map((item, i) => (
                        <div key={i} className="grammar-kb-item">
                          {item.label && <div className="grammar-kb-label">{item.label}</div>}
                          {item.english && <div className="grammar-kb-english">{item.english}</div>}
                          {item.chinese && <div className="grammar-kb-chinese">{item.chinese}</div>}
                          {item.note && <div className="grammar-kb-note">{item.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Examples Section */}
        {activeSection === 'examples' && (
          <div className="grammar-section-content">
            {selectedTopic.sections
              .filter((s) => s.type === 'examples')
              .map((section) => (
                <div key={section.id} className="grammar-knowledge-block">
                  <h3 className="grammar-kb-title">{section.title}</h3>
                  {section.items && section.items.length > 0 && (
                    <div className="grammar-kb-items">
                      {section.items.map((item, i) => (
                        <div key={i} className="grammar-example-item">
                          <div className="grammar-example-en">{item.english}</div>
                          <div className="grammar-example-zh">{item.chinese}</div>
                          {item.note && <div className="grammar-example-note">💡 {item.note}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Mistakes Section */}
        {activeSection === 'mistakes' && (
          <div className="grammar-section-content">
            {selectedTopic.sections
              .filter((s) => s.type === 'mistakes')
              .map((section) => (
                <div key={section.id} className="grammar-knowledge-block">
                  <h3 className="grammar-kb-title">{section.title}</h3>
                  {section.items && section.items.length > 0 && (
                    <div className="grammar-kb-items">
                      {section.items.map((item, i) => (
                        <div key={i} className="grammar-mistake-item">
                          <div className="grammar-mistake-label">⚠️ {item.label}</div>
                          {item.english && <div className="grammar-mistake-english">{item.english}</div>}
                          {item.chinese && <div className="grammar-mistake-chinese">{item.chinese}</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}

        {/* Exercises Section */}
        {activeSection === 'exercises' && (
          <div className="grammar-section-content">
            <div className="grammar-exercise-header">
              <span>共 {selectedTopic.exercises.length} 题</span>
              {submitted && (
                <span className="grammar-exercise-score">
                  正确 {selectedTopic.exercises.filter((ex) => answers[ex.id] === ex.correctAnswer).length} / {selectedTopic.exercises.length}
                </span>
              )}
            </div>

            {selectedTopic.exercises.map((ex, i) => (
              <div key={ex.id} className="grammar-exercise-card">
                <div className="grammar-exercise-meta">
                  <span className={`grammar-difficulty ${ex.difficulty}`}>
                    {ex.difficulty === 'basic' ? '基础' : '提升'}
                  </span>
                  <span className="grammar-knowledge-tag">{ex.knowledgePoint}</span>
                </div>
                <p className="grammar-q-stem">{i + 1}. {ex.stem}</p>
                {ex.type === 'choice' && ex.options && (
                  <div className="grammar-options">
                    {ex.options.map((opt, oi) => {
                      const isSelected = answers[ex.id] === opt;
                      const isCorrect = submitted && opt === ex.correctAnswer;
                      const isWrong = submitted && isSelected && opt !== ex.correctAnswer;
                      return (
                        <button
                          key={oi}
                          className={`grammar-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${isSelected && !submitted ? 'selected' : ''}`}
                          onClick={() => handleAnswer(ex.id, opt)}
                          disabled={submitted}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                          <span className="option-text">{opt}</span>
                          {isCorrect && <CheckCircle size={16} className="option-icon" />}
                          {isWrong && <XCircle size={16} className="option-icon" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {ex.type === 'fill' && (
                  <div className="grammar-fill-area">
                    <input
                      type="text"
                      className={`grammar-fill-input ${submitted ? (answers[ex.id] === ex.correctAnswer ? 'correct' : 'wrong') : ''}`}
                      value={answers[ex.id] || ''}
                      onChange={(e) => handleAnswer(ex.id, e.target.value)}
                      placeholder="请输入答案"
                      disabled={submitted}
                    />
                  </div>
                )}
                {submitted && (
                  <div className={`grammar-exercise-feedback ${answers[ex.id] === ex.correctAnswer ? 'correct' : 'wrong'}`}>
                    <div className="grammar-feedback-answer">
                      正确答案：{ex.correctAnswer}
                    </div>
                    <div className="grammar-feedback-explanation">{ex.explanation}</div>
                    {ex.mistakeReason && (
                      <div className="grammar-feedback-mistake">⚠️ 易错原因：{ex.mistakeReason}</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {!submitted ? (
              <button
                className="btn-action btn-primary btn-large"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < selectedTopic.exercises.length}
              >
                提交答案
              </button>
            ) : (
              <div className="grammar-exercise-actions">
                <button className="btn-action btn-primary" onClick={handleRetry}>
                  重新作答
                </button>
                <button className="btn-action" onClick={handleBack}>
                  返回列表
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // List View
  return (
    <div className="page grammar-page">
      <div className="module-page-header">
        <h1><Shapes size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 语法专项</h1>
        <p className="module-page-subtitle">系统梳理中考语法知识点</p>
      </div>

      <div className="module-intro-card">
        <p>语法专项涵盖中考常考语法点，包括名词、冠词、代词、数词、介词、连词、形容词副词、动词时态等。</p>
      </div>

      <div className="grammar-topic-list">
        {grammarTopics.map((topic) => (
          <button
            key={topic.id}
            className="grammar-topic-card"
            onClick={() => handleSelectTopic(topic)}
          >
            <div className="grammar-topic-info">
              <div className="grammar-topic-name">{topic.title}</div>
              <div className="grammar-topic-desc">{topic.subtitle}</div>
              <div className="grammar-topic-meta">
                <span>{topic.sections.length} 个知识板块</span>
                <span>{topic.exercises.length} 道练习</span>
              </div>
            </div>
            <div className="grammar-topic-arrow">
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
          <div className="shared-coming-title">更多语法专题持续更新中</div>
          <div className="shared-coming-tags">数词 · 介词 · 连词 · 动词时态 · 被动语态 · 复合句</div>
        </div>
      </div>
    </div>
  );
}
