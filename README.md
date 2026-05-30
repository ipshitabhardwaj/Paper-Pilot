<div align="center">

<h1>🧭 PaperPilot</h1>

<p><strong>AI-powered research paper analysis engine — upload any paper or paste an arXiv ID and get a full scholarly breakdown in seconds.</strong></p>

<p>
  <img src="https://img.shields.io/badge/Gemini-3.5%20Flash-4285F4?style=flat-square&logo=google&logoColor=white" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat-square&logo=vercel&logoColor=white" />
</p>

<p>
  <a href="https://paperpilot.vercel.app"><strong>🚀 Live Demo</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a>
</p>

</div>

---

## What is PaperPilot?

PaperPilot is a full-stack AI web application that helps students, researchers, and engineers understand research papers faster. Instead of spending hours reading dense academic text, you get a structured, adversarial breakdown of any paper — including what the authors didn't say.

Upload a PDF or paste an arXiv ID. PaperPilot does the rest.

---

## Features

**Two input modes**
- Upload any research paper PDF (up to 35MB)
- Paste an arXiv URL or ID (`2301.07041`, `arxiv.org/abs/2301.07041`, or full URL)

**Full paper analysis via Gemini 3.5 Flash**
- Executive TL;DR (under 150 words)
- In-depth executive summary (3–5 paragraphs)
- Main scholarly contributions
- Methodology breakdown with novelty assessment
- Explicit and implicit assumptions audit
- Weaknesses and structural limitations
- Skeptical peer-reviewer questions
- Future research directions
- Layperson analogy explanation
- Confidence scoring (high / medium / low)

**Context-grounded chat**
- Ask questions directly about the paper
- Strictly refuses to answer anything not present in the paper text
- No hallucination, no external knowledge injection

**Related papers**
- Automatically searches arXiv for related work using extracted keywords
- One-click analysis of any related paper

**Export**
- Download full analysis as a formatted PDF (A4, print-ready)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | Express.js, Node.js |
| AI | Google Gemini 3.5 Flash (`@google/genai`) |
| PDF Parsing | pdfjs-dist (in-memory, no disk writes) |
| arXiv Integration | arXiv API + fast-xml-parser |
| PDF Export | html2pdf.js |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites
- Node.js 18+
- A Gemini API key from [Google AI Studio](https://aistudio.google.com)

### Local setup

```bash
git clone https://github.com/YOUR_USERNAME/paperpilot.git
cd paperpilot
npm install
```

Create a `.env` file in the root:

```env
GEMINI_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`

### Deploy to Vercel

1. Push repo to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set framework to **Vite**, build command `vite build`, output dir `dist`
4. Add `GEMINI_API_KEY` environment variable
5. Deploy

---

## Project Structure
paperpilot/
├── api/                    # Vercel serverless functions
│   ├── paper-upload.ts     # PDF upload + arXiv analysis endpoint
│   ├── arxiv-metadata.ts   # arXiv metadata pre-fetch
│   └── chat.ts             # Context-grounded Q&A endpoint
├── src/
│   ├── components/         # React UI components
│   │   ├── AnalysisTabs.tsx
│   │   ├── DownloadButton.tsx
│   │   ├── InteractiveChat.tsx
│   │   ├── LandingHero.tsx
│   │   ├── RelatedPapers.tsx
│   │   └── SidebarInfo.tsx
│   └── lib/
│       ├── gemini.ts       # Gemini API integration + structured schema
│       ├── arxiv.ts        # arXiv paper fetching
│       └── arxiv-search.ts # Related papers search
├── server.ts               # Express dev server
└── vercel.json             # Vercel routing config

---

## How It Works

1. User uploads a PDF or enters an arXiv ID
2. PDF text is extracted in-memory using pdfjs-dist
3. Extracted text is sent to Gemini 3.5 Flash with a structured JSON schema prompt
4. Gemini returns a fully typed analysis object
5. arXiv API is queried for related papers using extracted keywords
6. User can chat with the paper — all answers are strictly grounded in extracted text

---

## Sample Analysis

> **Paper:** Verifiable Fully Homomorphic Encryption (arXiv:2301.07041)
>
> **TL;DR:** This paper establishes the first holistic framework for maliciously-secure Verifiable FHE, mitigating severe key-recovery attacks enabled by FHE's inherent malleability...
>
> **Confidence:** High
>
> **Reviewer Question:** How does the proposed delay-and-reduce optimization handle edge cases where the ZKP field size is insufficient to accumulate the required number of RNS splits without overflow?

---

## Built By

**Ipshita Bhardwaj** — 2nd year BTech, Robotics & AI

---

<div align="center">
<sub>Not affiliated with arXiv or Google</sub>
</div>