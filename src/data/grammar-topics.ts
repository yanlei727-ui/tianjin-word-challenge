import type { GrammarTopic } from '../types';
import { grammarNoun } from './grammar-noun';
import { grammarArticle } from './grammar-article';
import { grammarPronoun } from './grammar-pronoun';

export const grammarTopics: GrammarTopic[] = [
  grammarNoun,
  grammarArticle,
  grammarPronoun,
];

export function getGrammarTopic(id: string): GrammarTopic | undefined {
  return grammarTopics.find((t) => t.id === id);
}
