// ============================================================
// 天津中考英语学习系统 - 统一类型定义
// ============================================================

// --- 学习模块 ---
export type LearningModuleKey =
  | 'vocabulary'
  | 'grammar'
  | 'reading'
  | 'cloze'
  | 'writing'
  | 'mistakes'
  | 'plan';

export interface LearningModule {
  key: LearningModuleKey;
  label: string;
  subtitle: string;
  icon: string;
  color: string;
  description: string;
  route: string;
}

// --- 词汇相关 ---
export type VocabularyCategory = 'noun' | 'adj_adv' | 'verb';

export interface VocabularyItem {
  id: number;
  word: string;
  phonetic: string;
  meaning: string;
  partOfSpeech: string;
  example: string;
  exampleZh: string;
  level: number;
  group: number;
  isUncountable: boolean;
  note: string;
}

// --- 语法专项（新版） ---
export interface GrammarTopic {
  id: string;
  title: string;
  subtitle: string;
  sections: GrammarSection[];
  exercises: GrammarExercise[];
}

export interface GrammarSection {
  id: string;
  type: 'knowledge' | 'examples' | 'mistakes' | 'tips' | 'patterns';
  title: string;
  content?: string;
  items?: GrammarSectionItem[];
}

export interface GrammarSectionItem {
  label?: string;
  english?: string;
  chinese?: string;
  highlight?: string;
  note?: string;
}

export interface GrammarExercise {
  id: string;
  type: 'choice' | 'fill';
  difficulty: 'basic' | 'advanced';
  stem: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  knowledgePoint: string;
  mistakeReason?: string;
}

// --- 阅读理解 ---
export interface ReadingPassage {
  id: string;
  title: string;
  category: string;
  content: string;
  wordCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  keyVocabulary?: { word: string; meaning: string }[];
  isSample?: boolean;
}

// --- 完形填空 ---
export interface ClozePassage {
  id: string;
  title: string;
  category: string;
  content: string;
  blanks: ClozeBlank[];
  difficulty: 'easy' | 'medium' | 'hard';
  isSample?: boolean;
}

export interface ClozeBlank {
  index: number;
  correctAnswer: string;
  options: string[];
  explanation: string;
  contextHint: string;
}

// --- 作文训练 ---
export interface WritingTopic {
  id: string;
  title: string;
  examYear?: number;
  sourceNote?: string;
  prompt: string;
  requirements: string[];
  outline: string[];
  writingTips?: string[];
  referenceEssay?: string;
  referenceEssays?: { label: string; description: string; content: string }[];
  goodSentences?: string[];
  isSample?: boolean;
}

// --- 通用题目 ---
export interface Question {
  id: string;
  type: 'choice' | 'fill' | 'match' | 'judge' | 'essay';
  stem: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  sourceModule?: LearningModuleKey;
  sourceContentId?: string;
}

// --- 错题记录 ---
export type MistakeSource = 'vocabulary' | 'grammar' | 'reading' | 'cloze' | 'writing';

export interface MistakeRecord {
  id: string;
  source: MistakeSource;
  contentId: string;
  questionId?: string;
  wrongAnswer: string;
  correctAnswer: string;
  errorCount: number;
  errorReason?: string;
  createdAt: string;
  lastReviewedAt?: string;
  status: 'pending' | 'reviewing' | 'mastered';
}

// --- 学习计划 ---
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface StudyTask {
  id: string;
  title: string;
  description?: string;
  module: LearningModuleKey;
  relatedContentId?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

// --- 练习布局 ---
export interface PracticeResult {
  total: number;
  correct: number;
  accuracy: number;
  wrongItems: { questionId: string; correctAnswer: string }[];
}
