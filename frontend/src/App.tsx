import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

// components
import { PrivateRoute } from "./components/auth/PrivateRoute";

// pages
import AvaliacaoPage from "@/pages/public/AvaliacaoPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import LoginPage from "@/pages/LoginPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AvaliacaoPage />} />
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
