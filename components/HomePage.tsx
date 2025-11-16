import React from "react";
import { useNavigate } from "react-router-dom";
import { BrainCircuit, BookOpen, ArrowRight, Shield, Cloud } from "lucide-react";

const CertificationCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  certificationSlug: string;
}> = ({ icon, title, description, certificationSlug }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 p-8 text-left w-full flex flex-col justify-between transform hover:-translate-y-2">
      <div>
        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-max mb-4">
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-gray-300 mb-6">{description}</p>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/${certificationSlug}/quiz`)}
          className="flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <BrainCircuit className="mr-2 h-5 w-5" />
          Quiz
        </button>
        <button
          onClick={() => navigate(`/${certificationSlug}/flashcards`)}
          className="flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
        >
          <BookOpen className="mr-2 h-5 w-5" />
          Flashcards
        </button>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="text-center py-8 sm:py-16">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white mb-4">
        Your AI-Powered GCP Study Hub
      </h2>
      <p className="text-lg text-slate-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
        Choose your certification path and start preparing with intelligent
        quizzes and concise flashcards.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <CertificationCard
          icon={<Cloud className="h-8 w-8 text-blue-600" />}
          title="Professional Cloud Developer"
          description="Build, deploy, and manage scalable and reliable cloud-native applications on Google Cloud."
          certificationSlug="developer"
        />
        <CertificationCard
          icon={<Shield className="h-8 w-8 text-blue-600" />}
          title="Professional Cloud Architect"
          description="Design, develop, and manage robust, secure, and dynamic solutions to drive business objectives."
          certificationSlug="architect"
        />
      </div>
    </div>
  );
};

export default HomePage;
