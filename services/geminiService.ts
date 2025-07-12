import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, Flashcard } from "../types";

// The API key is assumed to be set in the environment variables as per the guidelines.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = "gemini-2.5-flash";

const quizQuestionSchema = {
  type: Type.OBJECT,
  properties: {
    question: { type: Type.STRING, description: "The question text." },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "An array of 4 possible answers.",
    },
    correctAnswerIndex: {
      type: Type.INTEGER,
      description:
        "The 0-based index of the correct answer in the options array.",
    },
    explanation: {
      type: Type.STRING,
      description: "A brief explanation of why the correct answer is right.",
    },
    topic: {
      type: Type.STRING,
      description:
        "The specific GCP topic this question covers (e.g., 'Cloud Storage', 'IAM').",
    },
  },
  required: [
    "question",
    "options",
    "correctAnswerIndex",
    "explanation",
    "topic",
  ],
};

const flashcardSchema = {
  type: Type.OBJECT,
  properties: {
    scenario: {
      type: Type.STRING,
      description: "A real-world scenario or use case that describes a specific business or technical requirement.",
    },
    solution: {
      type: Type.STRING,
      description: "The GCP service or combination of services that best addresses the scenario, with brief explanation of why.",
    },
  },
  required: ["scenario", "solution"],
};

export const generateQuizQuestions = async (
  topicPrompt: string,
  count: number
): Promise<QuizQuestion[]> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate ${count} challenging multiple-choice questions for the GCP Professional Cloud Developer certification exam. ${topicPrompt} Each question must have exactly 4 options and include the specific GCP topic it covers.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: quizQuestionSchema,
        },
      },
    });

    const jsonText = response.text.trim();
    // The response is expected to be a valid JSON string matching the schema.
    // The 'as' cast is considered safe here because the API contract enforces the schema.
    return JSON.parse(jsonText) as QuizQuestion[];
  } catch (error) {
    console.error("Error generating quiz questions:", error);
    throw new Error(
      "Failed to generate quiz questions. The API may be unavailable or the request was malformed."
    );
  }
};

export const generateFlashcards = async (
  count: number
): Promise<Flashcard[]> => {
  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: `Generate ${count} scenario-based flashcards for the GCP Professional Cloud Developer certification exam. Each flashcard should present a real-world business or technical scenario first, followed by the best GCP service solution. Base scenarios on common GCP certification question patterns. Format: scenario describes the situation/requirement, solution reveals the appropriate GCP service with brief justification.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: flashcardSchema,
        },
      },
    });

    const jsonText = response.text?.trim();
    // The response is expected to be a valid JSON string matching the schema.
    // The 'as' cast is considered safe here because the API contract enforces the schema.
    return JSON.parse(jsonText!) as Flashcard[];
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error(
      "Failed to generate flashcards. The API may be unavailable or the request was malformed."
    );
  }
};
