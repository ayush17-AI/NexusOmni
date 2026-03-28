"""
Database Connector — Supabase
==============================
Stores chat history and user preferences in Supabase.

Required Supabase table (run in Supabase SQL editor):

    CREATE TABLE chat_history (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        session_id  TEXT NOT NULL,
        role        TEXT NOT NULL,  -- 'user' | 'assistant'
        content     TEXT NOT NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX idx_chat_session ON chat_history(session_id, created_at DESC);
"""

import os
from typing import Optional
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

_client: Optional[Client] = None


def get_client() -> Optional[Client]:
    global _client
    if _client is None and SUPABASE_URL and SUPABASE_KEY:
        try:
            _client = create_client(SUPABASE_URL, SUPABASE_KEY)
        except Exception as e:
            print(f"⚠️  Supabase connection failed: {e}")
    return _client


async def save_message(session_id: str, role: str, content: str) -> None:
    """Persist a single chat turn. Silently no-ops if DB not configured."""
    client = get_client()
    if client is None:
        return
    try:
        client.table("chat_history").insert(
            {"session_id": session_id, "role": role, "content": content}
        ).execute()
    except Exception as e:
        print(f"⚠️  Failed to save message: {e}")


async def get_history(session_id: str, limit: int = 20) -> list[dict]:
    """Fetch recent chat history for a session (newest first)."""
    client = get_client()
    if client is None:
        return []
    try:
        res = (
            client.table("chat_history")
            .select("role, content, created_at")
            .eq("session_id", session_id)
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        return list(reversed(res.data or []))
    except Exception as e:
        print(f"⚠️  Failed to fetch history: {e}")
        return []
