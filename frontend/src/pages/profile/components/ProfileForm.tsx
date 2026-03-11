import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getStoredUser } from "@/services/auth";
import { apiRequest } from "@/services/api";

export function ProfileForm() {
  const user = getStoredUser();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const updatedUser = await apiRequest<{ id: number; name: string; email: string }>("/profile", {
        method: "PUT",
        body: { name, email },
      });
      
      localStorage.setItem("user", JSON.stringify(updatedUser)); // Update local storage cache
      setMessage({ text: "Perfil atualizado com sucesso!", type: "success" });
    } catch (error: any) {
      setMessage({ text: error.message || "Erro ao atualizar perfil", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Informações Pessoais</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nome</Label>
            <Input 
              id="profile-name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Seu nome" 
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="profile-email">Email</Label>
            <Input 
              id="profile-email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com" 
              required
            />
          </div>

          {message.text && (
            <p className={`text-sm ${message.type === "success" ? "text-green-500" : "text-destructive"}`}>
              {message.text}
            </p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
