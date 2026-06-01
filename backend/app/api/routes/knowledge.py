from __future__ import annotations

from pathlib import Path
from urllib.parse import quote, unquote

from fastapi import APIRouter, HTTPException, Query

router = APIRouter()

DOCS_ROOT = Path(__file__).resolve().parents[4] / "docs"


def _iter_docs() -> list[Path]:
    return sorted(path for path in DOCS_ROOT.rglob("*.md") if path.is_file())


def _relative_doc_path(path: Path) -> str:
    return path.relative_to(DOCS_ROOT).as_posix()


def _doc_id_for(path: Path) -> str:
    return quote(_relative_doc_path(path), safe="")


def _resolve_doc_id(doc_id: str) -> Path:
    relative = Path(unquote(doc_id))
    target = (DOCS_ROOT / relative).resolve()
    docs_root = DOCS_ROOT.resolve()

    if docs_root not in target.parents and target != docs_root:
        raise HTTPException(status_code=400, detail="Invalid document path")
    if target.suffix.lower() != ".md" or not target.is_file():
        raise HTTPException(status_code=404, detail="Document not found")
    return target


def _title_from_path(path: Path) -> str:
    return path.stem.replace("_", " ")


@router.get("/docs")
def list_docs() -> list[dict]:
    grouped: dict[str, list[dict]] = {}
    for path in _iter_docs():
        relative = _relative_doc_path(path)
        parts = relative.split("/", 1)
        group = parts[0]
        grouped.setdefault(group, []).append(
            {
                "id": _doc_id_for(path),
                "title": _title_from_path(path),
                "relativePath": relative,
                "group": group,
            }
        )

    return [
        {
            "id": group,
            "title": group.replace("_", " "),
            "count": len(docs),
            "docs": docs,
        }
        for group, docs in sorted(grouped.items())
    ]


@router.get("/docs/{doc_id:path}")
def get_doc(doc_id: str) -> dict:
    path = _resolve_doc_id(doc_id)
    relative = _relative_doc_path(path)
    content = path.read_text(encoding="utf-8")
    return {
        "id": _doc_id_for(path),
        "title": _title_from_path(path),
        "relativePath": relative,
        "group": relative.split("/", 1)[0],
        "content": content,
    }


@router.get("/search")
def search_docs(q: str = Query(min_length=1)) -> list[dict]:
    needle = q.strip().lower()
    results: list[dict] = []
    for path in _iter_docs():
        relative = _relative_doc_path(path)
        content = path.read_text(encoding="utf-8").lower()
        if needle not in relative.lower() and needle not in path.name.lower() and needle not in content:
            continue

        excerpt = ""
        index = content.find(needle)
        if index >= 0:
            original = path.read_text(encoding="utf-8")
            start = max(0, index - 80)
            end = min(len(original), index + len(needle) + 80)
            excerpt = original[start:end].replace("\n", " ").strip()

        results.append(
            {
                "id": _doc_id_for(path),
                "title": _title_from_path(path),
                "relativePath": relative,
                "group": relative.split("/", 1)[0],
                "excerpt": excerpt,
            }
        )

    return results
