from pydantic import BaseModel


class ChatRequest(BaseModel):
    """Payload sent by the Next.js frontend."""
    message: str
    session_id: str = "default"


class ChatResponse(BaseModel):
    """Payload returned to the Next.js frontend."""
    reply: str
    session_id: str
