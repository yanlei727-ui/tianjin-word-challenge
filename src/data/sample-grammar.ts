import type { GrammarTopic } from '../types';

export const sampleGrammarTopics: GrammarTopic[] = [
  {
    id: 'grammar-noun-basic',
    title: '名词的分类与用法',
    description: '掌握可数名词与不可数名词的基本用法',
    isSample: true,
    rules: [
      {
        title: '可数名词',
        content: '可数名词有单复数形式，前面可以加 a/an 或数词。',
        tips: ['单数名词前加 a/an', '复数名词加 -s 或 -es', '不规则变化需要特殊记忆'],
      },
      {
        title: '不可数名词',
        content: '不可数名词没有复数形式，不能直接加 a/an。',
        tips: ['常见不可数名词：water, bread, news, information', '用 much/many 区分', '可以用 a cup of, a piece of 等量词'],
      },
    ],
    examples: [
      { sentence: 'I have two apples.', translation: '我有两个苹果。', highlight: 'apples' },
      { sentence: 'She drinks some water every day.', translation: '她每天喝一些水。', highlight: 'water' },
      { sentence: 'There is a piece of news.', translation: '有一条新闻。', highlight: 'a piece of news' },
    ],
    exercises: [
      {
        id: 'g1-q1',
        type: 'choice',
        stem: 'How much ___ do you want?',
        options: ['bread', 'breads', 'a bread', 'the bread'],
        correctAnswer: 'bread',
        explanation: 'bread 是不可数名词，不能加 -s，前面不能直接加 a。',
      },
      {
        id: 'g1-q2',
        type: 'choice',
        stem: 'There are three ___ on the table.',
        options: ['box', 'boxs', 'boxes', 'boxing'],
        correctAnswer: 'boxes',
        explanation: 'box 以 x 结尾，复数加 -es。',
      },
    ],
  },
  {
    id: 'grammar-tense-basic',
    title: '一般现在时',
    description: '掌握一般现在时的构成和用法',
    isSample: true,
    rules: [
      {
        title: '构成',
        content: '主语 + 动词原形（第三人称单数加 -s/-es）',
        tips: ['I/you/we/they + 动词原形', 'he/she/it + 动词加 -s/-es'],
      },
      {
        title: '用法',
        content: '表示经常发生的动作、习惯、客观事实等。',
        tips: ['每天做的事', '客观真理', '时刻表/计划'],
      },
    ],
    examples: [
      { sentence: 'He goes to school every day.', translation: '他每天去上学。', highlight: 'goes' },
      { sentence: 'The sun rises in the east.', translation: '太阳从东方升起。', highlight: 'rises' },
    ],
    exercises: [
      {
        id: 'g2-q1',
        type: 'choice',
        stem: 'She ___ English every morning.',
        options: ['study', 'studys', 'studies', 'studying'],
        correctAnswer: 'studies',
        explanation: '主语 she 是第三人称单数，study 以辅音字母+y结尾，变 y 为 i 加 -es。',
      },
    ],
  },
];
