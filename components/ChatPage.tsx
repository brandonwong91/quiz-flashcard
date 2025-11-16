import React, { useState, useRef, useEffect } from "react";
import { Send, AlertTriangle, RefreshCw, X, Info } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { ChatMessage } from "../types";
import { LoadingSpinner } from "./LoadingSpinner";
import { sendChatMessage } from "../services/geminiService";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "network" | "api" | "validation" | "general"
  >("general");
  const [topicSuggestion, setTopicSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // GCP topic focus detection and suggestion logic
  const analyzeTopicFocus = (message: string): string | null => {
    const lowerMessage = message.toLowerCase();

    // Common off-topic indicators
    const offTopicKeywords = [
      "aws",
      "amazon web services",
      "azure",
      "microsoft azure",
      "docker",
      "kubernetes",
      "k8s",
      "terraform",
      "ansible",
      "python",
      "javascript",
      "java",
      "node.js",
      "react",
      "angular",
      "database",
      "mysql",
      "postgresql",
      "mongodb",
      "weather",
      "recipe",
      "cooking",
      "cook",
      "pasta",
      "food",
      "travel",
      "movie",
      "music",
      "personal",
      "relationship",
      "health",
      "medical",
      "politics",
      "news",
      "sports",
      "entertainment",
    ];

    // GCP-specific keywords that indicate on-topic questions
    const gcpKeywords = [
      "gcp",
      "google cloud",
      "cloud platform",
      "compute engine",
      "app engine",
      "cloud storage",
      "bigquery",
      "cloud sql",
      "firestore",
      "datastore",
      "cloud functions",
      "cloud run",
      "kubernetes engine",
      "gke",
      "cloud pub/sub",
      "cloud dataflow",
      "cloud dataproc",
      "cloud composer",
      "cloud iam",
      "cloud security",
      "vpc",
      "cloud load balancing",
      "cloud cdn",
      "cloud dns",
      "cloud monitoring",
      "cloud logging",
      "cloud build",
      "cloud source repositories",
      "cloud deployment manager",
      "professional cloud developer",
      "certification",
      "exam",
    ];

    // Check if message contains GCP keywords
    const hasGcpKeywords = gcpKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    // Check if message contains off-topic keywords
    const hasOffTopicKeywords = offTopicKeywords.some((keyword) =>
      lowerMessage.includes(keyword)
    );

    // If it has off-topic keywords but no GCP keywords, suggest redirection
    if (hasOffTopicKeywords && !hasGcpKeywords) {
      // Provide specific GCP alternatives based on the off-topic keyword
      if (
        lowerMessage.includes("aws") ||
        lowerMessage.includes("amazon web services")
      ) {
        return "I see you're asking about AWS. I specialize in Google Cloud Platform! Would you like to know about GCP equivalents like Compute Engine (vs EC2), Cloud Storage (vs S3), or BigQuery (vs Redshift)?";
      }

      if (
        lowerMessage.includes("azure") ||
        lowerMessage.includes("microsoft azure")
      ) {
        return "I notice you mentioned Azure. Let me help you with Google Cloud Platform instead! Are you interested in GCP services like App Engine, Cloud Functions, or GCP's AI/ML offerings?";
      }

      if (
        lowerMessage.includes("docker") ||
        lowerMessage.includes("kubernetes") ||
        lowerMessage.includes("k8s")
      ) {
        return "Great question about containerization! In GCP context, would you like to learn about Google Kubernetes Engine (GKE), Cloud Run for containerized apps, or how to deploy containers on Compute Engine?";
      }

      if (
        lowerMessage.includes("database") ||
        lowerMessage.includes("mysql") ||
        lowerMessage.includes("postgresql")
      ) {
        return "Database questions are perfect for GCP! Would you like to learn about Cloud SQL, Firestore, Cloud Spanner, or BigQuery for your data storage needs?";
      }

      // Generic redirection for other off-topic keywords
      return "I specialize in Google Cloud Platform topics! Let me help you with GCP services, architecture patterns, or certification preparation. What GCP topic interests you most?";
    }

    // If message is very short and doesn't contain GCP keywords, suggest being more specific
    if (message.trim().split(" ").length <= 3 && !hasGcpKeywords) {
      return "To provide the best GCP guidance, could you be more specific? For example, ask about specific GCP services, architecture patterns, or certification topics you'd like to explore.";
    }

    return null;
  };

  // Auto-scroll to latest messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced error categorization
  const categorizeError = (
    error: unknown
  ): {
    message: string;
    type: "network" | "api" | "validation" | "general";
  } => {
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("network") ||
        errorMessage.includes("fetch") ||
        errorMessage.includes("connection")
      ) {
        return {
          message:
            "Network connection failed. Please check your internet connection and try again.",
          type: "network",
        };
      }

      if (
        errorMessage.includes("api") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit")
      ) {
        return {
          message:
            "API service is temporarily unavailable. Please wait a moment and try again.",
          type: "api",
        };
      }

      if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("validation")
      ) {
        return {
          message:
            "Your message couldn't be processed. Please try rephrasing your question.",
          type: "validation",
        };
      }

      return {
        message: error.message,
        type: "general",
      };
    }

    return {
      message: "An unexpected error occurred. Please try again.",
      type: "general",
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Enhanced input validation
    const trimmedMessage = currentMessage.trim();

    if (!trimmedMessage) {
      setError("Please enter a message before sending.");
      setErrorType("validation");
      return;
    }

    if (trimmedMessage.length > 2000) {
      setError("Message is too long. Please keep it under 2000 characters.");
      setErrorType("validation");
      return;
    }

    if (isLoading) {
      return;
    }

    // Analyze topic focus and provide suggestions if needed
    const suggestion = analyzeTopicFocus(trimmedMessage);
    if (suggestion) {
      setTopicSuggestion(suggestion);
      // Still proceed with the message but show the suggestion
    } else {
      setTopicSuggestion(null);
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: trimmedMessage,
      sender: "user",
      timestamp: new Date(),
    };

    // Add user message to conversation history
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setCurrentMessage("");
    setIsLoading(true);
    setError(null);

    try {
      // Send message with conversation history for context
      const response = await sendChatMessage(userMessage.content, messages);

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        sender: "assistant",
        timestamp: new Date(),
      };

      // Add assistant response to conversation history
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const { message, type } = categorizeError(error);
      setError(message);
      setErrorType(type);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = async () => {
    setError(null);

    // Find the last user message to retry
    const lastUserMessage = messages
      .filter((msg) => msg.sender === "user")
      .pop();

    if (!lastUserMessage) {
      return;
    }

    setIsLoading(true);

    try {
      // Get conversation history up to the last user message (excluding any failed assistant responses)
      const lastUserMessageIndex = messages
        .map((msg) => msg.id)
        .lastIndexOf(lastUserMessage.id);
      const historyUpToLastUser = messages.slice(0, lastUserMessageIndex);

      const response = await sendChatMessage(
        lastUserMessage.content,
        historyUpToLastUser
      );

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: response,
        sender: "assistant",
        timestamp: new Date(),
      };

      // Add assistant response to conversation history
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error("Error retrying message:", error);
      const { message, type } = categorizeError(error);
      setError(message);
      setErrorType(type);
    } finally {
      setIsLoading(false);
    }
  };

  const dismissError = () => {
    setError(null);
  };

  const dismissTopicSuggestion = () => {
    setTopicSuggestion(null);
  };

  // Enhanced typing indicator component with improved animation
  const TypingIndicator: React.FC = () => (
    <div className="flex justify-start mb-4 sm:mb-6 animate-fade-in">
      <div className="bg-white text-slate-800 shadow-lg border border-slate-200 rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg transition-all duration-300 hover:shadow-xl">
        <div className="flex space-x-1.5">
          <div
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: "0ms", animationDuration: "1s" }}
          ></div>
          <div
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: "300ms", animationDuration: "1s" }}
          ></div>
          <div
            className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse"
            style={{ animationDelay: "600ms", animationDuration: "1s" }}
          ></div>
        </div>
        <span className="text-slate-700 text-xs sm:text-sm font-medium ml-1">
          Assistant is typing...
        </span>
      </div>
    </div>
  );

  const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === "user";
    const [isVisible, setIsVisible] = useState(false);

    // Animation effect for message appearance
    useEffect(() => {
      // Small delay for staggered animation effect
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 50);

      return () => clearTimeout(timer);
    }, []);

    // Custom components for ReactMarkdown
    const markdownComponents = {
      // Code blocks with syntax highlighting
      code: ({ node, inline, className, children, ...props }: any) => {
        const match = /language-(\w+)/.exec(className || "");
        const language = match ? match[1] : "";

        return !inline && match ? (
          <div className="my-3 animate-fade-in">
            <SyntaxHighlighter
              style={tomorrow}
              language={language}
              PreTag="div"
              className="rounded-md text-sm shadow-sm"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          </div>
        ) : (
          <code
            className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      },

      // Links - make them clickable and visually distinct
      a: ({ href, children, ...props }: any) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
          {...props}
        >
          {children}
        </a>
      ),

      // Paragraphs with proper spacing
      p: ({ children, ...props }: any) => (
        <p className="mb-2 last:mb-0 leading-relaxed" {...props}>
          {children}
        </p>
      ),

      // Lists with proper styling
      ul: ({ children, ...props }: any) => (
        <ul className="list-disc list-inside mb-2 space-y-1" {...props}>
          {children}
        </ul>
      ),

      ol: ({ children, ...props }: any) => (
        <ol className="list-decimal list-inside mb-2 space-y-1" {...props}>
          {children}
        </ol>
      ),

      li: ({ children, ...props }: any) => (
        <li className="leading-relaxed" {...props}>
          {children}
        </li>
      ),

      // Headers with appropriate sizing
      h1: ({ children, ...props }: any) => (
        <h1 className="text-lg font-bold mb-2 mt-3 first:mt-0" {...props}>
          {children}
        </h1>
      ),

      h2: ({ children, ...props }: any) => (
        <h2 className="text-base font-bold mb-2 mt-3 first:mt-0" {...props}>
          {children}
        </h2>
      ),

      h3: ({ children, ...props }: any) => (
        <h3 className="text-sm font-bold mb-2 mt-2 first:mt-0" {...props}>
          {children}
        </h3>
      ),

      // Blockquotes
      blockquote: ({ children, ...props }: any) => (
        <blockquote
          className="border-l-4 border-slate-300 pl-4 my-2 italic text-slate-600"
          {...props}
        >
          {children}
        </blockquote>
      ),

      // Strong/bold text
      strong: ({ children, ...props }: any) => (
        <strong className="font-semibold" {...props}>
          {children}
        </strong>
      ),

      // Emphasis/italic text
      em: ({ children, ...props }: any) => (
        <em className="italic" {...props}>
          {children}
        </em>
      ),
    };

    return (
      <div
        className={`flex ${
          isUser ? "justify-end" : "justify-start"
        } mb-4 sm:mb-6 ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
        style={{
          transitionDuration: "400ms",
          transitionProperty: "opacity, transform",
        }}
      >
        <div
          className={`message-bubble w-full max-w-[85%] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg px-3 sm:px-4 py-2 sm:py-3 rounded-2xl transition-all duration-300 hover:shadow-lg ${
            isUser
              ? "bg-blue-600 text-white rounded-br-md hover:bg-blue-700"
              : "bg-white text-slate-800 shadow-lg border border-slate-200 rounded-bl-md hover:shadow-xl"
          }`}
        >
          <div className="text-sm sm:text-sm leading-relaxed">
            {isUser ? (
              // User messages - render as plain text with proper wrapping
              <div className="whitespace-pre-wrap break-words">
                {message.content}
              </div>
            ) : (
              // Assistant messages - render with markdown support
              <div className="prose prose-sm max-w-none prose-slate">
                <ReactMarkdown components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <div
            className={`text-xs mt-1 sm:mt-2 ${
              isUser ? "text-blue-100" : "text-slate-500"
            }`}
          >
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Inline Error Component with animations
  const InlineError: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (error) {
        setIsVisible(true);
      }
    }, [error]);

    if (!error) return null;

    const getErrorIcon = () => {
      switch (errorType) {
        case "network":
          return (
            <AlertTriangle
              className="h-5 w-5 text-red-500 animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          );
        case "api":
          return (
            <AlertTriangle
              className="h-5 w-5 text-orange-500 animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          );
        case "validation":
          return (
            <AlertTriangle
              className="h-5 w-5 text-yellow-500 animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          );
        default:
          return (
            <AlertTriangle
              className="h-5 w-5 text-red-500 animate-pulse"
              style={{ animationDuration: "2s" }}
            />
          );
      }
    };

    const getErrorBgColor = () => {
      switch (errorType) {
        case "network":
          return "bg-red-50 border-red-200";
        case "api":
          return "bg-orange-50 border-orange-200";
        case "validation":
          return "bg-yellow-50 border-yellow-200";
        default:
          return "bg-red-50 border-red-200";
      }
    };

    const getErrorTextColor = () => {
      switch (errorType) {
        case "network":
          return "text-red-800";
        case "api":
          return "text-orange-800";
        case "validation":
          return "text-yellow-800";
        default:
          return "text-red-800";
      }
    };

    return (
      <div
        className={`mx-3 sm:mx-4 mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border shadow-sm 
          ${getErrorBgColor()} ${isVisible ? "animate-fade-in" : "opacity-0"} 
          transition-all duration-300`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 mt-0.5">{getErrorIcon()}</div>
          <div className="flex-1 min-w-0">
            <p
              className={`text-xs sm:text-sm font-medium ${getErrorTextColor()} break-words`}
            >
              {error}
            </p>
          </div>
          <div className="flex gap-1 sm:gap-2 flex-shrink-0">
            {errorType !== "validation" && (
              <button
                onClick={handleRetry}
                disabled={isLoading}
                className="flex items-center gap-1 px-2 sm:px-3 py-1 text-xs font-medium 
                  text-blue-600 hover:text-blue-800 active:text-blue-900 
                  hover:bg-blue-50 active:bg-blue-100 rounded transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
                  btn-transition touch-manipulation"
                aria-label="Retry request"
              >
                <RefreshCw
                  className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Retry</span>
              </button>
            )}
            <button
              onClick={dismissError}
              className="text-gray-400 hover:text-gray-600 active:text-gray-700 
                hover:bg-gray-100 active:bg-gray-200 rounded-full p-1 
                transition-colors duration-200 btn-transition touch-manipulation"
              aria-label="Dismiss error"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Topic Suggestion Component with animations
  const TopicSuggestion: React.FC = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
      if (topicSuggestion) {
        setIsVisible(true);
      }
    }, [topicSuggestion]);

    if (!topicSuggestion) return null;

    return (
      <div
        className={`mx-3 sm:mx-4 mb-3 sm:mb-4 p-3 sm:p-4 rounded-lg border 
          bg-blue-50 border-blue-200 shadow-sm 
          ${isVisible ? "animate-fade-in" : "opacity-0"} 
          transition-all duration-300`}
      >
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Info
              className="h-5 w-5 text-blue-600 animate-pulse"
              style={{ animationDuration: "3s" }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-blue-800 break-words mb-1">
              GCP Focus Suggestion
            </p>
            <p className="text-xs sm:text-sm text-blue-700 break-words">
              {topicSuggestion}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={dismissTopicSuggestion}
              className="text-blue-400 hover:text-blue-600 active:text-blue-700 
                hover:bg-blue-100 active:bg-blue-200 rounded-full p-1 
                transition-colors duration-200 btn-transition touch-manipulation"
              aria-label="Dismiss suggestion"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col px-4 sm:px-6 lg:px-8">
      {/* Header - Enhanced with animations and visual polish */}
      <div
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-4 sm:mb-6 p-4 sm:p-6 border border-slate-100 dark:border-gray-700 
        transition-all duration-300 hover:shadow-xl animate-fade-in"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-1">
              GCP Chat Assistant
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-gray-300">
              Ask me anything about Google Cloud Platform services and
              certification topics!
            </p>
          </div>
        </div>
      </div>

      {/* Chat Container - Full height on mobile */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col overflow-hidden min-h-0">
        {/* Messages Area - Optimized padding for mobile */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-slate-50 dark:bg-gray-900 chat-messages">
          {messages.length === 0 ? (
            <div className="text-center text-slate-500 mt-4 sm:mt-8 px-4 animate-fade-in">
              <div className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-4 sm:mb-6 border border-slate-200 transition-all duration-300 hover:shadow-lg">
                <p className="text-base sm:text-lg mb-3 font-medium text-blue-600">
                  Welcome to your GCP Chat Assistant!
                </p>
                <p className="text-sm sm:text-base mb-4 text-slate-600">
                  Start by asking a question about Google Cloud Platform
                  services.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-left">
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                    <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">
                      Example questions:
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600">
                      What is Cloud Storage?
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600">
                      How do I set up a VPC?
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 hover:shadow-md transition-all duration-200">
                    <p className="text-xs sm:text-sm font-medium text-blue-700 mb-1">
                      Certification help:
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600">
                      GCP Associate Cloud Engineer tips
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600">
                      Professional Cloud Architect exam
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isLoading && <TypingIndicator />}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        <InlineError />

        {/* Topic Suggestion Display */}
        <TopicSuggestion />

        {/* Input Area - Mobile-optimized layout with enhanced animations */}
        <div className="border-t border-slate-200 dark:border-gray-700 p-3 sm:p-4 bg-white dark:bg-gray-800">
          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              placeholder="Ask about GCP services..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-slate-300 dark:border-gray-600 rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                transition-all duration-200 shadow-sm hover:shadow-md focus:shadow-md resize-none
                bg-white dark:bg-gray-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-400"
              disabled={isLoading}
              autoComplete="off"
              autoCapitalize="sentences"
              autoCorrect="on"
              spellCheck="true"
            />
            <button
              type="submit"
              disabled={!currentMessage.trim() || isLoading}
              className="bg-blue-600 dark:bg-blue-500 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg 
                hover:bg-blue-700 dark:hover:bg-blue-600 active:bg-blue-800 dark:active:bg-blue-700 
                transition-all duration-200 
                disabled:bg-slate-300 dark:disabled:bg-gray-600 disabled:cursor-not-allowed 
                flex items-center gap-1 sm:gap-2 touch-manipulation
                btn-transition shadow-sm hover:shadow-md
                transform hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Send message"
            >
              <Send
                className={`h-4 w-4 sm:h-5 sm:w-5 ${
                  isLoading ? "animate-pulse" : ""
                }`}
              />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
