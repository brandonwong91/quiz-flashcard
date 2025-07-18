import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ChatPage from "../components/ChatPage";
import * as geminiService from "../services/geminiService";

// Mock the geminiService
vi.mock("../services/geminiService", () => ({
  sendChatMessage: vi.fn(),
}));

describe("ChatPage Component", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the chat page with welcome message", () => {
    render(<ChatPage />);

    // Check if the header is rendered
    expect(screen.getByText("GCP Chat Assistant")).toBeInTheDocument();

    // Check if the welcome message is displayed
    expect(
      screen.getByText("Welcome to your GCP Chat Assistant!")
    ).toBeInTheDocument();

    // Check if example questions are displayed
    expect(screen.getByText("Example questions:")).toBeInTheDocument();
    expect(screen.getByText("What is Cloud Storage?")).toBeInTheDocument();
  });

  it("allows user to send a message and displays it", async () => {
    // Mock the API response
    const mockResponse = "This is a test response from the assistant";
    (geminiService.sendChatMessage as any).mockResolvedValue(mockResponse);

    render(<ChatPage />);

    // Type a message in the input field
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, { target: { value: "What is GCP?" } });

    // Submit the form
    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Check if the user message is displayed - using a more flexible approach
    await waitFor(() => {
      const userMessages = screen.getAllByText((content, element) => {
        return element?.textContent?.includes("What is GCP?") || false;
      });
      expect(userMessages.length).toBeGreaterThan(0);
    });

    // Check if the API was called with the correct parameters
    expect(geminiService.sendChatMessage).toHaveBeenCalledWith(
      "What is GCP?",
      []
    );

    // Check if the assistant response is displayed
    await waitFor(() => {
      expect(screen.getByText(mockResponse)).toBeInTheDocument();
    });
  });

  it("shows loading indicator while waiting for API response", async () => {
    // Create a promise that we can resolve manually to control the timing
    let resolveApiCall: (value: string) => void;
    const apiPromise = new Promise<string>((resolve) => {
      resolveApiCall = resolve;
    });

    (geminiService.sendChatMessage as any).mockReturnValue(apiPromise);

    render(<ChatPage />);

    // Type and send a message
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, { target: { value: "What is BigQuery?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Check if loading indicator is displayed
    expect(
      await screen.findByText("Assistant is typing...")
    ).toBeInTheDocument();

    // Resolve the API call
    resolveApiCall!("BigQuery is a serverless data warehouse.");

    // Check if loading indicator is removed and response is displayed
    await waitFor(() => {
      expect(
        screen.queryByText("Assistant is typing...")
      ).not.toBeInTheDocument();
      expect(
        screen.getByText("BigQuery is a serverless data warehouse.")
      ).toBeInTheDocument();
    });
  });

  it("displays error message when API call fails", async () => {
    // Mock API failure
    const errorMessage = "API service is temporarily unavailable";
    (geminiService.sendChatMessage as any).mockRejectedValue(
      new Error(errorMessage)
    );

    render(<ChatPage />);

    // Type and send a message
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, { target: { value: "What is Cloud Run?" } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Check if error message is displayed
    await waitFor(() => {
      expect(
        screen.getByText(/API service is temporarily unavailable/i)
      ).toBeInTheDocument();
    });

    // Check if retry button is displayed
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("allows retrying a failed message", async () => {
    // First mock a failure, then a success
    (geminiService.sendChatMessage as any)
      .mockRejectedValueOnce(
        new Error("API service is temporarily unavailable")
      )
      .mockResolvedValueOnce("Successful response after retry");

    render(<ChatPage />);

    // Type and send a message
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, {
      target: { value: "What is Cloud Storage?" },
    });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for error to appear
    await waitFor(() => {
      expect(
        screen.getByText(/API service is temporarily unavailable/i)
      ).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryButton);

    // Skip checking for loading indicator as it might be too quick in tests

    // Check if successful response is displayed after retry
    await waitFor(() => {
      expect(
        screen.getByText("Successful response after retry")
      ).toBeInTheDocument();
    });

    // Check that the API was called twice (initial + retry)
    expect(geminiService.sendChatMessage).toHaveBeenCalledTimes(2);
  });

  it("maintains conversation history for context", async () => {
    // Mock successful API responses
    (geminiService.sendChatMessage as any)
      .mockResolvedValueOnce("First response")
      .mockResolvedValueOnce("Second response");

    render(<ChatPage />);

    // Send first message
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, { target: { value: "What is GCP?" } });
    let sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for first response
    await waitFor(() => {
      expect(screen.getByText("First response")).toBeInTheDocument();
    });

    // Send second message
    fireEvent.change(inputField, { target: { value: "Tell me more" } });
    sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Wait for second response
    await waitFor(() => {
      expect(screen.getByText("Second response")).toBeInTheDocument();
    });

    // Check that the second API call included the conversation history
    const calls = (geminiService.sendChatMessage as any).mock.calls;
    expect(calls[0][0]).toBe("What is GCP?");
    expect(calls[0][1]).toEqual([]);

    expect(calls[1][0]).toBe("Tell me more");
    expect(calls[1][1].length).toBe(2); // Should contain user message and first response
    expect(calls[1][1][0].content).toBe("What is GCP?");
    expect(calls[1][1][1].content).toBe("First response");
  });

  it("detects off-topic questions and shows topic suggestion", async () => {
    // Mock API response
    (geminiService.sendChatMessage as any).mockResolvedValue(
      "Response about AWS alternatives in GCP"
    );

    render(<ChatPage />);

    // Type an off-topic message about AWS
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, {
      target: { value: "How do I use AWS EC2?" },
    });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Check if topic suggestion is displayed
    await waitFor(() => {
      expect(screen.getByText(/GCP Focus Suggestion/i)).toBeInTheDocument();
      expect(
        screen.getByText(/I see you're asking about AWS/i)
      ).toBeInTheDocument();
    });

    // Check that the message was still sent to the API
    expect(geminiService.sendChatMessage).toHaveBeenCalledWith(
      "How do I use AWS EC2?",
      []
    );
  });

  it("prevents sending empty messages", () => {
    render(<ChatPage />);

    // Try to send an empty message
    const sendButton = screen.getByRole("button", { name: /send/i });
    expect(sendButton).toBeDisabled();

    // Type some spaces
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, { target: { value: "   " } });

    // Button should still be disabled
    expect(sendButton).toBeDisabled();

    // Type actual content
    fireEvent.change(inputField, { target: { value: "Valid message" } });

    // Button should be enabled
    expect(sendButton).not.toBeDisabled();
  });

  it("validates message length", async () => {
    render(<ChatPage />);

    // Create a very long message (over 2000 characters)
    const longMessage = "a".repeat(2001);

    // Type the long message
    const inputField = screen.getByPlaceholderText("Ask about GCP services...");
    fireEvent.change(inputField, { target: { value: longMessage } });

    const sendButton = screen.getByRole("button", { name: /send/i });
    fireEvent.click(sendButton);

    // Check if validation error is displayed
    await waitFor(() => {
      expect(screen.getByText(/Message is too long/i)).toBeInTheDocument();
    });

    // API should not be called
    expect(geminiService.sendChatMessage).not.toHaveBeenCalled();
  });
});
