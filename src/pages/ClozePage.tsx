import { useState } from 'react';
import { ListChecks, ArrowLeft, ArrowRight } from 'lucide-react';
import { sampleClozePassages } from '../data/sample-cloze';

type View = 'list' | 'exercise';

export default function ClozePage() {
  const [view, setView] = useState<View>('list');
  const [selectedPassage, setSelectedPassage] = useState<typeof sampleClozePassages[0] | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  if (view === 'exercise' && selectedPassage) {
    const correctCount = selectedPassage.blanks.filter(
      (b) => answers[b.index] === b.correctAnswer
    ).length;

    return (
      <div className="page cloze-page">
        <div className="module-page-header">
          <button className="btn-back" onClick={() => { setView('list'); setSelectedPassage(null); setAnswers({}); setShowResults(false); }}>
            <ArrowLeft size={16} style={{ marginRight: 4, verticalAlign: -2 }} /> 返回
          </button>
          <h1><ListChecks size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 完形填空</h1>
        </div>

        <div className="cloze-exercise">
          <h2 className="cloze-title">{selectedPassage.title}</h2>

          <div className="cloze-article">
            {selectedPassage.content.split(/(\(\d+\)___)/g).map((part, i) => {
              const match = part.match(/^\((\d+)\)___$/);
              if (!match) return part;
              const blank = selectedPassage.blanks.find((item) => item.index === Number(match[1]) - 1);
              if (!blank) return part;
              return <span key={i} className={`cloze-blank ${showResults ? (answers[blank.index] === blank.correctAnswer ? 'correct' : 'wrong') : ''}`}>{showResults ? blank.correctAnswer : (answers[blank.index] || part)}</span>;
            })}
          </div>

          <div className="cloze-questions">
            {selectedPassage.blanks.map((blank) => (
              <div key={blank.index} className="cloze-question-card">
                <p className="cloze-q-num">第 {blank.index + 1} 空</p>
                <p className="cloze-q-hint">💡 {blank.contextHint}</p>
                <div className="cloze-q-options">
                  {blank.options.map((opt, oi) => (
                    <button
                      key={oi}
                      className={`cloze-q-option ${
                        showResults
                          ? opt === blank.correctAnswer
                            ? 'correct'
                            : answers[blank.index] === opt
                            ? 'wrong'
                            : ''
                          : answers[blank.index] === opt
                          ? 'selected'
                          : ''
                      }`}
                      onClick={() => !showResults && setAnswers((a) => ({ ...a, [blank.index]: opt }))}
                    >
                      {String.fromCharCode(65 + oi)}. {opt}
                    </button>
                  ))}
                </div>
                {showResults && (
                  <div className="cloze-q-explanation">
                    <p>正确答案：{blank.correctAnswer}</p>
                    <p>{blank.explanation}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {!showResults ? (
            <button
              className="btn-action btn-primary btn-large"
              onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < selectedPassage.blanks.length}
            >
              提交答案
            </button>
          ) : (
            <div className="cloze-result">
              <p>答对 {correctCount} / {selectedPassage.blanks.length} 空</p>
              <button className="btn-action btn-primary" onClick={() => { setAnswers({}); setShowResults(false); }}>
                重新作答
              </button>
            </div>
          )}
        </div>

      </div>
    );
  }

  return (
    <div className="page cloze-page">
      <div className="module-page-header">
        <h1><ListChecks size={20} style={{ marginRight: 6, verticalAlign: -3 }} /> 完形填空</h1>
        <p className="module-page-subtitle">中考英语完形填空训练</p>
      </div>

      <div className="module-intro-card">
        <p>完形填空训练语境理解能力和词汇运用能力，涵盖记叙文、说明文等文体。</p>
      </div>

      <div className="cloze-list">
        {sampleClozePassages.map((passage) => (
          <button
            key={passage.id}
            className="cloze-list-card"
            onClick={() => { setSelectedPassage(passage); setView('exercise'); }}
          >
            <div className="cloze-list-info">
              <div className="cloze-list-title">{passage.title}</div>
              <div className="reading-list-meta">
                <span>{passage.category}</span>
                <span>{passage.blanks.length} 空</span>
              </div>
            </div>
            <div className="cloze-list-arrow">
              <ArrowRight size={16} />
            </div>
          </button>
        ))}
      </div>

    </div>
  );
}
