import type { ModuleKey } from './modules';

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

const LEGACY_KEY = 'tianjin-word-challenge';
const MODULE_PREFIX = 'tianjin-word-challenge-';

function getStorageKey(module: ModuleKey): string {
  return MODULE_PREFIX + module;
}

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

// Migrate legacy data to noun module
function migrateLegacy(): void {
  try {
    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const nounKey = getStorageKey('noun');
      if (!localStorage.getItem(nounKey)) {
        localStorage.setItem(nounKey, legacy);
      }
      localStorage.removeItem(LEGACY_KEY);
    }
  } catch {
    // ignore
  }
}

export function loadProgress(module: ModuleKey = 'noun'): WordProgress {
  migrateLegacy();
  try {
    const raw = localStorage.getItem(getStorageKey(module));
    if (!raw) return getDefaultProgress();
    const data = JSON.parse(raw);
    return { ...getDefaultProgress(), ...data };
  } catch {
    return getDefaultProgress();
  }
}

export function saveProgress(progress: WordProgress, module: ModuleKey = 'noun'): void {
  try {
    localStorage.setItem(getStorageKey(module), JSON.stringify(progress));
  } catch {
    // storage full or unavailable
  }
}

export function saveLastPosition(position: number, module: ModuleKey = 'noun'): void {
  const p = loadProgress(module);
  p.lastPosition = position;
  saveProgress(p, module);
}

export function markLearned(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  if (!p.learned.includes(wordId)) {
    p.learned.push(wordId);
  }
  saveProgress(p, module);
  return p;
}

export function markMastered(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  if (!p.mastered.includes(wordId)) {
    p.mastered.push(wordId);
  }
  if (!p.learned.includes(wordId)) {
    p.learned.push(wordId);
  }
  saveProgress(p, module);
  return p;
}

export function markUnfamiliar(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  if (!p.unfamiliar.includes(wordId)) {
    p.unfamiliar.push(wordId);
  }
  saveProgress(p, module);
  return p;
}

export function removeUnfamiliar(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  p.unfamiliar = p.unfamiliar.filter((id) => id !== wordId);
  saveProgress(p, module);
  return p;
}

export function addWrongRecord(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
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
  saveProgress(p, module);
  return p;
}

export function markWrongCorrect(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  const existing = p.wrongBook.find((r) => r.wordId === wordId);
  if (existing) {
    existing.correctCount += 1;
  }
  saveProgress(p, module);
  return p;
}

export function removeFromWrongBook(wordId: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  p.wrongBook = p.wrongBook.filter((r) => r.wordId !== wordId);
  saveProgress(p, module);
  return p;
}

export function saveLevelScore(level: number, score: number, stars: number, module: ModuleKey = 'noun'): WordProgress {
  const p = loadProgress(module);
  const prev = p.levelScores[level];
  if (!prev || score > prev.score) {
    p.levelScores[level] = { score, stars, completed: score >= 80 };
  } else if (score >= 80) {
    p.levelScores[level].completed = true;
  }
  saveProgress(p, module);
  return p;
}

export function exportProgress(module?: ModuleKey): string {
  if (module) {
    return JSON.stringify(loadProgress(module), null, 2);
  }
  const all: Record<string, WordProgress> = {};
  for (const m of ['noun', 'adj_adv', 'verb'] as ModuleKey[]) {
    all[m] = loadProgress(m);
  }
  return JSON.stringify(all, null, 2);
}

export function importProgress(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    // New format: multi-module object
    if (data.noun || data.adj_adv || data.verb) {
      for (const [key, val] of Object.entries(data)) {
        if (val && typeof val === 'object' && 'learned' in (val as WordProgress)) {
          saveProgress(val as WordProgress, key as ModuleKey);
        }
      }
      return true;
    }
    // Legacy format: single module
    if (data.learned && data.wrongBook) {
      saveProgress(data, 'noun');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function resetProgress(module?: ModuleKey): void {
  if (module) {
    localStorage.removeItem(getStorageKey(module));
  } else {
    for (const m of ['noun', 'adj_adv', 'verb'] as ModuleKey[]) {
      localStorage.removeItem(getStorageKey(m));
    }
  }
}

// Chinese Challenge training records
export interface ChallengeRecord {
  date: string;
  total: number;
  correct: number;
  accuracy: number;
  words: { wordId: number; correct: boolean }[];
}

const CHALLENGE_KEY = 'tianjin-word-challenge-records';

export function loadChallengeRecords(): ChallengeRecord[] {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveChallengeRecord(record: ChallengeRecord): void {
  try {
    const records = loadChallengeRecords();
    records.unshift(record);
    if (records.length > 50) records.length = 50;
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(records));
  } catch {
    // storage full or unavailable
  }
}

// Favorites (重点词)
export interface FavoriteRecord {
  wordId: number;
  module: ModuleKey;
  addedAt: string;
}

const FAVORITES_KEY = 'tianjin-word-challenge-favorites';

export function loadFavorites(): FavoriteRecord[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveFavorites(favorites: FavoriteRecord[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  } catch {
    // storage full or unavailable
  }
}

export function addFavorite(wordId: number, module: ModuleKey): FavoriteRecord[] {
  const favorites = loadFavorites();
  const exists = favorites.some((f) => f.wordId === wordId && f.module === module);
  if (!exists) {
    favorites.push({
      wordId,
      module,
      addedAt: new Date().toISOString(),
    });
    saveFavorites(favorites);
  }
  return favorites;
}

export function removeFavorite(wordId: number, module: ModuleKey): FavoriteRecord[] {
  const favorites = loadFavorites();
  const filtered = favorites.filter(
    (f) => !(f.wordId === wordId && f.module === module)
  );
  saveFavorites(filtered);
  return filtered;
}

export function isFavorited(wordId: number, module: ModuleKey): boolean {
  const favorites = loadFavorites();
  return favorites.some((f) => f.wordId === wordId && f.module === module);
}

export function getFavoritesByModule(module?: ModuleKey): FavoriteRecord[] {
  const favorites = loadFavorites();
  if (module) {
    return favorites.filter((f) => f.module === module);
  }
  return favorites;
}
