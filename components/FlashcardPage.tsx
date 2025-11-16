import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import type { Flashcard } from "../types";
import { generateFlashcards } from "../services/geminiService";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import { RefreshCw, ArrowLeft, ArrowRight } from "lucide-react";

const FlashcardViewer: React.FC<{ flashcard: Flashcard }> = ({ flashcard }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [flashcard]);

  return (
    <div className="w-full h-80 perspective-1000">
      <div
        className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of the card - Scenario */}
        <div className="absolute w-full h-full backface-hidden bg-white rounded-xl shadow-lg flex flex-col justify-center p-6 cursor-pointer border-2 border-blue-500">
          <div className="text-center mb-4">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              Scenario
            </span>
          </div>
          <p className="text-lg text-slate-800 text-center leading-relaxed">
            {flashcard.scenario}
          </p>
          <p className="text-sm text-slate-500 text-center mt-4">
            Click to reveal the solution
          </p>
        </div>
        {/* Back of the card - Solution */}
        <div className="absolute w-full h-full backface-hidden bg-green-600 text-white rounded-xl shadow-lg p-6 rotate-y-180 overflow-y-auto cursor-pointer">
          <div className="text-center mb-4">
            <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
              Solution
            </span>
          </div>
          <p className="text-lg leading-relaxed">{flashcard.solution}</p>
        </div>
      </div>
    </div>
  );
};

const FlashcardPage: React.FC = () => {
  const { certification } = useParams<{ certification: string }>();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const certificationName =
    certification === "architect"
      ? "GCP Professional Cloud Architect"
      : "GCP Professional Cloud Developer";

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedCards = await generateFlashcards(
        `${certificationName} certification exam`,
        10
      );
      setFlashcards(fetchedCards);
      setCurrentCardIndex(0);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  }, [certificationName]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  const goToNextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % flashcards.length);
  };

  const goToPrevCard = () => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + flashcards.length) % flashcards.length
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <LoadingSpinner />
        <p className="text-slate-600">
          Generating your flashcards for the {certificationName} exam...
        </p>
      </div>
    );
  }

  if (error) {
    return <ErrorDisplay message={error} onRetry={fetchFlashcards} />;
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">No Flashcards Found</h2>
        <p className="mb-4 text-slate-600">
          Could not generate flashcards. Please try again.
        </p>
        <button
          onClick={fetchFlashcards}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-5 w-5" />
          Generate New Cards
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col items-center">
      <h2 className="text-3xl font-bold text-slate-800 mb-2">
        {certificationName} Flashcards
      </h2>
      <p className="text-slate-600 mb-6">
        Click on a card to flip it and reveal the details. Good luck!
      </p>

      <FlashcardViewer flashcard={flashcards[currentCardIndex]} />

      <p className="text-slate-500 my-4">
        Card {currentCardIndex + 1} of {flashcards.length}
      </p>

      <div className="flex items-center justify-between w-full max-w-sm mt-2">
        <button
          onClick={goToPrevCard}
          className="p-3 rounded-full bg-white shadow-md hover:bg-slate-100 transition-colors"
          aria-label="Previous Card"
        >
          <ArrowLeft className="h-6 w-6 text-slate-700" />
        </button>
        <button
          onClick={fetchFlashcards}
          className="bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Get New Cards
        </button>
        <button
          onClick={goToNextCard}
          className="p-3 rounded-full bg-white shadow-md hover:bg-slate-100 transition-colors"
          aria-label="Next Card"
        >
          <ArrowRight className="h-6 w-6 text-slate-700" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardPage;
