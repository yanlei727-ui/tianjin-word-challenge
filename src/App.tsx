import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import WordListPage from './pages/WordListPage';
import ChallengePage from './pages/ChallengePage';
import WrongBookPage from './pages/WrongBookPage';
import ChineseChallengePage from './pages/ChineseChallengePage';
import QuickReviewPage from './pages/QuickReviewPage';
import ChoiceQuizPage from './pages/ChoiceQuizPage';
import FavoritesPage from './pages/FavoritesPage';
import FavoriteQuizPage from './pages/FavoriteQuizPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
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
            <Route path="/favorite-quiz" element={<FavoriteQuizPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}
