import { useState } from 'react';
import { Link } from 'react-router-dom';
import { sampleReadingPassages } from '../data/sample-reading';
import { ComingSoonState } from '../components/shared';

type View = 'list' | 'reading';

export default function ReadingPage() {
  const [view, setView] = useState<View>('list');
  const [selectedPassage, setSelectedPassage] = useState<typeof sampleReadingPassages[0] | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);

  if (view === 'reading' && selectedPassage) {
    return (
      <div className="page reading-page">
        <div className="module-page-header">
          <button className="btn-back" onClick={() => { setView('list'); setSelectedPassage(null); setAnswers({}); setShowResults(false); }}>
            ← 返回
          </button>
          <h1>📰 阅读理解</h1>
        </div>

        <div className="reading-article">
          <h2 className="reading-title">{selectedPassage.title}</h2>
          <div className="reading-meta">
            <span className="reading-category">{selectedPassage.category}</span>
            <span className="reading-difficulty">{selectedPassage.difficulty === 'easy' ? '简单' : selectedPassage.difficulty === 'medium' ? '中等' : '较难'}</span>
            <span className="reading-words">{selectedPassage.wordCount} 词</span>
          </div>

          <div className="reading-content">
            {selectedPassage.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>

          {selectedPassage.keyVocabulary && selectedPassage.keyVocabulary.length > 0 && (
            <div className="reading-vocab">
              <h3>重点词汇</h3>
              <div className="reading-vocab-list">
                {selectedPassage.keyVocabulary.map((v, i) => (
                  <span key={i} className="reading-vocab-item">
                    <strong>{v.word}</strong> {v.meaning}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="reading-questions">
          <h3>题目</h3>
          {selectedPassage.questions.map((q, qi) => (
            <div key={q.id} className="reading-question-card">
              <p className="reading-q-stem">{qi + 1}. {q.stem}</p>
              <div className="reading-q-options">
                {q.options?.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`reading-q-option ${
                      showResults
                        ? opt === q.correctAnswer
                          ? 'correct'
                          : answers[q.id] === opt
                          ? 'wrong'
                          : ''
                        : answers[q.id] === opt
                        ? 'selected'
                        : ''
                    }`}
                    onClick={() => !showResults && setAnswers((a) => ({ ...a, [q.id]: opt }))}
                  >
                    {String.fromCharCode(65 + oi)}. {opt}
                  </button>
                ))}
              </div>
              {showResults && (
                <div className="reading-q-explanation">
                  <p className="reading-q-correct">正确答案：{q.correctAnswer}</p>
                  <p>{q.explanation}</p>
                </div>
              )}
            </div>
          ))}

          {!showResults ? (
            <button
              className="btn-action btn-primary btn-large"
              onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < selectedPassage.questions.length}
            >
              提交答案
            </button>
          ) : (
            <div className="reading-result-summary">
              <p>答对 {selectedPassage.questions.filter((q) => answers[q.id] === q.correctAnswer).length} / {selectedPassage.questions.length} 题</p>
              <button className="btn-action btn-primary" onClick={() => { setAnswers({}); setShowResults(false); }}>
                重新作答
              </button>
            </div>
          )}
        </div>

        <div className="grammar-sample-tag">📌 示例内容，仅供框架验证</div>
      </div>
    );
  }

  return (
    <div className="page reading-page">
      <div className="module-page-header">
        <Link to="/" className="btn-back">← 返回首页</Link>
        <h1>📰 阅读理解</h1>
        <p className="module-page-subtitle">中考英语阅读理解训练</p>
      </div>

      <div className="module-intro-card">
        <p>阅读理解涵盖日常生活、社会文化、科普知识等话题，训练阅读速度和理解能力。</p>
      </div>

      <div className="reading-list">
        {sampleReadingPassages.map((passage) => (
          <button
            key={passage.id}
            className="reading-list-card"
            onClick={() => { setSelectedPassage(passage); setView('reading'); }}
          >
            <div className="reading-list-title">{passage.title}</div>
            <div className="reading-list-meta">
              <span>{passage.category}</span>
              <span>{passage.difficulty === 'easy' ? '简单' : passage.difficulty === 'medium' ? '中等' : '较难'}</span>
              <span>{passage.wordCount} 词</span>
            </div>
          </button>
        ))}
      </div>

      <ComingSoonState
        icon="📰"
        title="更多阅读文章正在建设中"
        features={['日常生活类', '社会文化类', '科普知识类', '人物故事类', '图表信息类']}
      />

      <div className="grammar-sample-tag">📌 以上为示例内容，更多阅读文章持续添加中</div>
    </div>
  );
}
