import { useState, useMemo } from 'react';
import { Shapes, ArrowRight, ChevronRight, CheckCircle, XCircle, BookOpen, Lightbulb, AlertTriangle, PenLine } from 'lucide-react';
import { grammarTopics, getGrammarTopic } from '../data/grammar-topics';
import { addGrammarWrongRecord } from '../utils/storage';
import type { GrammarTopic } from '../types';

type View = 'list' | 'detail';

const sectionIcons: Record<string, React.ReactNode> = {
  knowledge: <BookOpen size={14} />,
  examples: <Lightbulb size={14} />,
  mistakes: <AlertTriangle size={14} />,
  exercises: <PenLine size={14} />,
};

const topicIcons: Record<string, React.ReactNode> = {
  'grammar-noun': <span style={{ fontSize: '1.2rem' }}>📖</span>,
  'grammar-article': <span style={{ fontSize: '1.2rem' }}>📘</span>,
  'grammar-pronoun': <span style={{ fontSize: '1.2rem' }}>📙</span>,
  'grammar-numeral': <span style={{ fontSize: '1.2rem' }}>🔢</span>,
  'grammar-preposition': <span style={{ fontSize: '1.2rem' }}>📍</span>,
  'grammar-conjunction': <span style={{ fontSize: '1.2rem' }}>🔗</span>,
  'grammar-adj-adv': <span style={{ fontSize: '1.2rem' }}>⚖️</span>,
  'grammar-verb-usage': <span style={{ fontSize: '1.2rem' }}>⚡</span>,
  'grammar-modal': <span style={{ fontSize: '1.2rem' }}>🎓</span>,
  'grammar-simple-tenses': <span style={{ fontSize: '1.2rem' }}>⏰</span>,
  'grammar-progressive-tenses': <span style={{ fontSize: '1.2rem' }}>🔄</span>,
  'grammar-present-perfect': <span style={{ fontSize: '1.2rem' }}>✅</span>,
};

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
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setView('list');
    setSelectedTopicId(null);
    setAnswers({});
    setSubmitted(false);
    window.scrollTo(0, 0);
  };

  const handleAnswer = (questionId: string, answer: string) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    if (!selectedTopic) return;
    setSubmitted(true);
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sectionTabs = [
    { key: 'knowledge', label: '知识讲解' },
    { key: 'examples', label: '例句理解' },
    { key: 'mistakes', label: '易错辨析' },
    { key: 'exercises', label: '专项练习' },
  ];

  if (view === 'detail' && selectedTopic) {
    return (
      <div className="g-page">
        {/* Breadcrumb */}
        <div className="g-breadcrumb">
          <button className="g-breadcrumb-link" onClick={handleBack}>语法专项</button>
          <ChevronRight size={14} className="g-breadcrumb-sep" />
          <span className="g-breadcrumb-current">{selectedTopic.title}</span>
        </div>

        {/* Topic Header */}
        <div className="g-topic-header">
          <h1 className="g-topic-title">{selectedTopic.title}</h1>
          <p className="g-topic-subtitle">{selectedTopic.subtitle}</p>
          <p className="g-topic-meta">{selectedTopic.sections.length} 个知识板块 · {selectedTopic.exercises.length} 道专项练习</p>
        </div>

        {/* Section Tabs */}
        <div className="g-section-tabs">
          {sectionTabs.map((tab, i) => (
            <button
              key={tab.key}
              className={`g-section-tab ${activeSection === tab.key ? 'active' : ''}`}
              onClick={() => setActiveSection(tab.key)}
            >
              <span className="g-section-tab-num">{i + 1}</span>
              {sectionIcons[tab.key]}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Knowledge Section */}
        {activeSection === 'knowledge' && (
          <div className="g-section-content">
            {selectedTopic.sections
              .filter((s) => s.type === 'knowledge' || s.type === 'tips')
              .map((section) => (
                <div key={section.id} className="g-kb">
                  <h3 className="g-kb-title">{section.title}</h3>
                  {section.content && <p className="g-kb-content">{section.content}</p>}
                  {section.items && section.items.length > 0 && (
                    <div className="g-kb-items">
                      {section.items.map((item, i) => (
                        <div key={i} className="g-kb-item">
                          {item.label && <div className="g-kb-label">{item.label}</div>}
                          {item.english && <div className="g-kb-english">{item.english}</div>}
                          {item.chinese && <div className="g-kb-chinese">{item.chinese}</div>}
                          {item.note && <div className="g-kb-note">{item.note}</div>}
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
          <div className="g-section-content">
            {selectedTopic.sections
              .filter((s) => s.type === 'examples')
              .map((section) => (
                <div key={section.id}>
                  <h3 className="g-section-title">{section.title}</h3>
                  <div className="g-examples-grid">
                    {section.items && section.items.map((item, i) => (
                      <div key={i} className="g-example-card">
                        <div className="g-example-en">{item.english}</div>
                        <div className="g-example-zh">{item.chinese}</div>
                        {item.note && (
                          <div className="g-example-note">
                            <span className="g-example-tag">考点</span>
                            {item.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Mistakes Section */}
        {activeSection === 'mistakes' && (
          <div className="g-section-content">
            {selectedTopic.sections
              .filter((s) => s.type === 'mistakes')
              .map((section) => (
                <div key={section.id}>
                  <h3 className="g-section-title">{section.title}</h3>
                  <div className="g-mistakes-list">
                    {section.items && section.items.map((item, i) => (
                      <div key={i} className="g-mistake-card">
                        <div className="g-mistake-title">{item.label}</div>
                        {item.english && <div className="g-mistake-english">{item.english}</div>}
                        {item.chinese && <div className="g-mistake-chinese">{item.chinese}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Exercises Section */}
        {activeSection === 'exercises' && (
          <div className="g-section-content g-exercises-area">
            <div className="g-exercise-header">
              <span>共 {selectedTopic.exercises.length} 题</span>
              {submitted && (
                <span className="g-exercise-score">
                  正确 {selectedTopic.exercises.filter((ex) => answers[ex.id] === ex.correctAnswer).length} / {selectedTopic.exercises.length}
                </span>
              )}
            </div>

            {selectedTopic.exercises.map((ex, i) => (
              <div key={ex.id} className="g-exercise-card">
                <div className="g-exercise-top">
                  <span className="g-exercise-num">第 {i + 1} 题</span>
                  <span className={`g-difficulty ${ex.difficulty}`}>
                    {ex.difficulty === 'basic' ? '基础' : '提升'}
                  </span>
                  <span className="g-knowledge-tag">{ex.knowledgePoint}</span>
                </div>
                <p className="g-q-stem">{ex.stem}</p>
                {ex.type === 'choice' && ex.options && (
                  <div className="g-options">
                    {ex.options.map((opt, oi) => {
                      const isSelected = answers[ex.id] === opt;
                      const isCorrect = submitted && opt === ex.correctAnswer;
                      const isWrong = submitted && isSelected && opt !== ex.correctAnswer;
                      return (
                        <button
                          key={oi}
                          className={`g-option ${isCorrect ? 'correct' : ''} ${isWrong ? 'wrong' : ''} ${isSelected && !submitted ? 'selected' : ''}`}
                          onClick={() => handleAnswer(ex.id, opt)}
                          disabled={submitted}
                        >
                          <span className="g-option-letter">{String.fromCharCode(65 + oi)}</span>
                          <span className="g-option-text">{opt}</span>
                          {isCorrect && <CheckCircle size={14} className="g-option-icon" />}
                          {isWrong && <XCircle size={14} className="g-option-icon" />}
                        </button>
                      );
                    })}
                  </div>
                )}
                {ex.type === 'fill' && (
                  <div className="g-fill-area">
                    <input
                      type="text"
                      className={`g-fill-input ${submitted ? (answers[ex.id] === ex.correctAnswer ? 'correct' : 'wrong') : ''}`}
                      value={answers[ex.id] || ''}
                      onChange={(e) => handleAnswer(ex.id, e.target.value)}
                      placeholder="请输入答案"
                      disabled={submitted}
                    />
                  </div>
                )}
                {submitted && (
                  <div className={`g-feedback ${answers[ex.id] === ex.correctAnswer ? 'correct' : 'wrong'}`}>
                    <div className="g-feedback-answer">
                      正确答案：{ex.correctAnswer}
                    </div>
                    <div className="g-feedback-explanation">{ex.explanation}</div>
                    {ex.mistakeReason && (
                      <div className="g-feedback-mistake">易错原因：{ex.mistakeReason}</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {!submitted ? (
              <button
                className="g-submit-btn"
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < selectedTopic.exercises.length}
              >
                提交答案
              </button>
            ) : (
              <div className="g-exercise-actions">
                <button className="g-action-btn primary" onClick={handleRetry}>
                  重新作答
                </button>
                <button className="g-action-btn" onClick={handleBack}>
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
    <div className="g-page">
      <div className="g-list-header">
        <h1 className="g-list-title">语法专项</h1>
        <p className="g-list-subtitle">系统梳理中考语法知识点，涵盖名词、冠词、代词、时态、语态等核心板块。</p>
      </div>

      <div className="g-topic-grid">
        {grammarTopics.map((topic) => (
          <button
            key={topic.id}
            className="g-topic-card"
            onClick={() => handleSelectTopic(topic)}
          >
            <div className="g-topic-card-icon">
              {topicIcons[topic.id] || <Shapes size={20} />}
            </div>
            <div className="g-topic-card-info">
              <div className="g-topic-card-name">{topic.title}</div>
              <div className="g-topic-card-desc">{topic.subtitle}</div>
              <div className="g-topic-card-meta">
                {topic.sections.length} 个知识板块 · {topic.exercises.length} 道练习
              </div>
            </div>
            <div className="g-topic-card-arrow">
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
