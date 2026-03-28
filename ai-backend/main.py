"""
NexusOmni AI Strategy Assistant — FastAPI Backend
===================================================
Run locally:
    cd ai-backend
    uvicorn main:app --reload --port 8000

Production:
    uvicorn main:app --host 0.0.0.0 --port 8000
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

import rag_pipeline
import database as db
from models import ChatRequest, ChatResponse


# ── Lifespan: build RAG index at startup ──────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    rag_pipeline.initialise()   # builds FAISS vector store (blocking, ~5 s first run)
    yield


app = FastAPI(
    title="NexusOmni AI Strategy Assistant",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS — allow the Next.js dev server and Vercel deployment ─────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",   # Next.js dev
        "https://*.vercel.app",   # Vercel preview deployments
        "*",                       # ← remove in strict production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Routes ───────────────────────────────────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "NexusOmni AI Backend"}


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    """
    Main endpoint consumed by the Next.js frontend.
    
    Flow:
      1. Persist user message to Supabase (non-blocking, silently ignored if DB not set)
      2. Run RAG query against FAISS + Gemini
      3. Persist assistant reply
      4. Return reply to client
    """
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # 1. Save user message
    await db.save_message(req.session_id, "user", req.message)

    # 2. Query RAG pipeline
    try:
        reply = await rag_pipeline.query(req.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI pipeline error: {str(e)}")

    # 3. Save assistant reply
    await db.save_message(req.session_id, "assistant", reply)

    return ChatResponse(reply=reply, session_id=req.session_id)


@app.get("/history/{session_id}")
async def get_history(session_id: str):
    """Fetch past messages for a session (for optional frontend restore)."""
    msgs = await db.get_history(session_id)
    return {"session_id": session_id, "messages": msgs}
