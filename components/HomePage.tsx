
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BrainCircuit, BookOpen, ArrowRight } from 'lucide-react';

const InfoCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}> = ({ icon, title, description, path }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(path)}
      className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 text-left w-full flex flex-col justify-between transform hover:-translate-y-2"
    >
      <div>
        <div className="p-3 bg-blue-100 rounded-full w-max mb-4">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-600 mb-6">{description}</p>
      </div>
      <div className="flex items-center text-blue-600 font-semibold">
        Start Now <ArrowRight className="ml-2 h-5 w-5" />
      </div>
    </button>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="text-center py-8 sm:py-16">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">Your AI-Powered GCP Study Hub</h2>
      <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12">
        Prepare for the GCP Professional Cloud Developer exam with intelligent quizzes and concise flashcards generated just for you.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <InfoCard
          icon={<BrainCircuit className="h-8 w-8 text-blue-600" />}
          title="Interactive Quiz"
          description="Test your knowledge with challenging, exam-style questions on various GCP topics. Get instant feedback and explanations."
          path="/quiz"
        />
        <InfoCard
          icon={<BookOpen className="h-8 w-8 text-blue-600" />}
          title="Study Flashcards"
          description="Review key concepts and services with AI-generated flashcards. Perfect for quick revision sessions."
          path="/flashcards"
        />
      </div>
    </div>
  );
};

export default HomePage;
