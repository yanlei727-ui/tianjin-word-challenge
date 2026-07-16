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
  {
    id: 'reading-volunteer-day', title: 'A Day as a Volunteer', category: '社会实践', difficulty: 'medium', wordCount: 154,
    content: `Last Saturday, our school held a volunteer activity at a community center. Twenty students, including me, joined it. We arrived at nine o'clock and first cleaned the reading room. Then some students taught children how to make paper flowers, while others talked with older people.

I was asked to help an old man use his phone. At first, he was worried about touching the wrong button. I showed him slowly how to make a video call to his daughter. When he saw her smiling face on the screen, he smiled too.

The activity ended at noon. Although I was tired, I felt proud. I learned that a small act of kindness can make a real difference to someone else's day.`,
    questions: [
      { id: 'rv-q1', type: 'choice', stem: 'Where did the students do volunteer work?', options: ['At a hospital', 'At a community center', 'At a museum', 'At a station'], correctAnswer: 'At a community center', explanation: '第一段明确说明活动在 community center 开展。' },
      { id: 'rv-q2', type: 'choice', stem: 'What did the writer help the old man do?', options: ['Read a book', 'Make paper flowers', 'Make a video call', 'Clean a room'], correctAnswer: 'Make a video call', explanation: '作者教老人使用手机与女儿进行视频通话。' },
      { id: 'rv-q3', type: 'choice', stem: 'What did the writer learn from the activity?', options: ['Phones are difficult to use', 'Kindness can help others', 'Cleaning is tiring', 'Children like flowers'], correctAnswer: 'Kindness can help others', explanation: '最后一段点明：小小的善意也能带来真正的改变。' },
    ], keyVocabulary: [{ word: 'volunteer', meaning: '志愿者' }, { word: 'community', meaning: '社区' }, { word: 'worried', meaning: '担心的' }, { word: 'difference', meaning: '影响；不同' }],
  },
  {
    id: 'reading-green-travel', title: 'Choose a Greener Way to Travel', category: '环保生活', difficulty: 'medium', wordCount: 148,
    content: `Many students travel to school by car because it is comfortable. However, too many cars can cause traffic jams and air pollution. To make our city cleaner, Tianjin is encouraging people to choose greener ways to travel.

Walking or riding a bike is a good choice when the distance is short. It not only reduces pollution but also helps us stay healthy. For a longer trip, we can take the bus or the subway. Public transport carries many people at one time, so it uses less energy for each passenger.

Of course, we do not have to change everything in one day. We can begin with one or two car-free days every week. If each of us takes a small step, our city will become a more pleasant place to live.`,
    questions: [
      { id: 'rg-q1', type: 'choice', stem: 'What problem can too many cars cause?', options: ['More libraries', 'Traffic jams and pollution', 'Longer holidays', 'Better health'], correctAnswer: 'Traffic jams and pollution', explanation: '首段指出车辆过多会造成交通拥堵和空气污染。' },
      { id: 'rg-q2', type: 'choice', stem: 'Why is public transport greener?', options: ['It is always faster', 'It is free for students', 'It carries many people at once', 'It has more seats'], correctAnswer: 'It carries many people at once', explanation: '公共交通一次可承载多人，平均每位乘客消耗的能源更少。' },
      { id: 'rg-q3', type: 'choice', stem: 'What does the writer suggest at the end?', options: ['Never travel by car', 'Start with small changes', 'Buy a new bike', 'Move to another city'], correctAnswer: 'Start with small changes', explanation: '作者建议每周先安排一两天不开车，从小改变开始。' },
    ], keyVocabulary: [{ word: 'pollution', meaning: '污染' }, { word: 'distance', meaning: '距离' }, { word: 'passenger', meaning: '乘客' }, { word: 'pleasant', meaning: '令人愉快的' }],
  },
];
