# IskoChatAI

Your intelligent scholarship companion for upcoming college students in the Philippines. 🇵🇭

This chat application uses Google’s Gemini API, Supabase-powered RAG, and Google Docs as a flexible knowledge base to provide up-to-date scholarship information in Taglish.

---

## 🚀 Demo

➡️ [Live Demo on Vercel](https://scholarship-helper.vercel.app/)

---

## ✨ Features

- 🗣️ **Taglish-friendly** responses: Natural mix of Tagalog & English for Filipino students.
- 🔎 **Retrieval-Augmented Generation (RAG)**:
  - Integrated **vector search** using Supabase pgvector and in-memory store with multilingual embeddings for fast, semantically accurate retrieval of scholarship and university dat
- 🌐 **Web Search Integration**: Custom Search JSON API to fetch the latest scholarship announcements.
- 📋 **Profile Matching**: Personalize recommendations from user profiles stored in Supabase.

---

## 🧑‍💻 Tech Stack

| Layer                 | Technology                                                    |
| --------------------- | ------------------------------------------------------------- |
| **Frontend**          | Next.js, TypeScript                                           |
| **API / Backend**     | Next.js API Routes (Route Handlers)                           |
| **Database**          | Supabase (Postgres + pgvector)                                |
| **Knowledge Base**    | Google Docs via Google Docs API, fallback static data         |
| **Embeddings**        | Multilingual model (`paraphrase-multilingual-MiniLM-L12-v2`)  |
| **AI Model**          | Google Gemini API (gemini-2.0-flash)                          |
| **Search Engine**     | Google Custom Search JSON API                                 |
| **Auth & Profiles**   | Supabase Auth + Profiles table                                |

---

## 🛠️ Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/DavidBatoDev/iskochatai.git
cd iskochatai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` at the project root with the following:

```env
# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key

# Google Custom Search
GOOGLE_API_KEY=your_google_api_key
GSE_API_KEY=your_search_engine_id

# Supabase (Service Role Key required for pgvector write)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Docs Loader (for RAG)
SCHOLARSHIP_DOC_IDS=docId1,docId2,...
GOOGLE_CLIENT_EMAIL=service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# HuggingFace Inference (for multilingual embeddings)
HUGGINGFACE_API_KEY=your_hf_api_token
```

> **⚠️ Security**: Do **NOT** commit `.env.local` to version control.

### 4. Initialize Supabase

1. **Enable pgvector** extension in your Supabase SQL editor:

   ```sql
   create extension if not exists vector;
   ```

2. **Create `profiles` table** (if not existing):

   ```sql
   create table if not exists profiles (
     id uuid primary key,
     username text,
     email text,
     region text,
     school_name text,
     course text,
     grade_level text,
     program_interest text,
     scholarship_interest text,
     family_income numeric,
     academic_gwa numeric,
     gender text
   );
   ```

3. **(Optional) Create `chat_history` table** for conversation logs.

### 5. Run in development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to test the chatbot.

### 6. Build for production

```bash
npm run build
npm run start
```

---

## 📂 Project Structure

```
/ (root)
├─ app/               # Next.js App Router (Pages and API Routes)
│  ├─ api/
│  │  └─ gemini/      # Main API route for Gemini + RAG + search
│  └─ (page folders)  # Route segments for UI pages
├─ lib/
│  └─ rag/
│     ├─ scholarshipRAG.ts     # RAG loader & query logic
│     └─ googleDocsLoader.ts   # Utility to sync Google Docs
├─ public/            # Static assets
├─ .env.local
└─ README.md          # This file
```

---

## 📖 How It Works

1. **Incoming request** to `/api/gemini` with user message & flags.
2. **Authenticate** via Supabase Auth header or custom X-User-ID.
3. **Fetch profile** & **chat history** from Supabase.
4. **Decide**: Use Web Search? Use RAG? Or fallback local response.
5. **Build `systemContext`** combining profileContext, ragContext, searchContext.
6. **Call Gemini API** with Taglish instructions & context.
7. **Return** chatbot reply along with any reference URLs.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a PR for:

- New scholarship data sources
- Improvements to chunking & embeddings
- Better error handling & logging

---

## 📜 License

This project is MIT licensed.
