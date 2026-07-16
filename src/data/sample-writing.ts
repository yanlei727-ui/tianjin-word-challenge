import type { WritingTopic } from '../types';

export const sampleWritingTopics: WritingTopic[] = [
  {
    id: 'writing-sample-1',
    title: 'My Best Friend（示例题目）',
    prompt: '请以 "My Best Friend" 为题，写一篇不少于60词的英语短文。',
    requirements: [
      '介绍你最好的朋友是谁',
      '描述他的/她的外貌和性格',
      '你们经常一起做什么',
      '为什么他/她是你的最好的朋友',
    ],
    outline: [
      '开头：引出话题，介绍朋友的名字',
      '正文第一段：外貌描述（身高、发型、穿着等）',
      '正文第二段：性格特点（kind, helpful, funny 等）',
      '正文第三段：你们一起做的事',
      '结尾：总结为什么是最好的朋友',
    ],
    referenceEssay: `My Best Friend

My best friend is Li Ming. He is a tall boy with short black hair. He always wears a pair of glasses.

Li Ming is very kind and helpful. He is always ready to help others. He is also very funny. He often tells jokes to make us laugh.

We often play basketball together after school. On weekends, we sometimes go to the library to read books. We also study together and help each other with our homework.

Li Ming is my best friend because he is always there for me. I am very lucky to have such a good friend.`,
    goodSentences: [
      'He is always ready to help others.（他总是乐于助人。）',
      'He often tells jokes to make us laugh.（他经常讲笑话让我们笑。）',
      'I am very lucky to have such a good friend.（我很幸运有这样一个好朋友。）',
    ],
    isSample: true,
  },
  {
    id: 'writing-volunteer', title: 'An Unforgettable Volunteer Experience',
    prompt: '学校英文网站正在征集“志愿服务经历”主题短文。请你写一篇不少于60词的英语短文，介绍一次难忘的志愿服务活动。',
    requirements: ['说明活动的时间、地点和内容', '介绍你做了什么', '写出你的收获或感受'],
    outline: ['开头：交代志愿活动的基本信息', '主体：按顺序写服务过程和细节', '结尾：总结感受，点明收获'],
    referenceEssay: `An Unforgettable Volunteer Experience

Last Sunday, I took part in a volunteer activity at a community center with my classmates. We cleaned the reading room and helped some children choose books.

My job was to read stories to two young children. At first, they were shy and quiet. I showed them the pictures and asked them easy questions. Soon, they began to smile and tell me what they thought about the story.

Although the work was not difficult, I felt very happy. I learned that giving a little time and care can make other people feel warm. I hope to join more volunteer activities in the future.`,
    goodSentences: ['I took part in a volunteer activity at...（我参加了在……举行的志愿活动。）', 'Although the work was not difficult, I felt very happy.（虽然工作不难，但我很开心。）', 'Giving a little time and care can make other people feel warm.（付出一点时间和关心能让他人感到温暖。）'],
  },
  {
    id: 'writing-green-school', title: 'Make Our School Greener',
    prompt: '假如你是李华，请以“Make Our School Greener”为题，向学校英文公众号投稿，提出你的环保建议并说明理由。词数不少于60词。',
    requirements: ['提出至少两条可行建议', '说明这些建议的好处', '表达参与环保行动的愿望'],
    outline: ['开头：说明建设绿色校园的意义', '主体：建议一 + 理由；建议二 + 理由', '结尾：发出行动倡议'],
    referenceEssay: `Make Our School Greener

Our school is a beautiful place, and we can all do something to make it greener. First, we should turn off the lights and computers when we leave the classroom. This can save energy.

Second, we can bring our own water bottles instead of buying bottled drinks every day. We should also put waste into the right bins and use both sides of paper.

Small actions can make a big difference. Let us start from ourselves and work together to make our school cleaner and greener.`,
    goodSentences: ['We can all do something to make it greener.（我们都能做些事让它更环保。）', 'This can save energy.（这能节约能源。）', 'Small actions can make a big difference.（小行动也能带来大改变。）'],
  },
];
