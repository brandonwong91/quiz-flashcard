import React, { useContext } from "react";
import { HashRouter, Routes, Route, NavLink } from "react-router-dom";
import HomePage from "./components/HomePage";
import QuizPage from "./components/QuizPage";
import FlashcardPage from "./components/FlashcardPage";
import ChatPage from "./components/ChatPage";
import { BrainCircuit, BookOpen, Home, MessageCircle, Sun, Moon } from "lucide-react";
import { ThemeContext } from "./contexts/ThemeContext";

const Header: React.FC = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const linkStyle =
    "flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors";
  const activeLinkStyle =
    "text-blue-600 dark:text-blue-400 font-semibold bg-slate-200 dark:bg-gray-700 rounded-full";

  return (
    <header className="bg-white shadow-md dark:bg-gray-800 dark:text-white">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BrainCircuit className="text-white h-6 w-6" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white">
            GCP Prep
          </h1>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeLinkStyle : ""}`
            }
          >
            <Home className="h-5 w-5" />
            <span className="hidden sm:inline">Home</span>
          </NavLink>
          <NavLink
            to="/chat"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? activeLinkStyle : ""}`
            }
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden sm:inline">Chat</span>
          </NavLink>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </nav>
    </header>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen flex flex-col font-sans bg-slate-100 dark:bg-gray-900">
        <Header />
        <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/:certification/quiz" element={<QuizPage />} />
            <Route
              path="/:certification/flashcards"
              element={<FlashcardPage />}
            />
            <Route path="/chat" element={<ChatPage />} />
          </Routes>
        </main>
        <footer className="text-center py-4 text-slate-500 dark:text-gray-400 text-sm bg-white dark:bg-gray-800 border-t dark:border-gray-700">
          Powered by Google Gemini. Elevate your GCP skills.
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;
