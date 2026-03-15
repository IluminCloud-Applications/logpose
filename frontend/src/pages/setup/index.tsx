import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createAdmin } from "@/services/auth";
import { getInviteInfo, completeInvite } from "@/services/users";
import { SetupForm } from "./form";
import { InviteSetupForm } from "./invite-form";

export default function SetupPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteToken = searchParams.get("invite");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [inviteInfo, setInviteInfo] = useState<{ name: string; role: string } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(!!inviteToken);
  const [inviteError, setInviteError] = useState("");
  const [redirectCountdown, setRedirectCountdown] = useState(5);

  // Auto-redirect to login after 5s when invite is invalid
  useEffect(() => {
    if (!inviteError) return;
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/login", { replace: true });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [inviteError, navigate]);

  // Load invite info if token present
  useEffect(() => {
    if (!inviteToken) return;
    setInviteLoading(true);
    getInviteInfo(inviteToken)
      .then(setInviteInfo)
      .catch((err) => setInviteError(err instanceof Error ? err.message : "Convite inválido"))
      .finally(() => setInviteLoading(false));
  }, [inviteToken]);

  // Regular setup (owner)
  const handleSetup = async (data: {
    name: string; email: string; password: string; confirmPassword: string;
  }) => {
    setError("");
    setLoading(true);
    try {
      await createAdmin({
        name: data.name, email: data.email,
        password: data.password, confirm_password: data.confirmPassword,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  // Invite setup
  const handleInvite = async (data: {
    email: string; password: string; confirmPassword: string;
  }) => {
    setError("");
    setLoading(true);
    try {
      await completeInvite(inviteToken!, {
        email: data.email,
        password: data.password,
        confirm_password: data.confirmPassword,
      });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (inviteToken) {
      if (inviteLoading) {
        return (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
          </div>
        );
      }
      if (inviteError) {
        return (
          <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl p-6 text-center space-y-3">
            <p className="text-red-400 font-medium">{inviteError}</p>
            <p className="text-white/50 text-sm">
              Redirecionando para o login em{" "}
              <span className="text-white font-medium">{redirectCountdown}s</span>...
            </p>
          </div>
        );
      }
      return (
        <InviteSetupForm
          name={inviteInfo?.name ?? ""}
          role={inviteInfo?.role ?? ""}
          onSubmit={handleInvite}
          error={error}
          loading={loading}
        />
      );
    }
    return <SetupForm onSubmit={handleSetup} error={error} loading={loading} />;
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/bg_login.webp')" }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative z-10 w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo_dark.webp"
            alt="LOG POSE"
            className="h-14 w-auto object-contain drop-shadow-lg"
          />
          <p className="text-sm text-white/70 text-center">
            {inviteToken
              ? "Configure sua conta para acessar o Log Pose"
              : "Configure sua conta de administrador para começar"}
          </p>
        </div>
        {renderContent()}
      </div>
    </div>
  );
}
