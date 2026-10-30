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

## Next Steps

### Priority (MVP completion)
- [ ] Voice input — integrate local Whisper on Hetzner for audio transcription
- [ ] Goal setting UI — page to set/view/complete development goals
- [ ] Quote approval flow — after viewing AI response, prompt staff to approve quotes for funder reports
- [ ] Supervisor dashboard — engagement metrics view (endpoint exists, needs UI)
- [ ] Update backend tests to work with Supabase (currently test against InMemoryDB)

### Styling & UX
- [ ] Polish mobile CSS — current styling is functional but basic
- [ ] Loading states and error handling throughout
- [ ] PWA setup — offline draft storage, install prompt
- [ ] Session date picker on journal flow (currently defaults to today)

### Deployment
- [ ] Docker Compose for Hetzner (backend + frontend + Whisper)
- [ ] Nginx reverse proxy config
- [ ] SSL/HTTPS setup
- [ ] Environment-specific configs (dev/staging/prod)

### Future Features (post-MVP)
- [ ] RAG pipeline — chunk and embed the 23 playwork theory PDFs into pgvector for cited coaching responses
- [ ] BERTopic theme extraction across team journal entries
- [ ] Sentiment analysis time series for staff wellbeing
- [ ] Streamlit analysis dashboard for quantitative outcome charts
- [ ] Plinth CRM integration (member_id foreign key linkage)
- [ ] WhatsApp integration for entry reminders
- [ ] Export tools for Peabody quarterly reports

## Docs

- [PRD](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Journal Prompts](docs/PROMPTS.md)
