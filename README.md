# PromptSmith 🔨

> Transform a simple natural language statement into a highly optimized, scored prompt using Mistral AI.

---

## What is this?

PromptSmith takes a natural language statement describing what you want a prompt to do, and automatically generates, tests, and refines it until it achieves a high quality score. You can provide examples, edge cases, and configure your own scoring weights.

---

## How it works

1. User provides a statement, examples, edge cases, and scoring weights
2. Mistral AI generates an optimized prompt
3. The prompt is tested against all examples and edge cases
4. Mistral AI scores the prompt on clarity, edge case handling, and output quality
5. If the score is below 80, the process repeats (max 3 iterations)
6. The best prompt is returned with its final score
7. Every step streams live to the frontend via SSE

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript |
| Backend | FastAPI + Python |
| AI | Mistral AI (`mistral-small-latest`) |
| Streaming | Server-Sent Events (SSE) |
| Validation | Pydantic |

---

## Project Structure

```
promptsmith/
├── backend/
│   ├── pipeline/
│   │   ├── __init__.py
│   │   ├── generator.py      # Generates optimized prompt via Mistral
│   │   ├── scorer.py         # Scores prompt via Mistral
│   │   └── optimizer.py      # Runs the generate→score→repeat loop
│   ├── prompts/
│   │   ├── generate.txt      # System prompt for generation
│   │   └── score.txt         # System prompt for scoring
│   ├── routers/
│   │   ├── __init__.py
│   │   └── optimize.py       # All FastAPI route handlers
│   ├── services/
│   │   ├── __init__.py
│   │   └── mistral_client.py # Mistral AI client instance
│   ├── main.py               # FastAPI app entry point
│   ├── models.py             # Pydantic request/response models
│   ├── config.py             # Environment variable loader
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── InputForm.tsx      # User input form
│   │   │   ├── StreamViewer.tsx   # Live SSE stream display
│   │   │   └── ResultDisplay.tsx  # Final prompt + score
│   │   ├── hooks/
│   │   │   └── useSSE.ts          # Custom SSE hook
│   │   ├── api/
│   │   │   └── client.ts          # API calls to FastAPI
│   │   └── App.tsx
│   ├── .gitignore
│   └── package.json
└── README.md
```

---

## Setup & Installation

### Prerequisites
- Python 3.12+
- Node.js 18+
- Mistral AI API key → [Get one here](https://console.mistral.ai/)

### Backend

```bash
# Navigate to backend
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo MISTRAL_API_KEY=your_key_here > .env
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install
```

---

## Running the Project

### Start the backend
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload
```
Backend runs at: `http://localhost:8000`
Swagger UI at: `http://localhost:8000/docs`

### Start the frontend
```bash
cd frontend
npm run dev
```
Frontend runs at: `http://localhost:5173`

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/optimize` | Run the full optimization loop with SSE streaming |
| `POST` | `/api/refine` | Manually trigger another optimization pass |
| `POST` | `/api/weakness` | Analyze weaknesses of a given prompt |
| `POST` | `/api/addedgecases` | Auto-generate new edge cases using Mistral |
| `POST` | `/api/finish` | Save the final optimized prompt |

---

## Request Format

```json
{
  "statement": "Write a professional email reply",
  "examples": [
    {
      "input": "Reply to a meeting request",
      "expected_output": "A polite, professional acceptance email"
    }
  ],
  "edge_cases": [
    {
      "input": "Reply to an angry client email",
      "expected_output": "A calm, professional de-escalation email"
    }
  ],
  "weights": {
    "clarity": 40,
    "edge_cases": 30,
    "quality": 30
  }
}
```

---

## SSE Stream Events

During optimization, the backend streams the following events to the frontend:

```json
{
  "iteration": 1,
  "current_prompt": "...",
  "score": 72.5,
  "score_breakdown": {
    "clarity": 80,
    "edge_cases": 60,
    "quality": 75,
    "weakness": "Does not handle edge cases well"
  },
  "thinking": "Does not handle edge cases well"
}
```

Final event:
```json
{
  "type": "done",
  "final_prompt": "...",
  "final_score": 85.0,
  "iterations_taken": 2
}
```

---

## Scoring

Scores are weighted based on user configuration:

```
final_score = (clarity_score × clarity_weight / 100)
            + (edge_cases_score × edge_cases_weight / 100)
            + (quality_score × quality_weight / 100)
```

All weights must sum to **100**. The loop stops when:
- Score exceeds **80**, or
- **3 iterations** have been completed

---

## Environment Variables

| Variable | Description |
|---|---|
| `MISTRAL_API_KEY` | Your Mistral AI API key |

---

## .gitignore

Make sure these are never committed:
```
backend/venv/
backend/.env
backend/__pycache__/
frontend/node_modules/
frontend/.env
```

---

## License

MIT