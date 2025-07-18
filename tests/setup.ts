import "@testing-library/jest-dom";

// Mock the IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

window.IntersectionObserver = MockIntersectionObserver as any;

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Mock environment variables
process.env.API_KEY = "test-api-key";

// Mock the GoogleGenAI class
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: "This is a mock response from the Gemini API",
        }),
      },
    })),
    Type: {
      OBJECT: "object",
      STRING: "string",
      ARRAY: "array",
      INTEGER: "integer",
    },
  };
});
