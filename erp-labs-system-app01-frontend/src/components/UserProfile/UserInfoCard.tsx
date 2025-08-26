import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState, useMemo } from "react";
import { apiFetch } from "../../lib/apiClient";
import { ENV } from "../../config/env";

export default function UserInfoCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const { state, refreshMe } = useAuth();
  const [form, setForm] = useState({ 
    username: "", 
    nom: "", 
    postnom: "", 
    email: "", 
    telephone: "", 
    sexe: "" 
  });
  const [saving, setSaving] = useState(false);

  const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
  const photoUrl = useMemo(() => {
    const u = state.user as any;
    if (!u) return null;
    const raw = u.photo_url as string | undefined;
    if (raw && /^https?:\/\//i.test(raw)) return raw;
    if (raw && raw.startsWith('/')) return `${backendBase}${raw}`;
    if (u.photo_de_profil) {
      const path = String(u.photo_de_profil).replace(/^\/+/, '');
      return `${backendBase}/storage/${path}`;
    }
    return null;
  }, [state.user, backendBase]);

  useEffect(() => {
    setForm({
      username: state.user?.username || "",
      nom: (state.user as any)?.nom || "",
      postnom: (state.user as any)?.postnom || "",
      email: state.user?.email || "",
      telephone: (state.user as any)?.telephone || "",
      sexe: (state.user as any)?.sexe || "",
    });
  }, [state.user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const payload: any = {};
      if (form.username !== (state.user?.username || "")) payload.username = form.username;
      if (form.nom !== ((state.user as any)?.nom || "")) payload.nom = form.nom;
      if (form.postnom !== ((state.user as any)?.postnom || "")) payload.postnom = form.postnom;
      if (form.email !== (state.user?.email || "")) payload.email = form.email;
      if (form.telephone !== ((state.user as any)?.telephone || "")) payload.telephone = form.telephone;
      if (form.sexe !== ((state.user as any)?.sexe || "")) payload.sexe = form.sexe;
      if (Object.keys(payload).length > 0) {
        await apiFetch('/v1/auth/profile', { method: 'POST', body: JSON.stringify(payload) }, 'company');
        await refreshMe();
      }
      closeModal();
    } catch {
      // garder design
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white lg:mb-6">
            Informations Personnelles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Code Utilisateur
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{(state.user as any)?.code || '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom d'utilisateur
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{state.user?.username || '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{(state.user as any)?.nom || '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Postnom
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{(state.user as any)?.postnom || '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{state.user?.email || '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Téléphone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{(state.user as any)?.telephone || '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Sexe
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{(state.user as any)?.sexe === 'M' ? 'Masculin' : (state.user as any)?.sexe === 'F' ? 'Féminin' : '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Dernière connexion
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{(state.user as any)?.last_login ? new Date((state.user as any).last_login).toLocaleString() : '-'}</p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Compagnie
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">{state.company?.nom_company || '-'}</p>
            </div>
          </div>
        </div>

        {/* Photo de profil dans le coin droit */}
        <div className="flex flex-col items-center gap-4 lg:ml-6">
          <div className="h-24 w-24 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-4 border-gray-300 dark:border-gray-600">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt="Photo de profil" 
                className="h-full w-full object-cover"
              />
            ) : (
              <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            )}
          </div>
          
          <button
            onClick={openModal}
            className="flex items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Modifier
          </button>
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Modifier les Informations Personnelles
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos informations personnelles.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white lg:mb-6">
                  Informations Personnelles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Code Utilisateur</Label>
                    <Input type="text" value={(state.user as any)?.code || ''} disabled />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom d'utilisateur</Label>
                    <Input type="text" value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom</Label>
                    <Input type="text" value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Postnom</Label>
                    <Input type="text" value={form.postnom} onChange={(e) => setForm((f) => ({ ...f, postnom: e.target.value }))} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Téléphone</Label>
                    <Input type="tel" value={form.telephone} onChange={(e) => setForm((f) => ({ ...f, telephone: e.target.value }))} />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Sexe</Label>
                    <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary" value={form.sexe} onChange={(e) => setForm((f) => ({ ...f, sexe: e.target.value }))}>
                      <option value="">-</option>
                      <option value="M" className="dark:text-white">Masculin</option>
                      <option value="F" className="dark:text-white">Féminin</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'En cours…' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
