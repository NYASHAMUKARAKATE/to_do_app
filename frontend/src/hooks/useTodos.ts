import { useState, useCallback } from "react";
import type { Todo, CreateTodoRequest, UpdateTodoRequest } from "../types";

const API_BASE = "/api";

export function useTodos(token: string | null) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildHeaders = useCallback(() => {
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, [token]);

  const fetchTodos = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/todos`, {
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [token, buildHeaders]);

  const createTodo = useCallback(async (req: CreateTodoRequest) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/todos`, {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error("Failed to create todo");
      const newTodo = await res.json();
      setTodos((prev) => [...prev, newTodo]);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  }, [token, buildHeaders]);

  const updateTodo = useCallback(async (id: string, req: UpdateTodoRequest) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: "PUT",
        headers: buildHeaders(),
        body: JSON.stringify(req),
      });
      if (!res.ok) throw new Error("Failed to update todo");
      const updatedTodo = await res.json();
      setTodos((prev) => prev.map((t) => (t.id === id ? updatedTodo : t)));
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  }, [token, buildHeaders]);

  const deleteTodo = useCallback(async (id: string) => {
    if (!token) return;
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/todos/${id}`, {
        method: "DELETE",
        headers: buildHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setError(err.message || "An error occurred");
    }
  }, [token, buildHeaders]);

  return {
    todos,
    isLoading,
    error,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
  };
}
