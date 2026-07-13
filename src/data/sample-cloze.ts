import type { ClozePassage } from '../types';

export const sampleClozePassages: ClozePassage[] = [
  {
    id: 'cloze-sample-1',
    title: 'A Happy Day（示例文章）',
    category: '日常生活',
    content: `Last Sunday was a beautiful day. I (1)___ to the park with my friends. The weather was sunny and warm. We (2)___ a lot of games in the park. We played football and (3)___ some photos. After that, we (4)___ ice cream near the lake. We talked and laughed. It was really a (5)___ day.`,
    difficulty: 'easy',
    isSample: true,
    blanks: [
      {
        index: 0,
        correctAnswer: 'went',
        options: ['went', 'go', 'going', 'goes'],
        explanation: '根据 Last Sunday 可知用一般过去时，go 的过去式是 went。',
        contextHint: '句首有 Last Sunday，表示过去时间',
      },
      {
        index: 1,
        correctAnswer: 'played',
        options: ['played', 'play', 'plays', 'playing'],
        explanation: '文章用过去时叙述，play 的过去式是 played。',
        contextHint: '整篇文章是过去时态',
      },
      {
        index: 2,
        correctAnswer: 'took',
        options: ['took', 'take', 'taked', 'taking'],
        explanation: 'take photos 的过去式是 took photos，不规则动词。',
        contextHint: 'take 的过去式是 took',
      },
      {
        index: 3,
        correctAnswer: 'ate',
        options: ['ate', 'eat', 'eated', 'eating'],
        explanation: 'eat 的过去式是 ate，不规则动词。',
        contextHint: 'eat 的过去式是 ate',
      },
      {
        index: 4,
        correctAnswer: 'happy',
        options: ['happy', 'happily', 'happiness', 'happen'],
        explanation: '此处需要形容词修饰 day。',
        contextHint: 'a ___ day 需要形容词',
      },
    ],
  },
];
