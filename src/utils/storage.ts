export interface WordProgress {
  learned: number[];
  mastered: number[];
  unfamiliar: number[];
  wrongBook: WrongRecord[];
  levelScores: Record<number, { score: number; stars: number; completed: boolean }>;
  lastPosition: number;
  dayProgress: { day1: boolean; day2: boolean };
}

export interface WrongRecord {
  wordId: number;
  count: number;
  lastWrongTime: string;
  correctCount: number;
}

const STORAGE_KEY = 'tianjin-word-challenge';

function getDefaultProgress(): WordProgress {
  return {
    learned: [],
    mastered: [],
    unfamiliar: [],
    wrongBook: [],
    levelScores: {},
    lastPosition: 0,
    dayProgress: { day1: false, day2: false },
  };
}

export function loadProgress(): WordProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultProgress();
    const data = JSON.parse(raw);
    return { ...getDefaultProgress(), ...data };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: WordProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // storage full or unavailable
  }
}

export function markLearned(wordId: number): WordProgress {
  const p = loadProgress();
  if (!p.learned.includes(wordId)) {
    p.learned.push(wordId);
  }
  saveProgress(p);
  return p;
}

export function markMastered(wordId: number): WordProgress {
  const p = loadProgress();
  if (!p.mastered.includes(wordId)) {
    p.mastered.push(wordId);
  }
  if (!p.learned.includes(wordId)) {
    p.learned.push(wordId);
  }
  saveProgress(p);
  return p;
}

export function markUnfamiliar(wordId: number): WordProgress {
  const p = loadProgress();
  if (!p.unfamiliar.includes(wordId)) {
    p.unfamiliar.push(wordId);
  }
  saveProgress(p);
  return p;
}

export function removeUnfamiliar(wordId: number): WordProgress {
  const p = loadProgress();
  p.unfamiliar = p.unfamiliar.filter((id) => id !== wordId);
  saveProgress(p);
  return p;
}

export function addWrongRecord(wordId: number): WordProgress {
  const p = loadProgress();
  const existing = p.wrongBook.find((r) => r.wordId === wordId);
  if (existing) {
    existing.count += 1;
    existing.lastWrongTime = new Date().toISOString();
    existing.correctCount = 0;
  } else {
    p.wrongBook.push({
      wordId,
      count: 1,
      lastWrongTime: new Date().toISOString(),
      correctCount: 0,
    });
  }
  saveProgress(p);
  return p;
}

export function markWrongCorrect(wordId: number): WordProgress {
  const p = loadProgress();
  const existing = p.wrongBook.find((r) => r.wordId === wordId);
  if (existing) {
    existing.correctCount += 1;
  }
  saveProgress(p);
  return p;
}

export function removeFromWrongBook(wordId: number): WordProgress {
  const p = loadProgress();
  p.wrongBook = p.wrongBook.filter((r) => r.wordId !== wordId);
  saveProgress(p);
  return p;
}

export function saveLevelScore(level: number, score: number, stars: number): WordProgress {
  const p = loadProgress();
  const prev = p.levelScores[level];
  if (!prev || score > prev.score) {
    p.levelScores[level] = { score, stars, completed: score >= 80 };
  } else if (score >= 80) {
    p.levelScores[level].completed = true;
  }
  saveProgress(p);
  return p;
}

export function exportProgress(): string {
  const p = loadProgress();
  return JSON.stringify(p, null, 2);
}

export function importProgress(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr) as WordProgress;
    if (data.learned && data.wrongBook) {
      saveProgress(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function resetProgress(): void {
  localStorage.removeItem(STORAGE_KEY);
}
