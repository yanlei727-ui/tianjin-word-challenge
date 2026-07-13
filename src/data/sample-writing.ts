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
];
