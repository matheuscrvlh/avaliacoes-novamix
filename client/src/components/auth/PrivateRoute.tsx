import { useAuth } from "../../context/AuthContext";
import { HUB_URL } from "../../lib/api";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children }: PrivateRouteProps) {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-zinc-500 text-sm">
        Verificando sessão...
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = HUB_URL;
    return null;
  }

  return <>{children}</>;
}
