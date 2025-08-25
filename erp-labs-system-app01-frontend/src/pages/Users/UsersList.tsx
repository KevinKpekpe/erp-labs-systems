import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import { apiFetch } from "../../lib/apiClient";

type RoleLite = { id: number; code: string; nom_role: string };
type UserRow = { id: number; code: string; username: string; email: string; telephone?: string | null; sexe?: string | null; is_active?: boolean; roles?: RoleLite[] };

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

function extractUsers(resp: unknown): UserRow[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  const data = Array.isArray(root) ? root : (isRecord(root) && Array.isArray((root as any).data) ? (root as any).data : []);
  return (data as unknown[]).filter(isRecord).map((u) => ({
    id: Number(u.id ?? 0),
    code: String(u.code ?? ''),
    username: String(u.username ?? ''),
    email: String(u.email ?? ''),
    telephone: (u as any).telephone ?? null,
    sexe: (u as any).sexe ?? null,
    is_active: Boolean((u as any).is_active ?? false),
    roles: Array.isArray((u as any).roles) ? (u as any).roles.map((r: any) => ({ id: Number(r.id ?? 0), code: String(r.code ?? ''), nom_role: String(r.nom_role ?? '') })) : [],
  }));
}

export default function UsersList() {
  const [items, setItems] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trashed, setTrashed] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const q = params.get('q') ?? '';
  const [dq, setDq] = useState(q);
  useEffect(() => { const t = setTimeout(() => { const p = new URLSearchParams(location.search); if (dq) p.set('q', dq); else p.delete('q'); navigate({ pathname: location.pathname, search: p.toString() }); }, 350); return () => clearTimeout(t); }, [dq, location.pathname, location.search, navigate]);

  useEffect(() => { if (!success) return; const t = setTimeout(() => setSuccess(null), 4000); return () => clearTimeout(t); }, [success]);

  const activeFilters = useMemo(() => (q ? 1 : 0), [q]);

  useEffect(() => {
    let mounted = true; setLoading(true); setError(null);
    (async () => {
      try {
        const url = trashed ? '/v1/users-trashed' : '/v1/users';
        const p = new URLSearchParams(); if (q) p.set('q', q);
        const res = await apiFetch(`${url}${p.toString() ? `?${p}` : ''}`, { method: 'GET' }, 'company');
        if (!mounted) return; setItems(extractUsers(res));
      } catch (e: any) { if (!mounted) return; setError(e?.message || 'Erreur'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [q, trashed]);

  const remove = async (id: number, hard?: boolean) => {
    try {
      if (trashed && hard) await apiFetch(`/v1/users/${id}/force`, { method: 'DELETE' }, 'company');
      else await apiFetch(`/v1/users/${id}`, { method: 'DELETE' }, 'company');
      setItems(prev => prev.filter(r => r.id !== id)); setSuccess(hard ? 'Utilisateur supprimé définitivement.' : 'Utilisateur supprimé.');
    } catch (e: any) { setError(e?.message || 'Suppression impossible.'); }
  };
  const restore = async (id: number) => { try { await apiFetch(`/v1/users/${id}/restore`, { method: 'POST' }, 'company'); setItems(prev => prev.filter(r => r.id !== id)); setSuccess('Utilisateur restauré.'); } catch (e: any) { setError(e?.message || 'Restauration impossible.'); } };

  return (
    <>
      <Helmet><title>Utilisateurs | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Utilisateurs</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">{trashed ? 'Voir actifs' : 'Corbeille'}</button>
            {!trashed && (<Link to="/users/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Nouvel utilisateur</Link>)}
          </div>
        </div>

        {success && (<div className="mb-6"><Alert variant="success" title="Succès" message={success} /></div>)}
        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filtres {activeFilters > 0 && (<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400">{activeFilters}</span>)}</h3>
            {activeFilters > 0 && (<button onClick={() => navigate({ pathname: location.pathname })} className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">Effacer</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche</label>
              <Input type="text" placeholder="Nom d'utilisateur, email, code..." value={dq} onChange={(e) => setDq(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Code</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Username</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Email</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Rôle</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Actif</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (<tr><td className="py-8 px-4" colSpan={6}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>) : items.length === 0 ? (
                  <tr><td className="py-8 px-4" colSpan={6}><div className="text-center text-gray-500 dark:text-gray-400">Aucun utilisateur</div></td></tr>
                ) : items.map(u => (
                  <tr key={u.id}>
                    <td className="py-4 px-4 font-medium text-gray-800 dark:text-white/90">{u.code}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{u.username}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{u.email}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{u.roles?.[0]?.nom_role || '-'}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{u.is_active ? 'Oui' : 'Non'}</td>
                    <td className="py-4 px-4">
                      {!trashed ? (
                        <div className="flex items-center gap-3">
                          <Link to={`/users/${u.id}`} className="text-brand-600 hover:underline">Voir</Link>
                          <Link to={`/users/${u.id}/modifier`} className="text-brand-600 hover:underline">Modifier</Link>
                          <button onClick={() => remove(u.id)} className="text-red-600 hover:underline">Supprimer</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => restore(u.id)} className="text-green-600 hover:underline">Restaurer</button>
                          <button onClick={() => remove(u.id, true)} className="text-red-600 hover:underline">Supprimer définitivement</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}


