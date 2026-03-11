import { RiUserLine } from "@remixicon/react";
import { ProfileForm } from "./components/ProfileForm";
import { ChangePasswordForm } from "./components/ChangePasswordForm";

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2.5">
          <RiUserLine className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Perfil</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie suas informações e senha
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileForm />
        <ChangePasswordForm />
      </div>
    </div>
  );
}
