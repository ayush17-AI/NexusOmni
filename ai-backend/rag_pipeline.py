"""
RAG Pipeline — BGMI Strategy Assistant
========================================
Builds a FAISS vector store from the local knowledge base and exposes a single
`query(user_message)` async function that returns a grounded LLM response.

LLM  : Google Gemini (gemini-1.5-flash) — change GOOGLE_API_KEY in .env
Embed: Google's text-embedding-004 (1536-dim)
Store: FAISS in-memory, re-built on every cold start from knowledge_base.md
"""

import os
import asyncio
from pathlib import Path

from dotenv import load_dotenv
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")
KNOWLEDGE_BASE_PATH = Path(__file__).parent / "data" / "knowledge_base.md"

# ── Prompt ──────────────────────────────────────────────────────────────────
SYSTEM_PROMPT = PromptTemplate(
    input_variables=["context", "question"],
    template="""You are the NexusOmni AI Strategy Assistant — an elite BGMI esports coach.
Use the context below to answer the player's question concisely and tactically.
Format bullet points with "• " and bold section headings with "**Heading**".
If information is not in the context, provide your best general BGMI knowledge
but indicate it is general advice.

Context:
{context}

Question: {question}
Answer:""",
)

# ── Globals (lazy-loaded) ────────────────────────────────────────────────────
_vectorstore: FAISS | None = None
_qa_chain = None


def _build_vectorstore() -> FAISS:
    """Load and embed the knowledge base synchronously (run once at startup)."""
    text = KNOWLEDGE_BASE_PATH.read_text(encoding="utf-8")
    splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=80)
    docs = splitter.create_documents([text])

    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/text-embedding-004",
        google_api_key=GOOGLE_API_KEY,
    )
    return FAISS.from_documents(docs, embeddings)


def _build_chain(vs: FAISS) -> RetrievalQA:
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=GOOGLE_API_KEY,
        temperature=0.35,
    )
    return RetrievalQA.from_chain_type(
        llm=llm,
        retriever=vs.as_retriever(search_kwargs={"k": 4}),
        chain_type_kwargs={"prompt": SYSTEM_PROMPT},
        return_source_documents=False,
    )


def initialise():
    """Call once during FastAPI startup to pre-load the vector store."""
    global _vectorstore, _qa_chain
    _vectorstore = _build_vectorstore()
    _qa_chain = _build_chain(_vectorstore)
    print("✅ RAG pipeline ready.")


async def query(user_message: str) -> str:
    """Non-blocking wrapper around the synchronous LangChain chain."""
    if _qa_chain is None:
        raise RuntimeError("RAG pipeline not initialised. Call initialise() first.")
    loop = asyncio.get_event_loop()
    result = await loop.run_in_executor(
        None,
        lambda: _qa_chain.invoke({"query": user_message}),
    )
    return result.get("result", "Sorry, I could not generate a response.")
