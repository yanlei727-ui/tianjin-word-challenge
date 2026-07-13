import type { ReadingPassage } from '../types';

export const sampleReadingPassages: ReadingPassage[] = [
  {
    id: 'reading-sample-1',
    title: 'My School Life（示例文章）',
    category: '日常生活',
    content: `I am a student in Tianjin No. 1 Middle School. I usually get up at 6:30 in the morning. After breakfast, I ride my bike to school. It takes about 15 minutes.

I have four classes in the morning and three classes in the afternoon. My favorite subject is English because it is very interesting. I also like math, but it is sometimes difficult for me.

After school, I often play basketball with my friends. Sometimes I go to the library to read books. I usually do my homework at home after dinner.

On weekends, I like to watch movies and listen to music. I also help my mother cook dinner. I think my school life is busy but happy.`,
    wordCount: 136,
    difficulty: 'easy',
    isSample: true,
    questions: [
      {
        id: 'r1-q1',
        type: 'choice',
        stem: 'How does the writer go to school?',
        options: ['By bus', 'By bike', 'On foot', 'By car'],
        correctAnswer: 'By bike',
        explanation: '文中说 "I ride my bike to school"，所以是骑自行车去学校。',
      },
      {
        id: 'r1-q2',
        type: 'choice',
        stem: 'What is the writer\'s favorite subject?',
        options: ['Math', 'Chinese', 'English', 'Science'],
        correctAnswer: 'English',
        explanation: '文中说 "My favorite subject is English"。',
      },
      {
        id: 'r1-q3',
        type: 'choice',
        stem: 'What does the writer do after school?',
        options: ['Go home directly', 'Play basketball', 'Go to the movies', 'Do homework'],
        correctAnswer: 'Play basketball',
        explanation: '文中说 "After school, I often play basketball with my friends"。',
      },
    ],
    keyVocabulary: [
      { word: 'breakfast', meaning: '早餐' },
      { word: 'favorite', meaning: '最喜欢的' },
      { word: 'interesting', meaning: '有趣的' },
      { word: 'difficulty', meaning: '困难' },
    ],
  },
];
