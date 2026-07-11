import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import words from '../data/words.json';
import {
  loadProgress,
  removeFromWrongBook,
} from '../utils/storage';
import { speakWord } from '../utils/speech';

export default function WrongBookPage() {
  const [progress, setProgress] = useState(loadProgress());
  const navigate = useNavigate();

  const wrongRecords = progress.wrongBook;

  const handleRemove = (wordId: number) => {
    const p = removeFromWrongBook(wordId);
    setProgress(p);
  };

  return (
    <div className="page wrongbook-page">
      <div className="wrongbook-header">
        <h2>📝 错题本</h2>
        <p>记录了 {wrongRecords.length} 个需要复习的单词</p>
      </div>

      {wrongRecords.length > 0 && (
        <div className="wrongbook-actions">
          <button className="btn-action btn-primary btn-large" onClick={() => navigate('/challenge')}>
            🎯 错词专项练习
          </button>
        </div>
      )}

      {wrongRecords.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <p>错题本为空</p>
          <p className="empty-hint">继续加油，做错了会自动添加到这里</p>
        </div>
      ) : (
        <div className="wrongbook-list">
          {wrongRecords.map((record) => {
            const word = words.find((w) => w.id === record.wordId);
            if (!word) return null;
            return (
              <div key={record.wordId} className="wrongbook-card">
                <div className="wb-card-top">
                  <div>
                    <span className="wb-word">{word.word}</span>
                    <button
                      className="btn-speak-sm"
                      onClick={() => speakWord(word.word)}
                    >
                      🔊
                    </button>
                  </div>
                  <span className="wb-count">错误 {record.count} 次</span>
                </div>
                <div className="wb-phonetic">{word.phonetic}</div>
                <div className="wb-meaning">{word.meaning}</div>
                {word.example && (
                  <div className="wb-example">
                    <span className="wb-example-en">{word.example}</span>
                    <span className="wb-example-zh">{word.exampleZh}</span>
                  </div>
                )}
                <div className="wb-card-bottom">
                  <span className="wb-time">
                    最近错误：{new Date(record.lastWrongTime).toLocaleDateString('zh-CN')}
                  </span>
                  <div className="wb-card-actions">
                    {record.correctCount >= 2 && (
                      <span className="wb-hint">连续答对 {record.correctCount} 次，可以移出</span>
                    )}
                    <button
                      className="btn-action btn-small btn-green"
                      onClick={() => handleRemove(record.wordId)}
                    >
                      移出错题本
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
