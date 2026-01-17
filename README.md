# NetPulse: Event Horizon

[中文](./README_zh.md)

---

## 🌍 Introduction

**NetPulse** is an intelligent internet event analyzer powered by search grounding. It transforms scattered web information into structured insights, providing real-time summaries, core impact analysis, and historical context comparisons for major tech and internet events.

<p align="center">
<img src="https://img.0rzz.ggff.net/netpulse-eng.png?v=3" alt="NetPulse 界面预览" width="100%">
</p>


**Architecture Upgrade**: NetPulse now uses a **Backend-for-Frontend (BFF)** architecture powered by **Cloudflare Workers**. All API calls (Tavily Search & Gemini Analysis) are executed securely on the server-side, ensuring your API keys are never exposed to the client.

## ✨ Key Features

- **Bilingual Support**: Full internationalization (i18n) with Chinese and English interfaces, including language-aware API responses.
- **Search Grounding**: Utilizes **Tavily API** to fetch real-time, accurate context from the web, reducing hallucinations.
- **Dual Analysis Modes**: 
  - **Quick Mode** (~15s): Fast scanning with Gemini 3.0 Flash
  - **Deep Mode** (~60s): Comprehensive analysis with Gemini 3.0 Pro
- **Custom API Keys**: Advanced users can configure their own API keys for search (Tavily/Exa) and LLM services (Gemini/DeepSeek/OpenAI/Claude or custom endpoints).
- **Historical Echoes**: Unique feature that compares current events with historical precedents to find patterns.
- **Share Analysis**: Generate short links to share analysis results with others. Data stored in Cloudflare KV with 30-day expiration.
- **Secure Architecture**: API Keys are stored in Cloudflare Worker Secrets. The frontend only communicates with your own backend (`/api/analyze`).
- **Responsive UI**: A modern, glassmorphism-inspired interface built with **Tailwind CSS**, optimized for mobile and desktop.
- **Dynamic Trending Topics**: Real-time trending topics fetched and cached by language.

## 🛠 Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, TypeScript, Vite, i18next |
| **Backend** | Cloudflare Workers (JavaScript) |
| **Styling** | Tailwind CSS, Lucide React (Icons) |
| **AI Model** | Google Gemini 3.0 Pro / Gemini 3.0 Flash |
| **Search** | Tavily AI Search API |
| **Storage** | Cloudflare KV (for share links) |

## 📁 Project Structure

```
NetPulse/
├── App.tsx                 # Main application component
├── i18n.ts                 # i18next configuration
├── locales/
│   ├── zh/translation.json # Chinese translations
│   └── en/translation.json # English translations
├── components/
│   ├── Header.tsx          # Header with language switcher
│   ├── SearchBar.tsx       # Search interface with trending topics
│   ├── ResultView.tsx      # Analysis result display
│   ├── ShareButton.tsx     # Share button component
│   ├── ShareModal.tsx      # Share configuration modal
│   ├── SharedView.tsx      # Shared analysis view page
│   ├── SettingsPanel.tsx   # Custom API keys settings panel
│   ├── LanguageSwitcher.tsx# Responsive language toggle
│   ├── PrivacyPolicy.tsx   # Privacy policy page
│   └── TermsOfService.tsx  # Terms of service page
├── utils/
│   ├── shareUtils.ts       # Share link encoding/decoding utilities
│   └── apiConfigStore.ts   # API configuration storage
├── services/
│   ├── geminiService.ts    # API service layer
│   └── directApiService.ts # Direct API calls for custom keys
├── types/
│   └── apiConfig.ts        # API configuration types
└── backend/
    └── worker-i18n-v2.js   # Cloudflare Worker backend (latest)
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+) or Bun
- A **Tavily API Key** (for search)
- A **Gemini API Key** (or a proxy key supporting OpenAI format)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EmmaStoneX/NetPulse.git
   cd NetPulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Local Development**
   ```bash
   npm run dev
   ```

## 📦 Deployment

This project uses a unified deployment approach via **Cloudflare Workers with Static Assets**. Both frontend and backend are deployed together.

### Automated Deployment

1. Connect your GitHub repository to Cloudflare Workers & Pages
2. Push to the `main` branch to trigger automatic build and deployment
3. Cloudflare will build the frontend (`npm run build`) and deploy it along with the Worker backend

### Environment Variables

Add the following secrets in Cloudflare Worker settings (**Settings** → **Variables and Secrets**):
- `GEMINI_API_KEY`: Your Gemini/OpenAI-proxy API Key
- `TAVILY_API_KEY`: Your Tavily API Key

### KV Namespace (for Share Links)

1. Create a KV namespace named `SHARE_DATA` in Cloudflare Dashboard (**Storage & Databases** → **KV**)
2. The binding is already configured in `wrangler.json` - just update the `id` with your KV namespace ID

## 🌐 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analyze` | POST | Analyze a query with search grounding |
| `/api/trending` | GET | Get trending topics (supports `?lang=zh` or `?lang=en`) |
| `/api/share` | POST | Create a share link (stores data in KV) |
| `/api/share/:id` | GET | Retrieve shared analysis data by ID |


## 📧 Contact

- Legal inquiries: legal@zxvmax.site
- Privacy concerns: privacy@zxvmax.site
