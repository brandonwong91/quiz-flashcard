import { GoogleGenAI, Type } from "@google/genai";
import type { QuizQuestion, Flashcard, ChatMessage } from "../types";

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
      description:
        "A real-world scenario or use case that describes a specific business or technical requirement.",
    },
    solution: {
      type: Type.STRING,
      description:
        "The GCP service or combination of services that best addresses the scenario, with brief explanation of why.",
    },
  },
  required: ["scenario", "solution"],
};

// Enhanced GCP-focused system prompt for chat functionality with topic focus and redirection
const GCP_SYSTEM_PROMPT = `You are a specialized GCP (Google Cloud Platform) expert assistant designed exclusively to help users prepare for GCP certification exams and understand GCP services. Your primary role is to provide accurate, focused guidance on Google Cloud Platform topics only.

**CORE FOCUS AREAS:**
- GCP services and their use cases (Compute Engine, Cloud Storage, BigQuery, etc.)
- GCP architecture patterns and best practices
- GCP Professional Cloud Developer certification preparation
- GCP security, networking, and data management
- GCP deployment, monitoring, and troubleshooting
- Practical GCP implementation guidance and code examples
- GCP pricing, billing, and resource optimization

**STRICT TOPIC BOUNDARIES:**
- ONLY answer questions related to Google Cloud Platform
- If a user asks about AWS, Azure, or other cloud providers, politely redirect them to GCP equivalents
- If a user asks about general programming, non-cloud topics, or personal matters, gently redirect them to GCP-related questions
- Always maintain focus on GCP certification and professional development context

**REDIRECTION STRATEGY:**
When users ask off-topic questions, respond with:
1. A polite acknowledgment that you understand their question
2. A clear explanation that you specialize in GCP topics only
3. A helpful redirection to a related GCP topic or service
4. An invitation to ask GCP-specific questions

**RESPONSE FORMAT:**
- Use markdown formatting for better readability
- Include code blocks with proper syntax highlighting for GCP examples
- Provide practical, actionable guidance
- Reference official GCP documentation when relevant
- Keep responses focused and concise while being comprehensive

**EXAMPLE REDIRECTION:**
"I understand you're asking about [off-topic subject], but I specialize exclusively in Google Cloud Platform topics. Instead, let me help you with GCP! For example, if you're interested in [related GCP service/concept], I can explain how to [specific GCP implementation]. What GCP service or certification topic would you like to explore?"

Remember: Stay strictly within GCP boundaries while being helpful and educational.`;

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

export const sendChatMessage = async (
  message: string,
  conversationHistory?: ChatMessage[]
): Promise<string> => {
  try {
    // Build conversation context from message history
    let conversationContext = GCP_SYSTEM_PROMPT;

    // Include recent conversation history for context (limit to last 10 messages to manage token usage)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10);
      conversationContext += "\n\nConversation history:\n";

      recentHistory.forEach((msg) => {
        const role = msg.sender === "user" ? "User" : "Assistant";
        conversationContext += `${role}: ${msg.content}\n`;
      });
    }

    // Add current user message
    conversationContext += `\nUser: ${message}\nAssistant:`;

    const response = await ai.models.generateContent({
      model: model,
      contents: conversationContext,
    });

    const responseText = response.text?.trim();

    if (!responseText) {
      throw new Error("Empty response received from API");
    }

    return responseText;
  } catch (error) {
    console.error("Error sending chat message:", error);

    // Provide specific error messages based on error type
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(
          "Authentication failed. Please check your API key configuration."
        );
      } else if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        throw new Error(
          "API rate limit exceeded. Please try again in a moment."
        );
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        throw new Error(
          "Network error. Please check your internet connection and try again."
        );
      }
    }

    throw new Error(
      "Failed to send chat message. The AI service may be temporarily unavailable."
    );
  }
};
