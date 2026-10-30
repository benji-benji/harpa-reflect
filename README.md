# HarPA Reflect

Reflective journaling tool for playwork staff at Haringey Play Association. Staff complete guided journal entries after each session, receive AI coaching responses grounded in playwork theory, and build a longitudinal record of their reflective practice.

## Stack

- **Backend**: FastAPI (Python 3.11+)
- **Frontend**: React + TypeScript + Vite
- **Database**: Supabase (Postgres + pgvector)
- **Transcription**: Local Whisper (planned)
- **LLM**: Anthropic Claude (swappable to OpenAI/local)

## Structure

```
backend/            FastAPI application
  app/              Source code (routers, models, services, core)
  tests/            Pytest test suite (56 tests)
  migrations/       SQL migrations for Supabase
frontend/           React SPA (mobile-first)
  src/              Source code (pages, components, hooks, services)
  src/__tests__/    Vitest test suite (36 tests)
docs/               PRD, architecture, data model, prompt design
play theory/        23 playwork theory PDFs (source material for AI coaching)
```

## Current Status

**Working end-to-end:**
- Login/auth (JWT, 6 staff accounts)
- Guided journal entry flow (8 prompts grounded in reflective practice)
- AI coaching responses via Anthropic Claude, grounded in playwork theory
- Mood tracking (1-5 scale)
- Entry history and detail views
- Supabase Postgres for persistent storage
- Mobile-first React UI

## Development

LOCALLY 

1st Terminal 
### To Start Backend 
cd /Users/benjipro/Repositories/harpa-reflect/backend
source .venv/bin/activate
uvicorn app.main:app --reload

2nd Terminal 
### To Start Frontend 
cd /Users/benjipro/Repositories/harpa-reflect/frontend
npm run dev


FROM SCRATCH / REMOTE 

### Backend
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]"
cp .env.example .env  # fill in your keys
pytest tests/ -v
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run test:run
npm run dev
```

### Test Accounts
All accounts use password:
- `sereena` (supervisor)
- `alex`, `jordan`, `priya`, `marcus`, `leila` (staff)

## Docs

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Journal Prompts](docs/PROMPTS.md)
