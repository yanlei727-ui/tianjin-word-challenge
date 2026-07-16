import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { PenLine, Volume2 } from 'lucide-react';
import { speakWord } from '../utils/speech';
import { getModuleInfo, getModuleWords, MODULES, type ModuleKey } from '../utils/modules';

const ROUND_SIZE = 10;

function shuffle<T>(items: T[], seed: string | null): T[] {
  let value = Number(seed) || Date.now();
  return [...items].sort(() => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280 - 0.5;
  });
}

export default function SpellingPracticePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedModule = searchParams.get('module') as ModuleKey | null;
  const round = searchParams.get('round');
  const words = useMemo(() => selectedModule ? shuffle(getModuleWords(selectedModule), round).slice(0, ROUND_SIZE) : [], [selectedModule, round]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (!selectedModule) {
    return <div className="page practice-page"><div className="module-select-header"><h2>✍️ 拼写训练</h2><p>看中文释义与词性，写出正确的英文单词</p></div><div className="module-select-list">{MODULES.map((module) => <button key={module.key} className="module-select-card" onClick={() => setSearchParams({ module: module.key })}><div className="module-select-icon">{module.icon}</div><div className="module-select-info"><div className="module-select-title">{module.label}</div><div className="module-select-stats">随机抽取 {Math.min(ROUND_SIZE, getModuleWords(module.key).length)} 个单词</div></div><div className="module-select-arrow">→</div></button>)}</div></div>;
  }

  const info = getModuleInfo(selectedModule);
  const correct = words.filter((word) => answers[word.id]?.trim().toLowerCase() === word.word.toLowerCase()).length;
  const reset = () => { setAnswers({}); setSubmitted(false); setSearchParams({ module: selectedModule, round: String(Date.now()) }); };

  return <div className="page practice-page">
    <div className="module-page-header"><Link className="btn-back" to="/vocabulary">← 返回词汇中心</Link><h1><PenLine size={20} /> 拼写训练</h1><p className="module-page-subtitle">{info.label} · {words.length} 题</p></div>
    <div className="practice-intro">先根据中文释义拼写，再点击提交核对答案。每次开始都会随机抽题。</div>
    {words.map((word, index) => { const isCorrect = answers[word.id]?.trim().toLowerCase() === word.word.toLowerCase(); return <section className="practice-question" key={word.id}>
      <div className="practice-question-top"><span>第 {index + 1} 题</span><button className="practice-speak" onClick={() => speakWord(word.word)} aria-label={`朗读 ${word.word}`}><Volume2 size={16} /></button></div>
      <div className="practice-meaning">{word.meaning} <span>{word.partOfSpeech}</span></div>
      <p className="practice-hint">词首字母：<strong>{word.word[0].toUpperCase()}</strong>　音标：{word.phonetic}</p>
      <input className={`practice-input ${submitted ? (isCorrect ? 'correct' : 'wrong') : ''}`} value={answers[word.id] || ''} onChange={(event) => setAnswers({ ...answers, [word.id]: event.target.value })} disabled={submitted} placeholder="输入英文单词" autoCapitalize="none" />
      {submitted && <div className={`practice-feedback ${isCorrect ? 'correct' : 'wrong'}`}>{isCorrect ? '回答正确' : <>正确答案：<strong>{word.word}</strong> · {word.example}</>}</div>}
    </section>; })}
    {!submitted ? <button className="btn-action btn-primary btn-large" disabled={Object.keys(answers).length !== words.length} onClick={() => setSubmitted(true)}>提交并查看结果</button> : <div className="practice-result"><strong>本轮正确 {correct} / {words.length}</strong><button className="btn-action btn-primary" onClick={reset}>换一组练习</button></div>}
  </div>;
}
