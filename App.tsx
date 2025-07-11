
import React from 'react';
import { HashRouter, Routes, Route, NavLink } from 'react-router-dom';
import HomePage from './components/HomePage';
import QuizPage from './components/QuizPage';
import FlashcardPage from './components/FlashcardPage';
import { BrainCircuit, BookOpen, Home } from 'lucide-react';

const Header: React.FC = () => {
    const linkStyle = "flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-blue-600 transition-colors";
    const activeLinkStyle = "text-blue-600 font-semibold bg-slate-200 rounded-full";
    
    return (
        <header className="bg-white shadow-md">
            <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 p-2 rounded-lg">
                       <BrainCircuit className="text-white h-6 w-6" />
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-slate-800">GCP Developer Pro Prep</h1>
                </div>
                <div className="flex items-center gap-2 sm:gap-4">
                    <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                        <Home className="h-5 w-5" />
                        <span className="hidden sm:inline">Home</span>
                    </NavLink>
                    <NavLink to="/quiz" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                        <BrainCircuit className="h-5 w-5" />
                         <span className="hidden sm:inline">Quiz</span>
                    </NavLink>
                    <NavLink to="/flashcards" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>
                        <BookOpen className="h-5 w-5" />
                         <span className="hidden sm:inline">Flashcards</span>
                    </NavLink>
                </div>
            </nav>
        </header>
    );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/flashcards" element={<FlashcardPage />} />
          </Routes>
        </main>
        <footer className="text-center py-4 text-slate-500 text-sm bg-white border-t">
            Powered by Google Gemini. Elevate your GCP skills.
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
