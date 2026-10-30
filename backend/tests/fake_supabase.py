"""In-memory stand-in for the Supabase client, covering only the query
methods the app uses: table().select/insert/update/delete, eq, order,
limit, execute, and rpc. Lets the API tests run without a database."""

from dataclasses import dataclass
from datetime import datetime, timezone
from uuid import uuid4


class Row(dict):
    """A row where missing columns read as None, as Postgres nulls do."""

    def __missing__(self, key):
        return None


@dataclass
class Result:
    data: list
    count: int | None = None


class Query:
    def __init__(self, store: list, op: str = "select"):
        self._store = store
        self._op = op
        self._columns = "*"
        self._count = None
        self._filters: list[tuple[str, object]] = []
        self._order: tuple[str, bool] | None = None
        self._limit: int | None = None
        self._payload = None

    # -- operations --
    def select(self, columns: str = "*", count: str | None = None):
        self._op, self._columns, self._count = "select", columns, count
        return self

    def insert(self, payload):
        self._op, self._payload = "insert", payload
        return self

    def update(self, payload: dict):
        self._op, self._payload = "update", payload
        return self

    def delete(self):
        self._op = "delete"
        return self

    # -- modifiers --
    def eq(self, column: str, value):
        self._filters.append((column, value))
        return self

    def order(self, column: str, desc: bool = False):
        self._order = (column, desc)
        return self

    def limit(self, n: int):
        self._limit = n
        return self

    # -- run --
    def _matches(self, row: dict) -> bool:
        return all(row.get(c) == v for c, v in self._filters)

    def _project(self, row: Row) -> Row:
        if self._columns.strip() == "*":
            return Row(row)
        cols = [c.strip() for c in self._columns.split(",")]
        return Row({c: row.get(c) for c in cols})

    def execute(self) -> Result:
        if self._op == "insert":
            rows = self._payload if isinstance(self._payload, list) else [self._payload]
            now = datetime.now(timezone.utc).isoformat()
            inserted = []
            for r in rows:
                row = Row({"id": str(uuid4()), "created_at": now, **r})
                self._store.append(row)
                inserted.append(Row(row))
            return Result(inserted)

        matched = [r for r in self._store if self._matches(r)]

        if self._op == "update":
            for r in matched:
                r.update(self._payload)
            return Result([Row(r) for r in matched])

        if self._op == "delete":
            self._store[:] = [r for r in self._store if not self._matches(r)]
            return Result([Row(r) for r in matched])

        if self._order:
            col, desc = self._order
            matched.sort(key=lambda r: (r.get(col) is None, r.get(col) if r.get(col) is not None else ""), reverse=desc)
        total = len(matched)
        if self._limit is not None:
            matched = matched[: self._limit]
        return Result([self._project(r) for r in matched], total if self._count else None)


class FakeSupabase:
    def __init__(self):
        self.tables: dict[str, list] = {}

    def table(self, name: str) -> Query:
        return Query(self.tables.setdefault(name, []))

    def rpc(self, name: str, params: dict | None = None):
        return Query([])  # vector search returns no theory chunks in tests
