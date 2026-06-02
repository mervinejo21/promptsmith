from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.optimize import router as optimize_router

app = FastAPI(
    title="Prompt Optimizer",
    description="Optimizes prompts using Mistral AI",
    version="1.0.0"
)

# CORS — allows React frontend to talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routers
app.include_router(optimize_router, prefix="/api")

@app.get("/")
async def root():
    return { "message": "Prompt Optimizer API is running" }