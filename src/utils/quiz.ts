import words from '../data/words.json';

export interface QuizQuestion {
  wordId: number;
  word: string;
  meaning: string;
  phonetic: string;
  type: 'en2cn' | 'cn2en' | 'listen' | 'spell';
  options?: string[];
  correctIndex?: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickRandom<T>(arr: T[], count: number, exclude?: T): T[] {
  const filtered = exclude ? arr.filter((x) => x !== exclude) : arr;
  return shuffle(filtered).slice(0, count);
}

export function generateChoiceQuestion(
  targetWord: typeof words[0],
  type: 'en2cn' | 'cn2en' | 'listen'
): QuizQuestion {
  const allWords = words;

  if (type === 'en2cn') {
    const distractors = pickRandom(allWords, 3, targetWord).map((w) => w.meaning);
    const options = shuffle([targetWord.meaning, ...distractors]);
    return {
      wordId: targetWord.id,
      word: targetWord.word,
      meaning: targetWord.meaning,
      phonetic: targetWord.phonetic,
      type,
      options,
      correctIndex: options.indexOf(targetWord.meaning),
    };
  }

  if (type === 'cn2en') {
    const distractors = pickRandom(allWords, 3, targetWord).map((w) => w.word);
    const options = shuffle([targetWord.word, ...distractors]);
    return {
      wordId: targetWord.id,
      word: targetWord.word,
      meaning: targetWord.meaning,
      phonetic: targetWord.phonetic,
      type: 'cn2en',
      options,
      correctIndex: options.indexOf(targetWord.word),
    };
  }

  // listen
  const distractors = pickRandom(allWords, 3, targetWord).map((w) => w.word);
  const options = shuffle([targetWord.word, ...distractors]);
  return {
    wordId: targetWord.id,
    word: targetWord.word,
    meaning: targetWord.meaning,
    phonetic: targetWord.phonetic,
    type: 'listen',
    options,
    correctIndex: options.indexOf(targetWord.word),
  };
}

export function generateSpellQuestion(targetWord: typeof words[0]): QuizQuestion {
  return {
    wordId: targetWord.id,
    word: targetWord.word,
    meaning: targetWord.meaning,
    phonetic: targetWord.phonetic,
    type: 'spell',
  };
}

export function generateLevelQuiz(levelWordIds: number[]): QuizQuestion[] {
  const levelWords = levelWordIds.map((id) => words.find((w) => w.id === id)!).filter(Boolean);
  const questions: QuizQuestion[] = [];

  const types: ('en2cn' | 'cn2en' | 'listen')[] = ['en2cn', 'cn2en', 'listen'];

  levelWords.forEach((w, i) => {
    questions.push(generateChoiceQuestion(w, types[i % 3]));
  });

  const spellWords = shuffle(levelWords).slice(0, Math.min(5, levelWords.length));
  spellWords.forEach((w) => {
    questions.push(generateSpellQuestion(w));
  });

  return shuffle(questions);
}

export function generateWrongBookQuiz(wrongWordIds: number[]): QuizQuestion[] {
  const wrongWords = wrongWordIds
    .map((id) => words.find((w) => w.id === id)!)
    .filter(Boolean);
  const questions: QuizQuestion[] = [];
  const types: ('en2cn' | 'cn2en' | 'listen')[] = ['en2cn', 'cn2en', 'listen'];

  wrongWords.forEach((w, i) => {
    questions.push(generateChoiceQuestion(w, types[i % 3]));
  });

  const spellWords = shuffle(wrongWords).slice(0, Math.min(3, wrongWords.length));
  spellWords.forEach((w) => {
    questions.push(generateSpellQuestion(w));
  });

  return shuffle(questions);
}
