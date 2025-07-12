
export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  topic: string;
}

export interface Flashcard {
  topic: string;
  content: string;
}
