import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSetupStatus, isAuthenticated, logout } from "@/services/auth";

interface AppGuardProps {
  children: React.ReactNode;
}

type GuardStatus = "loading" | "ready";

export function AppGuard({ children }: AppGuardProps) {
  const [status, setStatus] = useState<GuardStatus>("loading");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    async function check() {
      try {
        const { is_configured } = await checkSetupStatus();
        const searchParams = new URLSearchParams(location.search);
        const hasInvite = searchParams.has("invite");

        if (!is_configured) {
          if (location.pathname !== "/setup") {
            navigate("/setup", { replace: true });
          }
          setStatus("ready");
          return;
        }

        // Allow /setup?invite=xxx even when configured
        if (location.pathname === "/setup" && !hasInvite) {
          navigate("/login", { replace: true });
          setStatus("ready");
          return;
        }

        const publicPaths = ["/login", "/setup"];
        if (!publicPaths.includes(location.pathname) && !isAuthenticated()) {
          logout();
          navigate("/login", { replace: true });
          setStatus("ready");
          return;
        }

        setStatus("ready");
      } catch {
        setStatus("ready");
      }
    }

    check();
  }, [location.pathname, location.search, navigate]);

  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="text-sm text-muted-foreground">Carregando...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
