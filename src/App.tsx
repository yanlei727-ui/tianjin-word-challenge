import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DesktopNavigation from './components/DesktopNavigation';
import MobileBottomNavigation from './components/MobileBottomNavigation';
import HomePage from './pages/HomePage';
import VocabularyCenter from './pages/VocabularyCenter';
import GrammarPage from './pages/GrammarPage';
import ReadingPage from './pages/ReadingPage';
import ClozePage from './pages/ClozePage';
import WritingPage from './pages/WritingPage';
import MistakesPage from './pages/MistakesPage';
import PlanPage from './pages/PlanPage';
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
        <DesktopNavigation />
        <main className="app-main">
          <Routes>
            {/* Core module routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/vocabulary" element={<VocabularyCenter />} />
            <Route path="/grammar" element={<GrammarPage />} />
            <Route path="/reading" element={<ReadingPage />} />
            <Route path="/cloze" element={<ClozePage />} />
            <Route path="/writing" element={<WritingPage />} />
            <Route path="/mistakes" element={<MistakesPage />} />
            <Route path="/plan" element={<PlanPage />} />

            {/* Vocabulary sub-routes (preserved) */}
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
        <MobileBottomNavigation />
      </div>
    </BrowserRouter>
  );
}
