# Brand Intelligence Report

An AI-powered brand perception and reputation research tool built with [Tavily](https://tavily.com). Enter a brand name and get a comprehensive intelligence report streamed in real time — covering brand positioning, media coverage, public sentiment, analyst ratings, competitive landscape, and risk/opportunity analysis.

## Demo

[![Brand Intelligence Report Demo](https://img.youtube.com/vi/GIeaq-3D0gs/maxresdefault.jpg)](https://www.youtube.com/watch?v=GIeaq-3D0gs)

## Getting Started

### 1. Clone and configure environment

```bash
cp .env.sample .env
```

Open `.env` and set your Tavily API key:

```
TAVILY_API_KEY=tvly-your-key-here
```

### 2. Start the backend

```bash
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m backend.app
```

The API server starts at **http://localhost:8000**.

### 3. Start the frontend

In a separate terminal:

```bash
cd ui
npm install
npm run dev
```

The UI opens at **http://localhost:5173**.

## Usage

1. Open **http://localhost:5173** in your browser.
2. Enter a brand name (and optional additional context).
3. Results stream in across five research categories:
   - **Brand Overview** — positioning, tagline, parent company, key products, target audience, brand values
   - **Media & Press** — recent press coverage, journalist sentiment, PR crises, earned media highlights
   - **Public Perception** — review scores (G2, Glassdoor, Trustpilot), common praise, common complaints, social sentiment
   - **Analyst & Competitive** — Gartner/Forrester/IDC ratings, competitor comparison table, market share, awards
   - **Risks & Opportunities** — reputation threats with severity ratings, growth opportunities with potential impact

## Project Structure

```
├── .env.sample                  # Environment variable template
├── pyproject.toml               # Python project config
├── backend/
│   ├── app.py                   # FastAPI entry point
│   ├── models.py                # Pydantic request/response models
│   ├── research_tasks.py        # Research category configurations
│   └── streaming/
│       ├── event_handler.py     # Processes Tavily stream events
│       ├── stream_orchestrator.py  # Parallel research orchestration
│       └── tavily_stream.py     # Tavily API streaming client
└── ui/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx             # React entry point
        ├── App.tsx              # Main application component
        ├── types.ts             # TypeScript type definitions
        └── components/
            ├── Header.tsx
            ├── SearchForm.tsx
            ├── ProgressTracker.tsx
            ├── ResultsDashboard.tsx
            ├── CategoryCard.tsx
            ├── BrandOverview.tsx
            ├── MediaPress.tsx
            ├── PublicPerception.tsx
            ├── AnalystCompetitive.tsx
            ├── RisksOpportunities.tsx
            ├── FormattedText.tsx
            ├── InfoBlock.tsx
            └── SourcesList.tsx
```

## Environment Variables

| Variable         | Required | Description                                                                 |
| ---------------- | -------- | --------------------------------------------------------------------------- |
| `TAVILY_API_KEY` | Yes      | Your Tavily API key. Can also be passed via the `Authorization` header.     |

## API

### `POST /api/brand/stream`

Streams brand research results as Server-Sent Events (SSE).

**Request body:**

```json
{
  "brand_name": "Webex",
  "context": "unified communications platform by Cisco"
}
```

**Response:** `text/event-stream` with real-time research updates per category.
