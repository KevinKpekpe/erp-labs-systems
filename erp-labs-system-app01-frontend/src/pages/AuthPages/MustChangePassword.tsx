import PageMeta from "../../components/common/PageMeta";
import { useState } from "react";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import Button from "../../components/ui/button/Button";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { apiFetch } from "../../lib/apiClient";

export default function MustChangePassword() {
  const { state, logout, refreshMe } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      setLoading(true);
      await apiFetch("/v1/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmPassword,
        }),
      }, "company");
      setSuccess("Mot de passe changé avec succès.");
      await refreshMe();
      navigate("/");
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e?.message || "Échec du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Changer le mot de passe" description="Votre mot de passe doit être changé" />
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="w-full max-w-md p-6 border rounded-xl border-gray-200 dark:border-gray-800">
          <h1 className="text-lg font-semibold">Changement de mot de passe requis</h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
            Votre administrateur exige que vous changiez votre mot de passe avant de continuer.
          </p>
          {state.user?.username && (
            <p className="mt-2 text-sm">Utilisateur: <strong>{state.user.username}</strong></p>
          )}
          <form onSubmit={onSubmit} className="mt-4 space-y-5">
            <div>
              <Label>Mot de passe actuel</Label>
              <Input type="password" value={currentPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value)} />
            </div>
            <div>
              <Label>Nouveau mot de passe</Label>
              <Input type="password" value={newPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} />
            </div>
            <div>
              <Label>Confirmer le mot de passe</Label>
              <Input type="password" value={confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)} />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            {success && <div className="text-sm text-green-600">{success}</div>}
            <div className="flex items-center gap-3">
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "En cours..." : "Changer le mot de passe"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => logout()}>Se déconnecter</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
