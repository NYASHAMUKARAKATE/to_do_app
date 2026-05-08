import { useState, useEffect } from "react";
import { Spinner } from "../components/Spinner";
import { useTodos } from "../hooks/useTodos";

interface ProtectedPageProps {
  fetchProtected: () => Promise<string | null>;
  onLogout: () => void;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export function ProtectedPage({
  fetchProtected,
  onLogout,
  isLoading,
  error,
  token,
}: ProtectedPageProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [hasFetched, setHasFetched] = useState(false);

  const { todos, isLoading: isTodosLoading, error: todosError, fetchTodos, createTodo, updateTodo, deleteTodo } = useTodos(token);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  useEffect(() => {
    if (hasFetched) return;
    let cancelled = false;
    const verify = async () => {
      const result = await fetchProtected();
      if (!cancelled) {
        setMessage(result);
        setHasFetched(true);
        if (result) {
          fetchTodos();
        }
      }
    };
    verify();
    return () => {
      cancelled = true;
    };
  }, [fetchProtected, hasFetched, fetchTodos]);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTodo({ title: newTitle, description: newDesc });
    setNewTitle("");
    setNewDesc("");
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Todo App</span>
        </div>
        <button onClick={onLogout} className="btn-logout" id="logout-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </nav>

      <main className="dashboard-content">
        {isLoading && (
          <div className="dashboard-loading">
            <Spinner size={48} label="Verifying your session..." />
          </div>
        )}

        {(error || todosError) && (
          <div className="alert alert-error" id="protected-error">
            {error || todosError}
          </div>
        )}

        {message && !isLoading && (
          <>
            <div className="dashboard-card" style={{ marginBottom: "2rem" }}>
              <h2>Add New Task</h2>
              <form onSubmit={handleAddTodo} style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                <input
                  type="text"
                  placeholder="Task Title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #374151", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#f9fafb" }}
                />
                <input
                  type="text"
                  placeholder="Description (Optional)"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  style={{ padding: "0.75rem", borderRadius: "8px", border: "1px solid #374151", backgroundColor: "rgba(255, 255, 255, 0.05)", color: "#f9fafb" }}
                />
                <button type="submit" className="btn-primary" disabled={isTodosLoading || !newTitle.trim()}>
                  {isTodosLoading ? <Spinner size={20} label="" /> : "Add Task"}
                </button>
              </form>
            </div>

            <div className="dashboard-card">
              <h2>Your Tasks</h2>
              {todos.length === 0 ? (
                <p style={{ marginTop: "1rem", color: "#9ca3af" }}>No tasks yet. Add one above!</p>
              ) : (
                <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {todos.map((todo) => (
                    <li key={todo.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "rgba(255, 255, 255, 0.05)", borderRadius: "8px", border: "1px solid #374151" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
                          style={{ width: "1.5rem", height: "1.5rem", cursor: "pointer" }}
                        />
                        <div>
                          <h3 style={{ textDecoration: todo.completed ? "line-through" : "none", margin: 0, color: todo.completed ? "#9ca3af" : "#f9fafb" }}>
                            {todo.title}
                          </h3>
                          {todo.description && (
                            <p style={{ margin: "0.25rem 0 0 0", color: "#9ca3af", fontSize: "0.875rem" }}>
                              {todo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTodo(todo.id)}
                        style={{ padding: "0.5rem 1rem", backgroundColor: "#ef4444", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 500 }}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
