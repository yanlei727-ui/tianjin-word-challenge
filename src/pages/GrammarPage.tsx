import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleGrammarTopics } from '../data/sample-grammar';
import { ComingSoonState } from '../components/shared';

type View = 'list' | 'detail' | 'exercise';

export default function GrammarPage() {
  const [view, setView] = useState<View>('list');
  const [selectedTopic, setSelectedTopic] = useState<typeof sampleGrammarTopics[0] | null>(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  if (view === 'detail' && selectedTopic) {
    return (
      <div className="page grammar-page">
        <div className="module-page-header">
          <button className="btn-back" onClick={() => { setView('list'); setSelectedTopic(null); }}>
            ← 返回
          </button>
          <h1>📐 语法专项</h1>
        </div>

        <div className="grammar-detail">
          <h2 className="grammar-topic-title">{selectedTopic.title}</h2>
          <p className="grammar-topic-desc">{selectedTopic.description}</p>

          {/* Rules */}
          <div className="grammar-rules">
            <h3>核心规则</h3>
            {selectedTopic.rules.map((rule, i) => (
              <div key={i} className="grammar-rule-card">
                <h4>{rule.title}</h4>
                <p>{rule.content}</p>
                {rule.tips && (
                  <ul className="grammar-tips">
                    {rule.tips.map((tip, j) => (
                      <li key={j}>{tip}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Examples */}
          <div className="grammar-examples">
            <h3>例句</h3>
            {selectedTopic.examples.map((ex, i) => (
              <div key={i} className="grammar-example-card">
                <div className="grammar-example-en">{ex.sentence}</div>
                <div className="grammar-example-zh">{ex.translation}</div>
              </div>
            ))}
          </div>

          {/* Exercises */}
          {selectedTopic.exercises.length > 0 && (
            <div className="grammar-exercises">
              <h3>基础练习</h3>
              <div className="grammar-exercise-card">
                <p className="grammar-q-stem">{currentExercise + 1}. {selectedTopic.exercises[currentExercise].stem}</p>
                <div className="grammar-options">
                  {selectedTopic.exercises[currentExercise].options?.map((opt, i) => (
                    <button
                      key={i}
                      className={`grammar-option ${showAnswer && opt === selectedTopic.exercises[currentExercise].correctAnswer ? 'correct' : ''}`}
                      onClick={() => !showAnswer && setShowAnswer(true)}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </button>
                  ))}
                </div>
                {showAnswer && (
                  <div className="grammar-answer">
                    <p className="grammar-answer-correct">正确答案：{selectedTopic.exercises[currentExercise].correctAnswer}</p>
                    <p className="grammar-answer-explain">{selectedTopic.exercises[currentExercise].explanation}</p>
                    {currentExercise < selectedTopic.exercises.length - 1 && (
                      <button className="btn-action btn-primary" onClick={() => { setCurrentExercise((c) => c + 1); setShowAnswer(false); }}>
                        下一题 →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="grammar-sample-tag">📌 示例内容，仅供框架验证</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page grammar-page">
      <div className="module-page-header">
        <Link to="/" className="btn-back">← 返回首页</Link>
        <h1>📐 语法专项</h1>
        <p className="module-page-subtitle">系统梳理中考语法知识点</p>
      </div>

      <div className="module-intro-card">
        <p>语法专项涵盖中考常考语法点，包括名词、动词时态、形容词副词、介词连词、句型转换等。</p>
      </div>

      <div className="grammar-topic-list">
        {sampleGrammarTopics.map((topic) => (
          <button
            key={topic.id}
            className="grammar-topic-card"
            onClick={() => { setSelectedTopic(topic); setView('detail'); setCurrentExercise(0); setShowAnswer(false); }}
          >
            <div className="grammar-topic-name">{topic.title}</div>
            <div className="grammar-topic-desc">{topic.description}</div>
            <div className="grammar-topic-meta">
              <span>{topic.rules.length} 个规则</span>
              <span>{topic.exercises.length} 道练习</span>
            </div>
          </button>
        ))}
      </div>

      <ComingSoonState
        icon="📐"
        title="更多语法专题正在建设中"
        features={['动词时态专题', '形容词副词专题', '介词连词专题', '句型转换专题', '专题测试与解析']}
      />

      <div className="grammar-sample-tag">📌 以上为示例内容，更多语法专题持续添加中</div>
    </div>
  );
}
