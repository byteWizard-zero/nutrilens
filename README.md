# 🥗 NutriLens: AI-Powered Smart Nutrition Companion

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-orange?style=for-the-badge&logo=google-gemini)](https://ai.google.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-blue?style=for-the-badge)](https://zustand-demo.pmnd.rs/)

> "Lens your plate, balance your health. AI-driven meal analysis, visual portion tracking, and context-aware nutrition coaching at your fingertips."

**NutriLens** is a next-generation Progressive Web App (PWA) designed to simplify calorie tracking and dietary habits. Built with Next.js 15 and the latest `@google/genai` SDK, it allows users to take a photo of their meal, instantly extract food details, estimate portions, log macro metrics, and consult an AI nutritionist assistant with real-time streaming answers.

---

## ✨ Key Features

* **📸 Instant Visual Meal Analysis:** Upload or capture an image of your plate. Gemini analyzes the food, estimates weights/serving sizes, assigns confidence scores, and populates macro estimates.
* **💬 Streaming Context-Aware AI Chat:** An interactive nutritionist chat interface powered by Server-Sent Events (SSE). The AI knows your daily stats, caloric target, meal log count, and goals (e.g., muscle gain, fat loss) and delivers tailored, punchy advice.
* **📊 Calorie Rings & Macro Analytics:** Beautiful glassmorphic circular trackers for target completions, combined with Recharts-based bar/line metrics detailing daily fats, carbs, and proteins.
* **📅 Calendar Heatmaps:** Visually track consistency levels over a calendar layout to see active logging streaks.
* **📏 Portion Fine-Tuning Slider:** Adjust estimated portions with a dynamic slider, instantly scaling all calorie and macro metrics proportionally.
* **📱 Progressive Web App (PWA):** Built mobile-first with service worker configurations for offline caching and launcher integrations.

---

## 🛠️ Tech Stack & Architecture

* **Framework:** Next.js 15 (App Router, Turbopack)
* **Styling & Motion:** Tailwind CSS & Motion (Framer Motion)
* **Generative Core:** Google GenAI SDK (`gemini-2.5-flash` for multi-modal analysis and streaming responses)
* **State Management:** Zustand (Offline local-storage synced partitions for user targets, meal logs, and chat history)
* **Data Visualization:** Recharts

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v20+)
* A Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

### Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/byteWizard-zero/nutrilens.git
   cd nutrilens
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   ```
