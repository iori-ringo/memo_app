# Implementation Plan - Phase 2: Polish & AI

## Goal
Enhance the "Magic Memo" notebook application with physical-like interactions, dark mode support, and AI-powered assistance.

## User Review Required
> [!IMPORTANT]
> **AI Features Requirement**: The AI features will require a Google Gemini API Key. You will need to obtain one from [Google AI Studio](https://aistudio.google.com/) and add it to a `.env.local` file as `GEMINI_API_KEY`.

## Proposed Changes

### 1. Dark Mode Support
- **Dependencies**: Install `next-themes`.
- **Components**:
    - [NEW] `components/theme-provider.tsx`: Wrapper for next-themes.
    - [NEW] `components/mode-toggle.tsx`: UI to switch between Light/Dark/System.
- **Integration**:
    - Update `app/layout.tsx` to wrap content in `ThemeProvider`.
    - Place `ModeToggle` in `components/sidebar/app-sidebar.tsx` or a new header area.

### 2. Page Transition & Animations
- **Library**: Use `framer-motion` (already installed).
- **Logic**:
    - Implement a "Book Flip" or "Slide" animation when switching pages.
    - Add swipe gestures (left/right) to navigate pages.
    - Display dynamic page numbers (e.g., "Page 3 / 10").
- **Files**:
    - Modify `app/page.tsx` to handle navigation state and animation direction.
    - Modify `components/notebook/notebook-spread.tsx` to accept animation props and handle gestures.

### 3. AI Assist Features
- **Service**: **Google Gemini API** (Recommended)
    - **Cost**: Free of charge (Free Tier available).
    - **Requirement**: API Key (easy to get).
- **Fallback**: **Mock AI** (Built-in)
    - If no API key is set, the app will simulate AI responses with predefined text. This allows you to test the UI without registering.
- **Dependencies**: Install `@google/generative-ai`.
- **Backend**:
    - [NEW] `app/actions.ts`: Server Actions to communicate with Gemini API.
        - Check for API key; if missing, return mock data.
        - `generateAbstraction(fact: string)`
        - `generateDiversion(abstraction: string)`
        - `generateSummary(content: string)`
- **UI**:
    - Modify `components/notebook/notebook-spread.tsx`:
        - Add "AI Assist" buttons (Sparkles icon) to Fact, Abstraction, and Summary sections.
        - Implement loading states and error handling.
        - Stream or display the AI response.

## Verification Plan

### Automated Tests
- None for UI interactions, but will verify build succeeds.

### Manual Verification
1. **Dark Mode**: Toggle themes and verify colors change correctly (bg, text, borders).
2. **Animations**:
    - Click page links -> Verify smooth transition.
    - Swipe on notebook -> Verify page change.
3. **AI Features**:
    - Set dummy API key (or real one if available).
    - Click AI buttons -> Verify request is sent and response (or error) is displayed.
