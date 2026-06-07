# Echo — Backend API

AI-powered Twitter/X content generation in your authentic voice.

## Setup

```bash
cd backend

# 1. Create virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Add your API keys
cp .env.example .env
# edit .env with your real keys

# 4. Run the server
uvicorn main:app --reload
```

API docs at http://localhost:8000/docs once running.

## Endpoints

| Method | Route | What it does |
|--------|-------|-------------|
| `POST` | `/generate/` | Fetch tweets → analyze voice → generate batch |
| `GET`  | `/voice/{handle}` | Get cached voice profile |
| `POST` | `/voice/{handle}/retrain` | Force rebuild voice profile |
| `POST` | `/feedback/swipe` | Record a single approve/reject |
| `POST` | `/feedback/session` | Submit all rejection tags from a swipe session |

## Example request

```bash
curl -X POST http://localhost:8000/generate/ \
  -H "Content-Type: application/json" \
  -d '{
    "handle": "levelsio",
    "categories": ["tech", "humor", "personal"],
    "demographics": ["Tech Twitter", "Startup founders"],
    "count": 7
  }'
```

## Environment variables

| Variable | Where to get it |
|----------|----------------|
| `GROQ_API_KEY` (free) | console.groq.com/keys — or `GEMINI_API_KEY`; `ANTHROPIC_API_KEY` for Claude |
| `TWITTER_BEARER_TOKEN` | developer.twitter.com → your app → Keys & Tokens |
