# 天津中考英语学习系统 - 内容添加指南

## 如何新增单词

### 1. 打开数据文件

编辑 `src/data/words.json`（名词）、`words-adj-adv.json`（形容词副词）或 `words-verb.json`（动词）。

### 2. 添加单词条目

在 JSON 数组末尾添加新条目：

```json
{
  "id": 137,
  "word": "example",
  "phonetic": "/ɪɡˈzæmpl/",
  "meaning": "例子；榜样",
  "partOfSpeech": "n.",
  "example": "This is a good example.",
  "exampleZh": "这是一个好例子。",
  "level": 1,
  "group": 1,
  "isUncountable": false,
  "note": ""
}
```

### 3. 注意事项

- `id` 必须唯一，且不能与已有 ID 冲突
- `level` 用于关卡分组，建议按难度设置
- `group` 用于释义训练分组
- 保存后自动生效，无需重新构建

---

## 如何新增语法专题

### 1. 打开数据文件

编辑 `src/data/sample-grammar.ts`。

### 2. 添加专题条目

在 `sampleGrammarTopics` 数组中添加：

```typescript
{
  id: 'grammar-new-topic',
  title: '新语法专题',
  description: '专题描述',
  isSample: true,  // 示例内容标记为 true
  rules: [
    {
      title: '规则标题',
      content: '规则内容',
      tips: ['提示1', '提示2'],
    },
  ],
  examples: [
    { sentence: '英文例句', translation: '中文翻译', highlight: '高亮词' },
  ],
  exercises: [
    {
      id: 'g-new-q1',
      type: 'choice',
      stem: '题目题干',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'A',
      explanation: '解析说明',
    },
  ],
}
```

---

## 如何新增阅读文章

### 1. 打开数据文件

编辑 `src/data/sample-reading.ts`。

### 2. 添加文章条目

在 `sampleReadingPassages` 数组中添加：

```typescript
{
  id: 'reading-new-1',
  title: '文章标题',
  category: '分类（如：日常生活）',
  content: '文章正文内容...',
  wordCount: 150,
  difficulty: 'medium',  // easy | medium | hard
  isSample: true,
  questions: [
    {
      id: 'rn1-q1',
      type: 'choice',
      stem: '问题',
      options: ['A', 'B', 'C', 'D'],
      correctAnswer: 'B',
      explanation: '解析',
    },
  ],
  keyVocabulary: [
    { word: 'vocabulary', meaning: '词汇' },
  ],
}
```

---

## 如何新增完形填空

### 1. 打开数据文件

编辑 `src/data/sample-cloze.ts`。

### 2. 添加文章条目

在 `sampleClozePassages` 数组中添加：

```typescript
{
  id: 'cloze-new-1',
  title: '文章标题',
  category: '分类',
  content: '文章内容 (1)___ 有空格的文本 (2)___ ...',
  difficulty: 'easy',
  isSample: true,
  blanks: [
    {
      index: 0,                    // 对应 (1)
      correctAnswer: '正确答案',
      options: ['A', 'B', 'C', 'D'],
      explanation: '解析',
      contextHint: '上下文提示',
    },
    {
      index: 1,                    // 对应 (2)
      correctAnswer: '正确答案',
      options: ['A', 'B', 'C', 'D'],
      explanation: '解析',
      contextHint: '上下文提示',
    },
  ],
}
```

---

## 如何新增作文题目

### 1. 打开数据文件

编辑 `src/data/sample-writing.ts`。

### 2. 添加题目条目

在 `sampleWritingTopics` 数组中添加：

```typescript
{
  id: 'writing-new-1',
  title: '作文题目',
  prompt: '写作要求描述',
  requirements: ['要求1', '要求2'],
  outline: ['提纲1', '提纲2'],
  referenceEssay: '参考范文内容...',
  goodSentences: ['好句1（中文翻译）', '好句2（中文翻译）'],
  isSample: true,
}
```

---

## 添加新模块的步骤

1. 在 `src/types/index.ts` 中定义数据类型
2. 在 `src/data/` 下创建数据文件
3. 在 `src/pages/` 下创建页面组件
4. 在 `src/App.tsx` 中添加路由
5. 在 `src/components/DesktopNavigation.tsx` 和 `MobileBottomNavigation.tsx` 中添加导航项
6. 在 `src/index.css` 中添加页面样式
7. 在首页 `src/pages/HomePage.tsx` 中添加模块卡片
