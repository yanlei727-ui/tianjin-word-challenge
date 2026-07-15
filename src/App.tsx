import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom';
import DesktopNavigation from './components/DesktopNavigation';
import MobileBottomNavigation from './components/MobileBottomNavigation';
import HomePage from './pages/HomePage';
import VocabularyCenter from './pages/VocabularyCenter';
import GrammarPage from './pages/GrammarPage';
import ReadingPage from './pages/ReadingPage';
import ClozePage from './pages/ClozePage';
import WritingPage from './pages/WritingPage';
import MistakesPage from './pages/MistakesPage';
import LearnPage from './pages/LearnPage';
import WordListPage from './pages/WordListPage';
import ChallengePage from './pages/ChallengePage';
import WrongBookPage from './pages/WrongBookPage';
import ChineseChallengePage from './pages/ChineseChallengePage';
import QuickReviewPage from './pages/QuickReviewPage';
import ChoiceQuizPage from './pages/ChoiceQuizPage';
import FavoritesPage from './pages/FavoritesPage';
import FavoriteQuizPage from './pages/FavoriteQuizPage';
import ListenSpeedPage from './pages/ListenSpeedPage';
import './index.css';

function ListenSpeedRedirect() {
  const [searchParams] = useSearchParams();
  const moduleParam = searchParams.get('module');
  return <Navigate to={`/auto-recognize${moduleParam ? `?module=${moduleParam}` : ''}`} replace />;
}

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
            <Route path="/auto-recognize" element={<ListenSpeedPage />} />
            <Route path="/listen-speed" element={<ListenSpeedRedirect />} />
          </Routes>
        </main>
        <MobileBottomNavigation />
      </div>
    </BrowserRouter>
  );
}
