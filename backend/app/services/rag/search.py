from dataclasses import dataclass

from openai import OpenAI

from app.core.config import settings
from app.core.database import get_supabase
from app.services.rag.citations import get_citation


EMBED_MODEL = "text-embedding-3-small"


@dataclass
class RetrievedChunk:
    content: str
    page_number: int
    document_title: str
    document_filename: str
    similarity: float
    short_cite: str
    full_ref: str


def _embed_query(text: str) -> list[float]:
    client = OpenAI(api_key=settings.openai_api_key)
    response = client.embeddings.create(input=[text], model=EMBED_MODEL)
    return response.data[0].embedding


def _resolve_citation(filename: str, title: str):
    c = get_citation(filename)
    if c:
        return c.short_cite, c.full_ref
    fallback = title or filename
    return fallback, fallback


def search(query: str, top_k: int = 5) -> list[RetrievedChunk]:
    if not query.strip():
        return []
    try:
        embedding = _embed_query(query)
    except Exception:
        return []
    sb = get_supabase()
    try:
        result = sb.rpc(
            "match_theory_chunks",
            {"query_embedding": embedding, "match_count": top_k},
        ).execute()
    except Exception:
        return []
    rows = result.data or []
    out: list[RetrievedChunk] = []
    for r in rows:
        filename = r["document_filename"]
        title = r["document_title"] or filename
        short_cite, full_ref = _resolve_citation(filename, title)
        out.append(
            RetrievedChunk(
                content=r["content"],
                page_number=r["page_number"],
                document_title=title,
                document_filename=filename,
                similarity=r["similarity"],
                short_cite=short_cite,
                full_ref=full_ref,
            )
        )
    return out


def format_retrieved_for_prompt(chunks: list[RetrievedChunk]) -> str:
    if not chunks:
        return ""
    # Deduplicate references across chunks — same source may surface multiple times.
    seen_refs: dict[str, str] = {}
    parts = ["## RETRIEVED PLAYWORK THEORY (quote verbatim from these when responding)\n"]
    parts.append(
        "Each source block below gives the EXACT in-text citation and full reference "
        "you MUST use. Do not paraphrase or invent citations. Use the provided "
        "`IN_TEXT` form exactly when citing, and reproduce the `FULL_REF` verbatim "
        "in the final References list.\n"
    )
    for i, c in enumerate(chunks, 1):
        parts.append(
            f"[{i}] IN_TEXT: ({c.short_cite}, p.{c.page_number})\n"
            f"     FULL_REF: {c.full_ref}\n"
            f"     EXCERPT:\n{c.content}\n"
        )
        seen_refs[c.short_cite] = c.full_ref
    return "\n".join(parts)
