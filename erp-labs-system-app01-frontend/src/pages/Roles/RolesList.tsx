import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import { apiFetch } from "../../lib/apiClient";

type RoleRow = { id: number; code: string; nom_role: string; permissions?: Array<{ id: number; code: string; action: string; module: string }> };
function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

function extractRoles(resp: unknown): RoleRow[] {
  const root = (resp as { data?: unknown })?.data ?? resp; const data = isRecord(root) && Array.isArray((root as any).data) ? (root as any).data as unknown[] : Array.isArray(root) ? root as unknown[] : []; return data.filter(isRecord).map(r => ({ id: Number(r.id ?? 0), code: String(r.code ?? ''), nom_role: String(r.nom_role ?? ''), permissions: Array.isArray((r as any).permissions) ? (r as any).permissions : [] }));
}

export default function RolesList() {
  const [items, setItems] = useState<RoleRow[]>([]);
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
        const url = trashed ? '/v1/roles-trashed' : '/v1/roles';
        const p = new URLSearchParams(); if (q) p.set('q', q);
        const res = await apiFetch(`${url}${p.toString() ? `?${p}` : ''}`, { method: 'GET' }, 'company');
        if (!mounted) return; setItems(extractRoles(res));
      } catch (e: any) { if (!mounted) return; setError(e?.message || 'Erreur'); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [q, trashed]);

  const remove = async (id: number, hard?: boolean) => {
    try {
      if (trashed && hard) await apiFetch(`/v1/roles/${id}/force`, { method: 'DELETE' }, 'company');
      else await apiFetch(`/v1/roles/${id}`, { method: 'DELETE' }, 'company');
      setItems(prev => prev.filter(r => r.id !== id)); setSuccess(hard ? 'Rôle supprimé définitivement.' : 'Rôle supprimé.');
    } catch (e: any) { setError(e?.message || 'Suppression impossible.'); }
  };
  const restore = async (id: number) => { try { await apiFetch(`/v1/roles/${id}/restore`, { method: 'POST' }, 'company'); setItems(prev => prev.filter(r => r.id !== id)); setSuccess('Rôle restauré.'); } catch (e: any) { setError(e?.message || 'Restauration impossible.'); } };

  return (
    <>
      <Helmet><title>Rôles | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Rôles</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">{trashed ? 'Voir actifs' : 'Corbeille'}</button>
            {!trashed && (<Link to="/users/roles/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Nouveau rôle</Link>)}
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
              <Input type="text" placeholder="Nom, code..." value={dq} onChange={(e) => setDq(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Code</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Nom</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Permissions</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (<tr><td className="py-8 px-4" colSpan={4}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>) : items.length === 0 ? (
                  <tr><td className="py-8 px-4" colSpan={4}><div className="text-center text-gray-500 dark:text-gray-400">Aucun rôle</div></td></tr>
                ) : items.map(r => (
                  <tr key={r.id}>
                    <td className="py-4 px-4 font-medium text-gray-800 dark:text-white/90">{r.code}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{r.nom_role}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{(r.permissions || []).slice(0,3).map(p => p.code).join(', ')}{(r.permissions || []).length > 3 ? '…' : ''}</td>
                    <td className="py-4 px-4">
                      {!trashed ? (
                        <div className="flex items-center gap-3">
                          <Link to={`/users/roles/${r.id}`} className="text-brand-600 hover:underline">Voir</Link>
                          <Link to={`/users/roles/${r.id}/modifier`} className="text-brand-600 hover:underline">Modifier</Link>
                          <button onClick={() => remove(r.id)} className="text-red-600 hover:underline">Supprimer</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <button onClick={() => restore(r.id)} className="text-green-600 hover:underline">Restaurer</button>
                          <button onClick={() => remove(r.id, true)} className="text-red-600 hover:underline">Supprimer définitivement</button>
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


