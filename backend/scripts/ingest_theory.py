"""One-shot ingestion of playwork theory PDFs into Supabase pgvector.

Usage (from backend/ directory):
    .venv/bin/python scripts/ingest_theory.py [/path/to/pdf_dir]

Defaults to ../play\\ theory/ at the repo root.
"""
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
DEFAULT_DIR = REPO_ROOT / "play theory"


def main():
    from app.services.rag.ingest import ingest_directory

    target = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else DEFAULT_DIR
    if not target.is_dir():
        print(f"not a directory: {target}")
        sys.exit(1)

    print(f"ingesting from: {target}")
    stats = ingest_directory(target)
    print("---")
    print(stats)


if __name__ == "__main__":
    main()
