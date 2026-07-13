# 天津中考英语学习系统 - 系统架构

## 系统概述

淳淳英语（TIANJIN ENGLISH LEARNING SYSTEM）是一个面向天津中考的英语学习系统，包含词汇、语法、阅读、完形、作文等模块。

## 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite 8
- **路由**：React Router DOM 7
- **样式**：纯 CSS（CSS 变量体系）
- **数据存储**：浏览器 localStorage
- **语音**：Web Speech API

## 目录结构

```
src/
├── components/          # 组件
│   ├── shared/          # 公共可复用组件
│   │   ├── AppHeader.tsx
│   │   ├── EmptyState.tsx
│   │   ├── ComingSoonState.tsx
│   │   ├── LoadingState.tsx
│   │   ├── SectionHeader.tsx
│   │   ├── ModuleCard.tsx
│   │   ├── ContentCard.tsx
│   │   ├── PracticeLayout.tsx
│   │   └── index.ts
│   ├── DesktopNavigation.tsx    # 桌面端顶部导航
│   ├── MobileBottomNavigation.tsx # 手机端底部导航
│   ├── Navigation.tsx           # (已弃用，保留兼容)
│   └── WordCard.tsx             # 单词卡片组件
├── data/                # 数据文件
│   ├── words.json               # 名词数据（136词）
│   ├── words-adj-adv.json       # 形容词与副词数据（64词）
│   ├── words-verb.json          # 动词数据
│   ├── sample-grammar.ts        # 语法示例数据
│   ├── sample-reading.ts        # 阅读示例数据
│   ├── sample-cloze.ts          # 完形示例数据
│   └── sample-writing.ts        # 作文示例数据
├── hooks/               # 自定义 Hooks（预留）
├── pages/               # 页面组件
│   ├── HomePage.tsx             # 系统首页（7大模块入口）
│   ├── VocabularyCenter.tsx     # 词汇中心
│   ├── GrammarPage.tsx          # 语法专项
│   ├── ReadingPage.tsx          # 阅读理解
│   ├── ClozePage.tsx            # 完形填空
│   ├── WritingPage.tsx          # 作文训练
│   ├── MistakesPage.tsx         # 错题本（跨模块）
│   ├── PlanPage.tsx             # 学习计划
│   ├── LearnPage.tsx            # 单词学习（保留）
│   ├── WordListPage.tsx         # 单词本（保留）
│   ├── ChallengePage.tsx        # 闯关模式（保留）
│   ├── WrongBookPage.tsx        # 错词本（保留）
│   ├── ChineseChallengePage.tsx # 释义训练（保留）
│   ├── QuickReviewPage.tsx      # 快速识词（保留）
│   ├── ChoiceQuizPage.tsx       # 选择练习（保留）
│   ├── FavoritesPage.tsx        # 重点词（保留）
│   └── FavoriteQuizPage.tsx     # 重点词训练（保留）
├── styles/              # 样式目录（预留）
├── types/               # TypeScript 类型定义
│   └── index.ts                 # 统一类型定义
├── utils/               # 工具函数
│   ├── modules.ts               # 词库模块管理
│   ├── quiz.ts                  # 题目生成
│   ├── speech.ts                # 语音朗读
│   └── storage.ts               # 本地存储管理
├── App.tsx              # 应用入口（路由配置）
├── App.css              # (保留，未使用)
├── index.css            # 全局样式
└── main.tsx             # React 入口
```

## 模块关系

```
系统首页 (/)
├── 词汇中心 (/vocabulary)
│   ├── 单词本 (/wordlist?module=noun|adj_adv|verb)
│   ├── 学习 (/learn?module=...)
│   ├── 释义训练 (/chinese-challenge)
│   ├── 快速识词 (/quick-review)
│   ├── 选择练习 (/choice-quiz)
│   ├── 闯关模式 (/challenge)
│   ├── 重点词 (/favorites)
│   ├── 重点词训练 (/favorite-quiz)
│   └── 错词本 (/wrongbook)
├── 语法专项 (/grammar)
├── 阅读理解 (/reading)
├── 完形填空 (/cloze)
├── 作文训练 (/writing)
├── 错题本 (/mistakes)
└── 学习计划 (/plan)
```

## 数据流

1. **词汇数据**：JSON 文件 → 模块系统 → 页面组件
2. **学习进度**：localStorage（按模块存储）
3. **错题记录**：词汇错题在各模块 localStorage 中，统一展示在错题本
4. **收藏记录**：localStorage 统一存储
5. **学习计划**：localStorage 存储自定义任务

## 响应式设计

- **桌面端（>768px）**：顶部导航，最大宽度 1200px
- **手机端（≤768px）**：底部导航，安全区域适配
- **最小宽度**：320px（iPhone SE）
