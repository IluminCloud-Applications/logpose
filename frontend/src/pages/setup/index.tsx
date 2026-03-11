import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdmin } from "@/services/auth";
import { SetupForm } from "./form";

export default function SetupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }) => {
    setError("");
    setLoading(true);

    try {
      await createAdmin({
        name: data.name,
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

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4 bg-cover bg-center bg-no-repeat relative"
      style={{ backgroundImage: "url('/bg_login.webp')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/10" />

      <div className="relative z-10 w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <img
            src="/logo_dark.webp"
            alt="LOG POSE"
            className="h-14 w-auto object-contain drop-shadow-lg"
          />
          <p className="text-sm text-white/70 text-center">
            Configure sua conta de administrador para começar
          </p>
        </div>

        <SetupForm onSubmit={handleSubmit} error={error} loading={loading} />
      </div>
    </div>
  );
}
