import { speakWord, speakSentence } from '../utils/speech';

interface WordData {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleZh: string;
  level: number;
  group: number;
  isUncountable: boolean;
  note: string;
}

interface WordCardProps {
  word: WordData;
  showMeaning?: boolean;
  showExample?: boolean;
  isFavorited?: boolean;
  onKnow?: () => void;
  onUnfamiliar?: () => void;
  onAddWrong?: () => void;
  onNext?: () => void;
  onToggleFavorite?: () => void;
}

export default function WordCard({
  word,
  showMeaning = true,
  showExample = true,
  isFavorited = false,
  onKnow,
  onUnfamiliar,
  onAddWrong,
  onNext,
  onToggleFavorite,
}: WordCardProps) {
  return (
    <div className="word-card">
      <div className="word-card-header">
        <h2 className="word-english">{word.word}</h2>
        <div className="word-card-actions-right">
          {onToggleFavorite && (
            <button
              className={`btn-favorite ${isFavorited ? 'active' : ''}`}
              onClick={onToggleFavorite}
              title={isFavorited ? '取消收藏' : '收藏重点词'}
            >
              {isFavorited ? '⭐' : '☆'}
            </button>
          )}
          <button
            className="btn-speak"
            onClick={() => speakWord(word.word)}
            title="朗读单词"
          >
            🔊
          </button>
        </div>
      </div>
      <div className="word-phonetic">{word.phonetic}</div>
      <div className="word-pos">{word.partOfSpeech}</div>

      {showMeaning && (
        <div className="word-meaning">{word.meaning}</div>
      )}

      {word.isUncountable && word.note && (
        <div className="word-note">⚠️ {word.note}</div>
      )}

      {showExample && word.example && (
        <div className="word-example">
          <div className="example-en">
            <span>{word.example}</span>
            <button
              className="btn-speak-sm"
              onClick={() => speakSentence(word.example)}
              title="朗读例句"
            >
              🔊
            </button>
          </div>
          <div className="example-zh">{word.exampleZh}</div>
        </div>
      )}

      {(onKnow || onUnfamiliar || onAddWrong || onNext) && (
        <div className="word-actions">
          {onKnow && (
            <button className="btn-action btn-know" onClick={onKnow}>
              ✅ 认识
            </button>
          )}
          {onUnfamiliar && (
            <button className="btn-action btn-unfamiliar" onClick={onUnfamiliar}>
              🔄 不熟
            </button>
          )}
          {onAddWrong && (
            <button className="btn-action btn-wrong" onClick={onAddWrong}>
              📝 加入错词本
            </button>
          )}
          {onNext && (
            <button className="btn-action btn-next" onClick={onNext}>
              ➡️ 下一个
            </button>
          )}
        </div>
      )}
    </div>
  );
}
