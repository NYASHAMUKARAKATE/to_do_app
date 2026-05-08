/**
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  TYPES — Strict TypeScript contracts (no `any` allowed)  ║
 * ╚═══════════════════════════════════════════════════════════╝
 */

/* ── API Response Types ─────────────────────────────────── */

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface MessageResponse {
  message: string;
}

export interface ProtectedResponse {
  message: string;
  logged_in_as: string;
}

export interface ApiError {
  detail: string;
}

/* ── Form Data Types ────────────────────────────────────── */

export interface AuthFormData {
  username: string;
  password: string;
}

/* ── Auth Context Types ─────────────────────────────────── */

export interface AuthState {
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Todo {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  owner: string;
}

export interface CreateTodoRequest {
  title: string;
  description?: string;
}

export interface UpdateTodoRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}
