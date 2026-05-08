"""
╔═══════════════════════════════════════════════════════════╗
║  DATA STORE — Persistence boundary (side-effect zone)     ║
║  All reads/writes to external storage live here.          ║
╚═══════════════════════════════════════════════════════════╝
"""

import json
import os
from typing import Optional

_DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "users.json")


def _load() -> dict:
    """Load the user database from disk."""
    if not os.path.exists(_DB_PATH):
        return {}
    with open(_DB_PATH, "r") as f:
        return json.load(f)


def _save(db: dict) -> None:
    """Persist the user database to disk."""
    with open(_DB_PATH, "w") as f:
        json.dump(db, f, indent=2)


def get_user(username: str) -> Optional[dict]:
    """Retrieve a user record, or None if not found."""
    return _load().get(username)


def user_exists(username: str) -> bool:
    """Check if a username is already registered."""
    return get_user(username) is not None


def save_user(username: str, hashed_password: str) -> None:
    """Persist a new user record."""
    db = _load()
    db[username] = {
        "username": username,
        "hashed_password": hashed_password,
    }
    _save(db)


# ── Todo Storage ──────────────────────────────────────────

_TODOS_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "todos.json")


def _load_todos() -> dict:
    """Load the todos database from disk."""
    if not os.path.exists(_TODOS_PATH):
        return {}
    with open(_TODOS_PATH, "r") as f:
        return json.load(f)


def _save_todos(db: dict) -> None:
    """Persist the todos database to disk."""
    with open(_TODOS_PATH, "w") as f:
        json.dump(db, f, indent=2)


def get_todos_for_user(username: str) -> list[dict]:
    """Retrieve all todos belonging to a user."""
    db = _load_todos()
    return db.get(username, [])


def save_todo(username: str, todo: dict) -> None:
    """Add a new todo for a user."""
    db = _load_todos()
    if username not in db:
        db[username] = []
    db[username].append(todo)
    _save_todos(db)


def update_todo(username: str, todo_id: str, updates: dict) -> Optional[dict]:
    """Update a todo by ID. Returns the updated todo or None if not found."""
    db = _load_todos()
    todos = db.get(username, [])
    for todo in todos:
        if todo["id"] == todo_id:
            todo.update(updates)
            _save_todos(db)
            return todo
    return None


def delete_todo(username: str, todo_id: str) -> bool:
    """Delete a todo by ID. Returns True if deleted, False if not found."""
    db = _load_todos()
    todos = db.get(username, [])
    for i, todo in enumerate(todos):
        if todo["id"] == todo_id:
            todos.pop(i)
            _save_todos(db)
            return True
    return False
