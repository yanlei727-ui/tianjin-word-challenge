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
  {
    id: 'cloze-library-card', title: 'The Library Card', category: '校园生活', difficulty: 'medium',
    content: `Emma loved reading, but she had never been to the new city library. One rainy afternoon, she decided to visit it. The building was much (1)___ than she had expected. A librarian smiled and showed her how to get a library card.

Emma chose a book about space. She did not understand every word, (2)___ she kept reading. When she found a new word, she wrote it down in a small notebook. At home, she looked up the words and read the chapter again. Soon, the story became much (3)___.

The next week, Emma returned the book on time and borrowed another one. She found that reading was not only fun but also a good way to (4)___ new things. From then on, the library became her favorite (5)___.`,
    blanks: [
      { index: 0, correctAnswer: 'larger', options: ['large', 'larger', 'largest', 'largely'], explanation: 'much 后接形容词比较级，表示“比预想的大得多”。', contextHint: 'much + 形容词比较级' },
      { index: 1, correctAnswer: 'but', options: ['so', 'but', 'because', 'or'], explanation: '前后表示转折：不理解每个词，但仍继续阅读。', contextHint: '语义转折' },
      { index: 2, correctAnswer: 'clearer', options: ['clear', 'clearly', 'clearer', 'clearest'], explanation: 'much 修饰比较级，故事变得更清楚。', contextHint: 'much + 形容词比较级' },
      { index: 3, correctAnswer: 'learn', options: ['learn', 'learning', 'learned', 'to learning'], explanation: 'a way to do sth. 表示“做某事的方法”。', contextHint: 'a way to + 动词原形' },
      { index: 4, correctAnswer: 'place', options: ['time', 'place', 'reason', 'person'], explanation: '图书馆成为她最喜欢的地点。', contextHint: 'favorite 后需名词' },
    ],
  },
  {
    id: 'cloze-teamwork', title: 'Working Together', category: '成长故事', difficulty: 'medium',
    content: `Our class planned to make a poster for the school art festival. At first, everyone had a different idea, and we spent a long time (1)___. Then our monitor suggested that we divide the work. Ming drew the picture, Lucy wrote the words, and I looked for useful information.

There was one problem: the colors did not match. Instead of blaming each other, we listened carefully and tried several plans. Finally, we (2)___ a blue background because it made the other colors stand out.

On the day of the festival, many students stopped to look at our poster. We did not win first prize, (3)___ we were happy with our work. The experience taught us that a team can do better when every member is willing to (4)___ and share ideas.`,
    blanks: [
      { index: 0, correctAnswer: 'discussing', options: ['discuss', 'discussing', 'discussed', 'to discuss'], explanation: 'spend time doing sth. 表示“花时间做某事”。', contextHint: 'spend time doing sth.' },
      { index: 1, correctAnswer: 'chose', options: ['choose', 'chose', 'choosing', 'chosen'], explanation: '叙述过去发生的事，用 choose 的过去式 chose。', contextHint: '全文为过去时' },
      { index: 2, correctAnswer: 'but', options: ['because', 'so', 'but', 'if'], explanation: '没有获得一等奖，但仍为作品感到高兴，表转折。', contextHint: '前后转折' },
      { index: 3, correctAnswer: 'cooperate', options: ['cooperate', 'cooperates', 'cooperated', 'cooperation'], explanation: 'be willing to 后接动词原形。', contextHint: 'be willing to + 动词原形' },
    ],
  },
];
