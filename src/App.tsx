import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import WordListPage from './pages/WordListPage';
import ChallengePage from './pages/ChallengePage';
import WrongBookPage from './pages/WrongBookPage';
import ProgressPage from './pages/ProgressPage';
import ChineseChallengePage from './pages/ChineseChallengePage';
import QuickReviewPage from './pages/QuickReviewPage';
import ChoiceQuizPage from './pages/ChoiceQuizPage';
import FavoritesPage from './pages/FavoritesPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">📝 天津中考英语词汇闯关</h1>
          <p className="app-subtitle">中考高频词汇 · 分类专项训练</p>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/wordlist" element={<WordListPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/wrongbook" element={<WrongBookPage />} />
            <Route path="/chinese-challenge" element={<ChineseChallengePage />} />
            <Route path="/quick-review" element={<QuickReviewPage />} />
            <Route path="/choice-quiz" element={<ChoiceQuizPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}
