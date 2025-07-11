# GCP Developer Pro Prep

An AI-powered application to help users prepare for the GCP Cloud Professional Developer certification exam. Features an interactive quiz mode to test knowledge and a flashcard mode for quick study notes on key topics.

## Features

- **AI-Powered Quiz**: Test your GCP knowledge with dynamically generated questions
- **Flashcard Mode**: Quick study notes on key GCP topics
- **Interactive UI**: Clean, responsive interface built with React and TypeScript
- **Google Gemini Integration**: Powered by Google's Gemini AI for intelligent content generation

## Prerequisites

- Node.js (v16 or higher)
- Gemini API key from Google AI Studio

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure API key:**
   Set your `GEMINI_API_KEY` in [.env.local](.env.local)

   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Run the application:**

   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Tech Stack

- **Frontend**: React 19, TypeScript
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **AI Integration**: Google Gemini API
- **Icons**: Lucide React
- **Styling**: Tailwind CSS classes

## Project Structure

```
├── components/
│   ├── HomePage.tsx        # Landing page
│   ├── QuizPage.tsx        # Quiz interface
│   ├── FlashcardPage.tsx   # Flashcard study mode
│   ├── LoadingSpinner.tsx  # Loading component
│   └── ErrorDisplay.tsx    # Error handling
├── services/
│   └── geminiService.ts    # Gemini API integration
├── App.tsx                 # Main app component
├── types.ts               # TypeScript definitions
└── index.tsx              # App entry point
```
