import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import WordListPage from './pages/WordListPage';
import ChallengePage from './pages/ChallengePage';
import WrongBookPage from './pages/WrongBookPage';
import ProgressPage from './pages/ProgressPage';
import './index.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">📝 天津中考名词闯关</h1>
        </header>
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/wordlist" element={<WordListPage />} />
            <Route path="/challenge" element={<ChallengePage />} />
            <Route path="/wrongbook" element={<WrongBookPage />} />
            <Route path="/progress" element={<ProgressPage />} />
          </Routes>
        </main>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}
