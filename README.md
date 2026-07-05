# Account Intelligence

Fresh, sourced account news for sellers — powered by the [Tavily](https://tavily.com) Research API.

A B2B seller has a book of enterprise accounts. **Account Intelligence** keeps them informed with fresh, cited news on each one. Open the app on your account book, hit **Research all**, and watch a per-account summary plus the last ~90 days of sourced, actionable news stream in — every item tagged **Actionable** or **Context**, with a suggested seller action where it matters.

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
pip install -e .            # installs deps from pyproject.toml (or: uv sync)
python -m backend.app
```

> Prefer [uv](https://docs.astral.sh/uv/)? Just run `uv run backend/app.py` — no manual venv needed.

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
2. You land on your **account book** — a CRM-style list seeded with ~9 enterprise accounts. Add any company on the fly with the **Add an account** input.
3. Click **Research all** to research every account concurrently (capped at 3 at a time), or click a single account to research just that one.
4. Watch each row update live: **Not researched → Researching → Done**, with a badge showing how many **actionable** signals were found.
5. Click into any account for the detail view:
   - **Account Summary** — a short, current snapshot: what the company does, size/revenue ballpark, parent/subsidiaries, headquarters, and strategic direction.
   - **Recent News** — the last ~90 days (earnings, M&A, funding, leadership changes, layoffs/restructuring, product/strategy, regulatory/legal, security incidents). Actionable signals are surfaced above context items, newest first.
   - Every news item shows a **date**, **one-line headline**, a **source citation with URL**, and an **Actionable / Context** tag. Actionable items include a one-line **suggested seller action**.
   - Hit **Refresh** to re-run research for that account.

Freshness and sourcing are the whole point — every claim is cited with a URL and dated where possible.

## Seeding accounts

The default account book lives in `ui/src/accounts.ts` as a simple editable array. Add, remove, or edit entries there (name, industry, HQ, domain) to change the seed list. Users can also add accounts at runtime from the UI.

## Project Structure

```
├── .env.sample                     # Environment variable template
├── pyproject.toml                  # Python project config
├── backend/
│   ├── app.py                      # FastAPI entry point (/api/account/stream)
│   ├── models.py                   # Pydantic request/response models
│   ├── research_tasks.py           # The 2 research configs: account_summary + recent_news
│   └── streaming/
│       ├── event_handler.py        # Processes Tavily stream events
│       ├── stream_orchestrator.py  # Parallel research orchestration (fan-out)
│       └── tavily_stream.py        # Tavily API streaming client
└── ui/
    ├── package.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── src/
        ├── main.tsx                # React entry point
        ├── App.tsx                 # State, streaming, concurrency-capped "Research all"
        ├── accounts.ts             # Seed account book (editable)
        ├── types.ts                # TypeScript type definitions
        └── components/
            ├── Header.tsx
            ├── AccountList.tsx         # Landing: CRM-style account book
            ├── AccountRow.tsx          # One account row (status + actionable badge)
            ├── AccountDetail.tsx       # Summary + news feed
            ├── AccountSummaryCard.tsx
            ├── NewsFeed.tsx            # Actionable-first, newest-first sorting
            ├── NewsItemCard.tsx        # Date, headline, source, actionable tag, action
            ├── AccountLogo.tsx         # Company logo with monogram fallback
            ├── LiveProgress.tsx        # Live streaming activity
            ├── FormattedText.tsx
            └── SourcesList.tsx
```

## Environment Variables

| Variable         | Required | Description                                                             |
| ---------------- | -------- | ----------------------------------------------------------------------- |
| `TAVILY_API_KEY` | Yes      | Your Tavily API key. Can also be passed via the `Authorization` header. |

## API

### `POST /api/account/stream`

Streams account research results as Server-Sent Events (SSE).

**Request body:**

```json
{
  "account_name": "ServiceNow",
  "industry": "Enterprise Software — IT Service Management",
  "context": "optional extra context"
}
```

**Response:** `text/event-stream` — a merged stream of two parallel research tasks
(`account_summary` and `recent_news`), emitting `start`, `progress`,
`sources_found`, `category_complete`, `error`, and `complete` events.
