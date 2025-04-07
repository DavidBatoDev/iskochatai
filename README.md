# 🎓 IskoChatAI

IskoChatAI is your intelligent scholarship companion built for upcoming college students in the Philippines. 🇵🇭

This chatbot, built using Google’s Gemini API and powerful search integrations, speaks native Filipino languages and guides students through every step of their scholarship journey—from finding programs to understanding deadlines, and even assessing which scholarships best suit their personal situation.

## ✨ Features

- 🗣️ **Converses in Filipino languages** – making it feel more natural and accessible for students across the Philippines.
- 📅 **Guides scholarship applications** – from requirements to deadlines.
- 🧠 **Smart profile matching** – assesses student profiles and recommends scholarships that match their qualifications.
- 🔍 **Web search capability** – searches the internet for the latest scholarship news, deadlines, and announcements using Google Custom Search API.
- 🤖 **Powered by Gemini AI** – intelligent and context-aware responses.
- ☁️ **Cloud-hosted** – reliable and scalable infrastructure using Google Cloud Platform (GCP).

## 🧑‍💻 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) + **TypeScript**
- **AI Model**: [Gemini API](https://ai.google.dev/)
- **Search Engine**: [Google Programmable Search Engine](https://programmablesearchengine.google.com/about/) + [Custom Search JSON API](https://developers.google.com/custom-search/v1/overview)
- **Infrastructure**: [Google Cloud Platform (GCP)](https://cloud.google.com/)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/DavidBatoDev/iskochatai.git
cd iskochatai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory of your project and add the following:

```env
# Gemini API Key from Google AI Studio
GEMINI_API_KEY=your_gemini_api_key

# Google Programmable Search Engine
GOOGLE_SEARCH_API_KEY=your_custom_search_api_key
GOOGLE_SEARCH_ENGINE_ID=your_programmable_search_engine_id
```

>  Important: Do not share your .env.local file or commit it to Git. It contains sensitive API keys.

### 4. Run the development server

```bash
npm run dev
```

Open `http://localhost:3000` in your browser to see the chatbot in action.


### 5. Build for production

To build the app for production:

```bash
npm run build
```

Then, you can start the production server:

```bash
npm run start
```