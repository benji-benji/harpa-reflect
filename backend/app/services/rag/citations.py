"""Load curated citation metadata for the Playwork Theory corpus and map
filenames to their full academic references.

Source of truth: docs/citations.yaml at the repo root.
"""
from dataclasses import dataclass
from pathlib import Path

import yaml


_HERE = Path(__file__).resolve()
# Search order: package-local copy (used on deployed servers) then repo-level
# docs/citations.yaml (used in dev from the repo root).
_CANDIDATES = [
    _HERE.parent / "citations.yaml",
    *(
        [_HERE.parents[i] / "docs" / "citations.yaml"]
        for i in range(3, min(6, len(_HERE.parents)))
    ),
]
# Flatten (the comprehension above yields lists)
_CANDIDATES = [c if isinstance(c, Path) else c[0] for c in _CANDIDATES]


def _resolve_yaml_path() -> Path | None:
    for c in _CANDIDATES:
        if c.exists():
            return c
    return None


@dataclass
class Citation:
    filename: str
    short_cite: str
    full_ref: str


_cache: dict[str, Citation] | None = None


def _load() -> dict[str, Citation]:
    global _cache
    if _cache is not None:
        return _cache
    yaml_path = _resolve_yaml_path()
    if yaml_path is None:
        _cache = {}
        return _cache
    with yaml_path.open("r", encoding="utf-8") as f:
        data = yaml.safe_load(f) or {}
    docs = data.get("documents", [])
    _cache = {}
    for d in docs:
        filename = d.get("filename")
        if not filename:
            continue
        _cache[filename] = Citation(
            filename=filename,
            short_cite=d.get("short_cite") or filename,
            full_ref=d.get("full_ref") or filename,
        )
    return _cache


def get_citation(filename: str) -> Citation | None:
    return _load().get(filename)


def get_all() -> dict[str, Citation]:
    return _load()
