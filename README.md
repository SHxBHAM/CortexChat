# CortexChat

CortexChat is an AI-powered assistant that lets users interact with their own content — PDF documents or YouTube videos — through natural language. You upload a textbook, lecture notes, or a video, and CortexChat builds a searchable knowledge base from it. Then you can ask questions and get grounded, context-aware responses based strictly on what you've uploaded.

It’s a Retrieval-Augmented Generation (RAG) system that works with content you care about.

---

## Why This Exists

Reading through long PDFs, technical papers, or recorded lectures just to find one piece of information is frustrating and inefficient. General-purpose AI tools don't solve this — they either hallucinate answers or can’t access your actual content.

CortexChat is designed to let you ask real questions about your documents and videos — and get real answers, grounded in those materials.

This is useful for:

- Students studying from books or lecture slides
- Researchers parsing through academic papers
- Professionals reviewing internal documentation or reports
- Anyone trying to work faster with dense or complex content

---

## What It Does

- Upload multiple PDF files
- Paste multiple YouTube links (we automatically fetch and clean the transcripts)
- Ask natural language questions
- Receive answers based only on the content you've uploaded
- View the sources (document names, video timestamps) that were used to generate each answer

It’s a simple idea: make your materials conversational.

---

## How It Works (Technically)

CortexChat is built using a modular RAG (Retrieval-Augmented Generation) architecture, designed for adaptability. We’re currently using **Google's Gemini models** for both vector embedding and answer generation.

### Architecture Overview

- **Frontend**: Built with **Next.js App Router** for a smooth, modern experience. UI is dark-mode-first and inspired by Vercel/Linear.
- **Backend**: Server-side processing handled with Next.js server actions and APIs.
- **Document Processing**: Uploaded files and transcripts are chunked using token-aware logic (splitting by sentence, paragraph, etc.).
- **Embeddings**: Chunks are embedded via **Gemini’s embedding APIs**, creating high-dimensional vectors representing meaning.
- **Vector Store**: We’re using **PostgreSQL with pgvector** to store and search embeddings using cosine similarity.
- **LLM Responses**: Gemini generates final responses using top-k retrieved chunks as context. The system is designed to inject citations when possible.

---

## Retrieval Flow

1. A user uploads PDFs or video links.
2. The content is extracted and split into chunks.
3. Each chunk is embedded using Gemini and stored in pgvector.
4. When a user asks a question, that query is embedded as well.
5. A similarity search finds the most relevant chunks.
6. Those are passed to Gemini in a structured prompt.
7. Gemini generates a grounded, conversational answer.

The final result is a response you can trust — because you know where it came from.

---

## Current Progress

We're actively building the MVP. Key features in development:

- PDF and YouTube upload support
- Multi-source chunking and storage
- Fast semantic retrieval via pgvector
- Chat interface with streaming responses from Gemini
- Displaying source files or timestamps with answers

---

## Roadmap

Upcoming features include:

- Session persistence and chat history
- User accounts and document management
- Rate limiting / credit-based usage for free-tier control
- Ability to tag, group, or filter documents during retrieval
- Exporting Q&A sessions or summaries

Later down the line:

- Source highlighting in responses (highlight exact sentence used)
- "Explain like I'm 5" and "Summarize this" modes
- Quiz/question generation from content
- Collaboration tools (share a document, invite others to ask)

---

## Tech Stack

- **Frontend**: Next.js (App Router), TailwindCSS, shadcn/ui
- **Design Language**: Clean, minimal, dark-mode-first — inspired by Vercel, Linear, and Raycast
- **LLM & Embeddings**: Gemini AI
- **Vector Database**: Postgres + pgvector
- **Storage**: Local for MVP; planning optional cloud or edge-based document storage later
- **Auth**: Session-based (Anonymous first; optional login layer later)

---

## Contributions

We're building CortexChat to be a robust but flexible tool — and we're doing it in the open. If you're interested in retrieval systems, UI/UX for AI tools, embeddings, or building with Gemini, we’d love to have you involved.

Everything’s modular: the embedding stack, chunking logic, and UI components can be reused or swapped. Contributions, feedback, and testing are all welcome.

---

## License

TBD. The plan is to use a permissive open-source license (likely MIT) after the MVP is live and stable.