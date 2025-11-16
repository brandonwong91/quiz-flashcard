import React, { useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { QuizQuestion } from "../types";
import { generateQuizQuestions } from "../services/geminiService";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import { CheckCircle, XCircle } from "lucide-react";

const DEVELOPER_TOPICS = [
  "App Engine",
  "Artifact Registry",
  "Cloud Build",
  "Cloud Code",
  "Cloud Deploy",
  "Cloud Functions",
  "Cloud Run",
  "Cloud Source Repositories",
  "Compute Engine",
  "Google Kubernetes Engine (GKE)",
  "Cloud Storage",
  "Cloud SQL",
  "Firestore",
  "Cloud Spanner",
  "Bigtable",
  "IAM",
  "Secret Manager",
  "Identity Platform",
  "VPC",
  "Cloud Load Balancing",
  "Cloud CDN",
  "Cloud Logging",
  "Cloud Monitoring",
  "Cloud Trace",
  "Cloud Profiler",
  "Pub/Sub",
  "Eventarc",
  "Workflows",
  "API Gateway",
  "Apigee",
];

const ARCHITECT_TOPICS = [
  "Designing and planning a cloud solution architecture",
  "Managing and provisioning a cloud solution infrastructure",
  "Designing for security and compliance",
  "Analyzing and optimizing technical and business processes",
  "Managing implementation",
  "Ensuring solution and operations reliability",
];

interface UserAnswer {
  questionIndex: number;
  selectedAnswerIndex: number;
  isCorrect: boolean;
}

const QuizPage: React.FC = () => {
  const { certification } = useParams<{ certification: string }>();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [topicMode, setTopicMode] = useState<"specific" | "random" | "all">(
    "specific"
  );

  const TOPICS =
    certification === "architect" ? ARCHITECT_TOPICS : DEVELOPER_TOPICS;
  const certificationName =
    certification === "architect"
      ? "GCP Professional Cloud Architect"
      : "GCP Professional Cloud Developer";

  const [selectedTopic, setSelectedTopic] = useState<string>(TOPICS[0]);

  const startQuiz = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setIsFinished(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setUserAnswers([]);

    try {
      let topicPrompt = "";
      if (topicMode === "specific") {
        topicPrompt = `Focus on the topic: ${selectedTopic}.`;
      } else if (topicMode === "random") {
        topicPrompt = "Cover a random mixture of GCP topics.";
      } else {
        topicPrompt = "Cover all major GCP topics comprehensively.";
      }

      const fetchedQuestions = await generateQuizQuestions(
        `${certificationName} certification exam. ${topicPrompt}`,
        questionCount
      );
      setQuestions(fetchedQuestions);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedTopic, questionCount, topicMode, certificationName]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answerIndex);
    const isCorrect =
      answerIndex === questions[currentQuestionIndex].correctAnswerIndex;

    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    setUserAnswers((prev) => [
      ...prev,
      {
        questionIndex: currentQuestionIndex,
        selectedAnswerIndex: answerIndex,
        isCorrect,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setIsFinished(true);
    }
  };

  const restartQuiz = () => {
    setQuestions([]);
    startQuiz();
  };

  const resetToTopicSelection = () => {
    setQuestions([]);
    setIsFinished(false);
    setError(null);
    setUserAnswers([]);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <LoadingSpinner />
        <p className="text-slate-600">
          Generating your {questionCount}-question quiz for the{" "}
          {certificationName} exam...
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={startQuiz} />;
  }

  if (questions.length === 0) {
    return (
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">
          {certificationName} Quiz
        </h2>
        <p className="text-slate-600 mb-6">
          Customize your quiz settings and start testing your GCP knowledge.
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Number of questions:
          </label>
          <select
            value={questionCount}
            onChange={(e) => setQuestionCount(Number(e.target.value))}
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5 questions</option>
            <option value={10}>10 questions</option>
            <option value={15}>15 questions</option>
            <option value={20}>20 questions</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Topic selection:
          </label>
          <select
            value={topicMode}
            onChange={(e) =>
              setTopicMode(e.target.value as "specific" | "random" | "all")
            }
            className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="specific">Specific topic</option>
            <option value="random">Random mixture of topics</option>
            <option value="all">All major GCP topics</option>
          </select>
        </div>

        {topicMode === "specific" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Choose a topic:
            </label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {TOPICS.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        )}
        <button
          onClick={startQuiz}
          className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
        >
          Start Quiz
        </button>
      </div>
    );
  }

  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-4xl mx-auto">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg mb-8">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">
            Quiz Completed!
          </h2>
          <p className="text-slate-600 mb-6">
            You scored <span className="font-bold">{score}</span> out of{" "}
            <span className="font-bold">{questions.length}</span>.
          </p>
          <div className="w-full bg-slate-200 rounded-full h-4 mb-4">
            <div
              className="bg-blue-600 h-4 rounded-full"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <p className="font-semibold text-xl mb-6">{percentage}%</p>
          <div className="flex gap-4">
            <button
              onClick={restartQuiz}
              className="flex-1 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={resetToTopicSelection}
              className="flex-1 bg-slate-200 text-slate-800 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors"
            >
              Choose New Topic
            </button>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <h3 className="text-2xl font-bold text-slate-800 mb-4">
            Review Your Answers
          </h3>
          <div className="mb-6 p-4 bg-slate-50 rounded-lg">
            <h4 className="font-semibold text-slate-800 mb-3">Topics Covered:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(
                questions.reduce((acc, q) => {
                  acc[q.topic] = (acc[q.topic] || 0) + 1;
                  return acc;
                }, {} as Record<string, number>)
              ).map(([topic, count]) => (
                <span key={topic} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                  {topic} ({count})
                </span>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            {questions.map((question, index) => {
              const userAnswer = userAnswers.find(
                (ua) => ua.questionIndex === index
              );
              const isCorrect = userAnswer?.isCorrect || false;

              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-lg p-6"
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        isCorrect ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <div className="mb-2">
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          {question.topic}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-3">
                        {question.question}
                      </h4>
                      <div className="space-y-2">
                        {question.options.map((option, optionIndex) => {
                          const isUserAnswer =
                            userAnswer?.selectedAnswerIndex === optionIndex;
                          const isCorrectAnswer =
                            optionIndex === question.correctAnswerIndex;

                          let optionClass = "p-3 rounded border ";
                          if (isCorrectAnswer) {
                            optionClass +=
                              "bg-green-100 border-green-500 text-green-800";
                          } else if (isUserAnswer && !isCorrectAnswer) {
                            optionClass +=
                              "bg-red-100 border-red-500 text-red-800";
                          } else {
                            optionClass +=
                              "bg-slate-50 border-slate-200 text-slate-600";
                          }

                          return (
                            <div key={optionIndex} className={optionClass}>
                              <div className="flex items-center justify-between">
                                <span>{option}</span>
                                <div className="flex gap-2">
                                  {isUserAnswer && (
                                    <span className="text-sm font-medium">
                                      Your Answer
                                    </span>
                                  )}
                                  {isCorrectAnswer && (
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                  )}
                                  {isUserAnswer && !isCorrectAnswer && (
                                    <XCircle className="w-5 h-5 text-red-600" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-4 bg-slate-100 rounded-lg">
                        <h5 className="font-bold text-slate-800 mb-2">
                          Explanation:
                        </h5>
                        <p className="text-slate-700">{question.explanation}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="mb-4">
          <p className="text-sm text-slate-500">
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          <div className="w-full bg-slate-200 rounded-full h-2 mt-1">
            <div
              className="bg-blue-500 h-2 rounded-full"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>
        <div className="mb-4">
          <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
            {currentQuestion.topic}
          </span>
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-6">
          {currentQuestion.question}
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {currentQuestion.options.map((option, index) => {
            const isCorrect = index === currentQuestion.correctAnswerIndex;
            const isSelected = selectedAnswer === index;
            let buttonClass =
              "w-full text-left p-4 border rounded-lg transition-all duration-200 ";

            if (selectedAnswer !== null) {
              if (isCorrect) {
                buttonClass +=
                  "bg-green-100 border-green-500 text-green-800 font-semibold";
              } else if (isSelected) {
                buttonClass += "bg-red-100 border-red-500 text-red-800";
              } else {
                buttonClass += "bg-slate-50 border-slate-300 text-slate-600";
              }
            } else {
              buttonClass +=
                "bg-white border-slate-300 hover:bg-blue-50 hover:border-blue-400";
            }

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={selectedAnswer !== null}
                className={buttonClass}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {selectedAnswer !== null &&
                    isSelected &&
                    (isCorrect ? (
                      <CheckCircle className="text-green-600" />
                    ) : (
                      <XCircle className="text-red-600" />
                    ))}
                  {selectedAnswer !== null && !isSelected && isCorrect && (
                    <CheckCircle className="text-green-600" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
        {selectedAnswer !== null && (
          <div className="mt-6">
            <div className="bg-slate-100 p-4 rounded-lg">
              <h4 className="font-bold text-slate-800 mb-2">Explanation:</h4>
              <p className="text-slate-700">{currentQuestion.explanation}</p>
            </div>
            <button
              onClick={handleNextQuestion}
              className="w-full mt-6 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {currentQuestionIndex < questions.length - 1
                ? "Next Question"
                : "Finish Quiz"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;
