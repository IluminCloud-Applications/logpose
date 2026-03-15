import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";

interface InviteSetupFormProps {
  name: string;
  role: string;
  onSubmit: (data: { email: string; password: string; confirmPassword: string }) => void;
  error: string;
  loading: boolean;
}

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  viewer: "Visualizador",
};

export function InviteSetupForm({ name, role, onSubmit, error, loading }: InviteSetupFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ email, password, confirmPassword });
  };

  return (
    <div className="rounded-xl border border-white/10 bg-black/50 backdrop-blur-xl shadow-2xl p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white">Criar sua conta</h2>
        <Badge variant="outline" className="text-[10px] text-white/70 border-white/20">
          {roleLabels[role] ?? role}
        </Badge>
      </div>

      <div className="mb-4 rounded-lg bg-white/5 border border-white/10 px-3 py-2.5">
        <p className="text-xs text-white/50">Você foi convidado como</p>
        <p className="text-sm font-medium text-white">{name}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-email" className="text-white/80">Email</Label>
          <Input
            id="invite-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:border-primary"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-password" className="text-white/80">Senha</Label>
          <div className="relative">
            <Input
              id="invite-password"
              type={showPassword ? "text" : "password"}
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showPassword ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-confirm" className="text-white/80">Confirmar Senha</Label>
          <div className="relative">
            <Input
              id="invite-confirm"
              type={showConfirm ? "text" : "password"}
              placeholder="Repita a senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="bg-white/10 border-white/15 text-white placeholder:text-white/40 focus:border-primary"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
            >
              {showConfirm ? <RiEyeOffLine className="size-4" /> : <RiEyeLine className="size-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-400 text-center">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Criando..." : "Criar Conta"}
        </Button>
      </form>
    </div>
  );
}
