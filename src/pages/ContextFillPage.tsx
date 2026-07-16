import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FileInput, Volume2 } from 'lucide-react';
import { speakWord } from '../utils/speech';
import { getModuleInfo, getModuleWords, MODULES, type ModuleKey } from '../utils/modules';

const ROUND_SIZE = 8;
function shuffle<T>(items: T[], seed: string | null): T[] {
  let value = Number(seed) || Date.now();
  return [...items].sort(() => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280 - 0.5;
  });
}

export default function ContextFillPage() {
  const [params, setParams] = useSearchParams();
  const module = params.get('module') as ModuleKey | null;
  const round = params.get('round');
  const words = useMemo(() => module ? shuffle(getModuleWords(module), round).filter((word) => word.example).slice(0, ROUND_SIZE) : [], [module, round]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  if (!module) return <div className="page practice-page"><div className="module-select-header"><h2>🧩 例句填空</h2><p>利用真实例句，在语境中巩固单词</p></div><div className="module-select-list">{MODULES.map((item) => <button key={item.key} className="module-select-card" onClick={() => setParams({ module: item.key })}><div className="module-select-icon">{item.icon}</div><div className="module-select-info"><div className="module-select-title">{item.label}</div><div className="module-select-stats">随机抽取 {ROUND_SIZE} 个例句</div></div><div className="module-select-arrow">→</div></button>)}</div></div>;
  const correct = words.filter((word) => answers[word.id]?.trim().toLowerCase() === word.word.toLowerCase()).length;
  return <div className="page practice-page"><div className="module-page-header"><Link className="btn-back" to="/vocabulary">← 返回词汇中心</Link><h1><FileInput size={20} /> 例句填空</h1><p className="module-page-subtitle">{getModuleInfo(module).label} · {words.length} 题</p></div><div className="practice-intro">根据中文提示，在句子中填入正确的英文单词；只需填写词形本身。</div>
    {words.map((word, index) => { const isCorrect = answers[word.id]?.trim().toLowerCase() === word.word.toLowerCase(); const sentence = word.example.replace(new RegExp(`\\b${word.word}\\b`, 'i'), '_____'); return <section className="practice-question" key={word.id}><div className="practice-question-top"><span>第 {index + 1} 题</span><button className="practice-speak" onClick={() => speakWord(word.example)} aria-label="朗读例句"><Volume2 size={16} /></button></div><div className="practice-sentence">{sentence}</div><div className="practice-translation">{word.exampleZh}</div><p className="practice-hint">提示：{word.meaning}（{word.partOfSpeech}）</p><input className={`practice-input ${submitted ? (isCorrect ? 'correct' : 'wrong') : ''}`} value={answers[word.id] || ''} onChange={(event) => setAnswers({ ...answers, [word.id]: event.target.value })} disabled={submitted} placeholder="填写单词" autoCapitalize="none" />{submitted && <div className={`practice-feedback ${isCorrect ? 'correct' : 'wrong'}`}>{isCorrect ? '回答正确' : <>正确答案：<strong>{word.word}</strong></>}</div>}</section>; })}
    {!submitted ? <button className="btn-action btn-primary btn-large" disabled={Object.keys(answers).length !== words.length} onClick={() => setSubmitted(true)}>提交并查看结果</button> : <div className="practice-result"><strong>本轮正确 {correct} / {words.length}</strong><button className="btn-action btn-primary" onClick={() => { setAnswers({}); setSubmitted(false); setParams({ module, round: String(Date.now()) }); }}>换一组练习</button></div>}
  </div>;
}
