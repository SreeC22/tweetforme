from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import generate, feedback, voice

app = FastAPI(
    title="Echo API",
    description="AI-powered Twitter/X content generation in your authentic voice.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten this when you go to prod
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(generate.router)
app.include_router(feedback.router)
app.include_router(voice.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Echo API v0.1"}


@app.get("/health")
def health():
    return {"status": "healthy"}
