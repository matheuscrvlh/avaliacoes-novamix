import { Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";

import { PrivateRoute } from "./components/auth/PrivateRoute";

import AvaliacaoPage from "@/pages/public/AvaliacaoPage";
import TelevendasPage from "@/pages/public/TelevendasPage";
import DashboardPage from "@/pages/admin/DashboardPage";
import RelatoriosPage from "@/pages/admin/RelatoriosPage";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<AvaliacaoPage />} />
        <Route path="/televendas" element={<TelevendasPage />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard/relatorios"
          element={
            <PrivateRoute>
              <RelatoriosPage />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
