import { useState, useCallback } from "react";
import type { TokenResponse, ApiError } from "../types";

const API_BASE = "/api";
const TOKEN_KEY = "todo_app_token";

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function buildAuthHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

function isApiError(data: unknown): data is ApiError {
  return (
    typeof data === "object" &&
    data !== null &&
    "detail" in data &&
    typeof (data as ApiError).detail === "string"
  );
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = token !== null;

  const register = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const body: unknown = await res.json();
          const message = isApiError(body)
            ? body.detail
            : "Registration failed";
          setError(message);
          return false;
        }

        return true;
      } catch {
        setError("Network error. Is the server running?");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (username: string, password: string): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        if (!res.ok) {
          const body: unknown = await res.json();
          const message = isApiError(body) ? body.detail : "Login failed";
          setError(message);
          return false;
        }

        const data = (await res.json()) as TokenResponse;
        localStorage.setItem(TOKEN_KEY, data.access_token);
        setToken(data.access_token);
        return true;
      } catch {
        setError("Network error. Is the server running?");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchProtected = useCallback(async (): Promise<string | null> => {
    if (!token) {
      setError("No authentication token");
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/protected`, {
        headers: buildAuthHeaders(token),
      });

      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setError("Session expired. Please log in again.");
        return null;
      }

      if (!res.ok) {
        setError("Failed to access protected resource");
        return null;
      }

      const data = (await res.json()) as { message: string };
      return data.message;
    } catch {
      setError("Network error. Is the server running?");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    token,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    fetchProtected,
    clearError,
  };
}
