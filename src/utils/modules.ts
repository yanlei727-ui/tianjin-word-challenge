import nouns from '../data/words.json';
import adjAdv from '../data/words-adj-adv.json';
import verbs from '../data/words-verb.json';

export type ModuleKey = 'noun' | 'adj_adv' | 'verb';

export interface ModuleInfo {
  key: ModuleKey;
  label: string;
  icon: string;
  color: string;
}

export const MODULES: ModuleInfo[] = [
  { key: 'noun', label: '名词专项', icon: '📘', color: 'var(--primary)' },
  { key: 'adj_adv', label: '形容词&副词', icon: '📗', color: 'var(--green)' },
  { key: 'verb', label: '动词专项', icon: '📙', color: 'var(--orange)' },
];

export function getModuleWords(module: ModuleKey): typeof nouns {
  switch (module) {
    case 'noun':
      return nouns;
    case 'adj_adv':
      return adjAdv;
    case 'verb':
      return verbs;
    default:
      return nouns;
  }
}

export function getModuleInfo(module: ModuleKey): ModuleInfo {
  return MODULES.find((m) => m.key === module) || MODULES[0];
}

export function isValidModule(key: string): key is ModuleKey {
  return MODULES.some((m) => m.key === key);
}
