import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import { apiFetch } from "../../lib/apiClient";

type RoleLite = { id: number; code: string; nom_role: string };

export default function UserForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [roles, setRoles] = useState<RoleLite[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", nom: "", postnom: "", telephone: "", sexe: "", role_id: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const r = await apiFetch<any>('/v1/roles', { method: 'GET' }, 'company');
        const data = (r as any)?.data ?? r;
        const arr = Array.isArray(data) ? data : Array.isArray((data as any)?.data) ? (data as any).data : [];
        if (!mounted) return;
        setRoles(arr.map((x: any) => ({ id: Number(x.id ?? 0), code: String(x.code ?? ''), nom_role: String(x.nom_role ?? '') })));
      } catch {}

      if (isEdit) {
        try {
          const u = await apiFetch<any>(`/v1/users/${id}`, { method: 'GET' }, 'company');
          const root = (u as any)?.data ?? u;
          if (!mounted) return;
          setForm({
            username: String(root?.username ?? ''),
            email: String(root?.email ?? ''),
            nom: String(root?.nom ?? ''),
            postnom: String(root?.postnom ?? ''),
            telephone: String(root?.telephone ?? ''),
            sexe: String(root?.sexe ?? ''),
            role_id: String(((root?.roles || [])[0]?.id) ?? ''),
          });
        } catch (e: any) { if (!mounted) return; setError(e?.message || 'Erreur de chargement'); }
      }
    })();
    return () => { mounted = false; };
  }, [id, isEdit]);

  const roleOptions = roles.map(r => ({ value: String(r.id), label: r.nom_role }));
  const sexeOptions = [ { value: "M", label: "Masculin" }, { value: "F", label: "Féminin" } ];

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const isMultipart = Boolean(photo);
      let options: any = { method: 'POST' };
      if (isMultipart) {
        const fd = new FormData();
        fd.set('username', form.username);
        fd.set('email', form.email);
        if (form.nom) fd.set('nom', form.nom);
        if (form.postnom) fd.set('postnom', form.postnom);
        if (form.telephone) fd.set('telephone', form.telephone);
        if (form.sexe) fd.set('sexe', form.sexe);
        if (form.role_id) fd.set('role_id', String(Number(form.role_id)));
        if (photo) fd.set('photo', photo);
        options.body = fd;
        options.headers = { Accept: 'application/json' };
      } else {
        const payload: any = { username: form.username, email: form.email, nom: form.nom, postnom: form.postnom, telephone: form.telephone, sexe: form.sexe };
        if (form.role_id) payload.role_id = Number(form.role_id);
        options.body = JSON.stringify(payload);
      }
      if (isEdit) await apiFetch(`/v1/users/${id}`, options, 'company');
      else await apiFetch('/v1/users', options, 'company');
      navigate('/users', { state: { success: isEdit ? 'Utilisateur mis à jour.' : 'Utilisateur créé.' } });
    } catch (e: any) { setError(e?.message || 'Erreur'); } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>{isEdit ? 'Modifier' : 'Nouvel'} utilisateur | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">{isEdit ? 'Modifier' : 'Nouvel'} utilisateur</h2>
          <Link to="/users" className="text-brand-600 hover:underline">Retour</Link>
        </div>

        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div><Label htmlFor="username">Nom d'utilisateur</Label><Input id="username" type="text" value={form.username} onChange={(e) => setForm(prev => ({ ...prev, username: e.target.value }))} placeholder="Ex: jdoe" /></div>
              <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={form.email} onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))} placeholder="exemple@email.com" /></div>
              <div><Label htmlFor="role">Rôle</Label><Select placeholder="Sélectionner un rôle" defaultValue={form.role_id} onChange={(v) => setForm(prev => ({ ...prev, role_id: v }))} options={roleOptions} /></div>
              <div><Label htmlFor="nom">Nom</Label><Input id="nom" type="text" value={form.nom} onChange={(e) => setForm(prev => ({ ...prev, nom: e.target.value }))} /></div>
              <div><Label htmlFor="postnom">Postnom</Label><Input id="postnom" type="text" value={form.postnom} onChange={(e) => setForm(prev => ({ ...prev, postnom: e.target.value }))} /></div>
              <div><Label htmlFor="telephone">Téléphone</Label><Input id="telephone" type="tel" value={form.telephone} onChange={(e) => setForm(prev => ({ ...prev, telephone: e.target.value }))} /></div>
              <div><Label htmlFor="sexe">Sexe</Label><Select placeholder="Sélectionner le sexe" defaultValue={form.sexe} onChange={(v) => setForm(prev => ({ ...prev, sexe: v }))} options={sexeOptions} /></div>
              <div>
                <Label htmlFor="photo">Photo (optionnel)</Label>
                <input id="photo" type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setPhoto(file);
                  if (file) {
                    const url = URL.createObjectURL(file);
                    setPreview(url);
                  } else {
                    setPreview(null);
                  }
                }} />
                {preview && (
                  <div className="mt-2">
                    <img src={preview} alt="Prévisualisation" className="h-24 w-24 rounded-full object-cover border" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Link to="/users" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button onClick={submit} disabled={loading || !form.username.trim() || !form.email.trim()} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50">{isEdit ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


