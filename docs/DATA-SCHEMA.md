# 天津中考英语学习系统 - 数据结构说明

## 词汇数据 (words.json)

```json
{
  "id": 1,                    // 唯一 ID
  "word": "activity",         // 英文单词
  "phonetic": "/ækˈtɪvəti/", // 音标
  "meaning": "活动",          // 中文释义
  "partOfSpeech": "n.",       // 词性
  "example": "...",           // 例句
  "exampleZh": "...",         // 例句中文翻译
  "level": 1,                 // 难度等级
  "group": 1,                 // 分组
  "isUncountable": false,     // 是否不可数
  "note": ""                  // 备注
}
```

## 学习进度 (localStorage: tianjin-word-challenge-{module})

```json
{
  "learned": [1, 2, 3],           // 已学习的单词 ID
  "mastered": [1, 2],             // 已掌握的单词 ID
  "unfamiliar": [3],              // 标记不熟的单词 ID
  "wrongBook": [                  // 错词记录
    {
      "wordId": 1,                // 单词 ID
      "count": 2,                 // 错误次数
      "lastWrongTime": "...",     // 最近错误时间
      "correctCount": 0           // 连续答对次数
    }
  ],
  "levelScores": {                // 关卡成绩
    "1": { "score": 90, "stars": 2, "completed": true }
  },
  "lastPosition": 10,             // 上次学习位置
  "dayProgress": {                // 学习计划进度
    "day1": false,
    "day2": false
  }
}
```

## 收藏记录 (localStorage: tianjin-word-challenge-favorites)

```json
[
  {
    "wordId": 1,                  // 单词 ID
    "module": "noun",             // 所属模块
    "addedAt": "2024-01-01..."    // 收藏时间
  }
]
```

## 语法示例数据 (sample-grammar.ts)

```typescript
interface GrammarTopic {
  id: string;                     // 唯一 ID
  title: string;                  // 专题标题
  description: string;            // 描述
  rules: GrammarRule[];           // 语法规则
  examples: GrammarExample[];     // 例句
  exercises: Question[];          // 练习题
  isSample?: boolean;             // 是否示例数据
}

interface Question {
  id: string;
  type: 'choice' | 'fill' | 'match' | 'judge' | 'essay';
  stem: string;                   // 题干
  options?: string[];             // 选项
  correctAnswer: string | string[]; // 正确答案
  explanation: string;            // 解析
}
```

## 阅读示例数据 (sample-reading.ts)

```typescript
interface ReadingPassage {
  id: string;
  title: string;
  category: string;               // 文章分类
  content: string;                // 正文内容
  wordCount: number;              // 字数
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];          // 题目
  keyVocabulary?: { word: string; meaning: string }[]; // 重点词汇
  isSample?: boolean;
}
```

## 完形填空示例数据 (sample-cloze.ts)

```typescript
interface ClozePassage {
  id: string;
  title: string;
  category: string;
  content: string;                // 含空格的文本，空格用 (1)___ 标记
  blanks: ClozeBlank[];           // 空格信息
  difficulty: 'easy' | 'medium' | 'hard';
  isSample?: boolean;
}

interface ClozeBlank {
  index: number;                  // 空格序号（0-based）
  correctAnswer: string;          // 正确答案
  options: string[];              // 选项
  explanation: string;            // 解析
  contextHint: string;            // 上下文提示
}
```

## 作文示例数据 (sample-writing.ts)

```typescript
interface WritingTopic {
  id: string;
  title: string;                  // 题目
  prompt: string;                 // 写作要求
  requirements: string[];         // 具体要求列表
  outline: string[];              // 写作提纲
  referenceEssay?: string;        // 参考范文
  goodSentences?: string[];       // 好词好句
  isSample?: boolean;
}
```

## 学习任务 (localStorage: tianjin-word-challenge-plan-tasks)

```typescript
interface Task {
  id: string;                     // 唯一 ID
  title: string;                  // 任务标题
  module: string;                 // 所属模块
  status: 'pending' | 'done';    // 任务状态
}
```
