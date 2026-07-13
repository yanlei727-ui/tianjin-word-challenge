import type { GrammarTopic } from '../types';
import { grammarNoun } from './grammar-noun';
import { grammarArticle } from './grammar-article';
import { grammarPronoun } from './grammar-pronoun';
import { grammarNumeral } from './grammar-numeral';
import { grammarPreposition } from './grammar-preposition';
import { grammarConjunction } from './grammar-conjunction';
import { grammarAdjAdv } from './grammar-adj-adv';
import { grammarVerbUsage } from './grammar-verb-usage';
import { grammarModal } from './grammar-modal';
import { grammarSimpleTenses } from './grammar-simple-tenses';
import { grammarProgressiveTenses } from './grammar-progressive-tenses';
import { grammarPresentPerfect } from './grammar-present-perfect';

export const grammarTopics: GrammarTopic[] = [
  grammarNoun,
  grammarArticle,
  grammarPronoun,
  grammarNumeral,
  grammarPreposition,
  grammarConjunction,
  grammarAdjAdv,
  grammarVerbUsage,
  grammarModal,
  grammarSimpleTenses,
  grammarProgressiveTenses,
  grammarPresentPerfect,
];

export function getGrammarTopic(id: string): GrammarTopic | undefined {
  return grammarTopics.find((t) => t.id === id);
}
