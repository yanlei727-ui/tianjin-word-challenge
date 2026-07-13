import type { GrammarTopic } from '../types';

export const sampleGrammarTopics: GrammarTopic[] = [
  {
    id: 'grammar-noun-basic',
    title: '名词的分类与用法',
    subtitle: '掌握可数名词与不可数名词的基本用法',
    sections: [
      {
        id: 'noun-basic-rules',
        type: 'knowledge',
        title: '核心规则',
        content: '可数名词有单复数形式，不可数名词没有复数形式。',
        items: [
          { label: '可数名词', english: 'a book, two books', chinese: '' },
          { label: '不可数名词', english: 'water, bread, news', chinese: '' },
        ],
      },
    ],
    exercises: [
      {
        id: 'g1-q1',
        type: 'choice',
        difficulty: 'basic',
        stem: 'How much ___ do you want?',
        options: ['bread', 'breads', 'a bread', 'the bread'],
        correctAnswer: 'bread',
        explanation: 'bread 是不可数名词，不能加 -s。',
        knowledgePoint: '不可数名词',
      },
      {
        id: 'g1-q2',
        type: 'choice',
        difficulty: 'basic',
        stem: 'There are three ___ on the table.',
        options: ['box', 'boxs', 'boxes', 'boxing'],
        correctAnswer: 'boxes',
        explanation: 'box 以 x 结尾，复数加 -es。',
        knowledgePoint: '名词复数规则',
      },
    ],
  },
  {
    id: 'grammar-tense-basic',
    title: '一般现在时',
    subtitle: '掌握一般现在时的构成和用法',
    sections: [
      {
        id: 'tense-basic-rules',
        type: 'knowledge',
        title: '核心规则',
        content: '主语 + 动词原形（第三人称单数加 -s/-es）',
        items: [
          { label: 'I/you/we/they + 动词原形', english: '', chinese: '' },
          { label: 'he/she/it + 动词加 -s/-es', english: '', chinese: '' },
        ],
      },
    ],
    exercises: [
      {
        id: 'g2-q1',
        type: 'choice',
        difficulty: 'basic',
        stem: 'She ___ English every morning.',
        options: ['study', 'studys', 'studies', 'studying'],
        correctAnswer: 'studies',
        explanation: '主语 she 是第三人称单数，study 变 y 为 i 加 -es。',
        knowledgePoint: '一般现在时',
      },
    ],
  },
];
