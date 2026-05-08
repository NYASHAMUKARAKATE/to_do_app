import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { ProtectedPage } from "./pages/ProtectedPage";

export default function App() {
  const {
    token,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    fetchProtected,
    clearError,
  } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage
                onLogin={login}
                isLoading={isLoading}
                error={error}
                clearError={clearError}
              />
            )
          }
        />

        <Route
          path="/register"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <RegisterPage
                onRegister={register}
                isLoading={isLoading}
                error={error}
                clearError={clearError}
              />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <ProtectedPage
                fetchProtected={fetchProtected}
                onLogout={logout}
                isLoading={isLoading}
                error={error}
                token={token}
              />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
