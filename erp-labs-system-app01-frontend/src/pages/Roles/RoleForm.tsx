import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Select from "../../components/form/Select";
import Label from "../../components/form/Label";
import { apiFetch } from "../../lib/apiClient";

type Perm = { id: number; code: string; action: string; module: string };

export default function RoleForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [perms, setPerms] = useState<Perm[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moduleFilter, setModuleFilter] = useState<string>("");
  const [openModules, setOpenModules] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Charger permissions (company scope) et gérer pagination (data.data)
        const p = await apiFetch<any>('/v1/permissions', { method: 'GET' }, 'company');
        const root = (p as any)?.data ?? p;
        const raw = Array.isArray(root)
          ? root
          : (root && typeof root === 'object' && Array.isArray((root as any).data))
          ? (root as any).data
          : [];
        if (!mounted) return;
        setPerms(
          raw.map((r: any) => ({
            id: Number(r?.id ?? 0),
            code: String(r?.code ?? ''),
            action: String(r?.action ?? ''),
            module: String(r?.module ?? ''),
          }))
        );
      } catch { /* noop */ }

      if (isEdit) {
        try {
          const r = await apiFetch<any>(`/v1/roles/${id}`, { method: 'GET' }, 'company');
          const role = r?.data ?? r; if (!mounted) return;
          setNom(String(role?.nom_role ?? ''));
          const rp = Array.isArray(role?.permissions) ? role.permissions : [];
          setSelected(rp.map((x: any) => Number(x.id)));
        } catch (e: any) { if (!mounted) return; setError(e?.message || 'Erreur de chargement'); }
      }
    })();
    return () => { mounted = false; };
  }, [id, isEdit]);

  const toggle = (pid: number) => setSelected(prev => prev.includes(pid) ? prev.filter(i => i !== pid) : [...prev, pid]);
  const selectAll = (ids: number[]) => setSelected(prev => Array.from(new Set([...prev, ...ids])));
  const deselectAll = (ids: number[]) => setSelected(prev => prev.filter(id => !ids.includes(id)));

  const submit = async () => {
    setLoading(true); setError(null);
    try {
      const body = JSON.stringify({ nom_role: nom, permissions: selected });
      if (isEdit) await apiFetch(`/v1/roles/${id}`, { method: 'PUT', body }, 'company');
      else await apiFetch('/v1/roles', { method: 'POST', body }, 'company');
      navigate('/users/roles', { state: { success: isEdit ? 'Rôle mis à jour.' : 'Rôle créé.' } });
    } catch (e: any) { setError(e?.message || 'Erreur'); } finally { setLoading(false); }
  };

  const modules = Array.from(new Set(perms.map(p => p.module))).sort((a, b) => a.localeCompare(b));
  const filteredPerms = moduleFilter ? perms.filter(p => p.module === moduleFilter) : perms;
  const grouped = filteredPerms.reduce<Record<string, Perm[]>>((acc, p) => {
    if (!acc[p.module]) acc[p.module] = [];
    acc[p.module].push(p);
    return acc;
  }, {});

  return (
    <>
      <Helmet><title>{isEdit ? 'Modifier' : 'Nouveau'} rôle | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">{isEdit ? 'Modifier le rôle' : 'Nouveau rôle'}</h2>
          <Link to="/users/roles" className="text-brand-600 hover:underline">Retour</Link>
        </div>

        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="nom_role">Nom du rôle</Label>
                <Input id="nom_role" type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Assistant labo" />
              </div>
              <div>
                <Label>Filtrer par module</Label>
                <Select
                  placeholder="Tous les modules"
                  defaultValue={moduleFilter}
                  options={[{ value: "", label: "Tous" }, ...modules.map(m => ({ value: m, label: m }))]}
                  onChange={(value) => setModuleFilter(value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100">Permissions</h3>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => selectAll(filteredPerms.map(p => p.id))}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >Tout cocher</button>
                  <button
                    type="button"
                    onClick={() => deselectAll(filteredPerms.map(p => p.id))}
                    className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  >Tout décocher</button>
                </div>
              </div>

              <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
                {Object.entries(grouped).map(([moduleName, list]) => {
                  const isOpen = openModules[moduleName] ?? true;
                  const ids = list.map(p => p.id);
                  const allSelected = ids.every(id => selected.includes(id));
                  const partiallySelected = !allSelected && ids.some(id => selected.includes(id));
                  return (
                    <div key={moduleName} className="rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 dark:bg-gray-800/40">
                        <button type="button" onClick={() => setOpenModules(prev => ({ ...prev, [moduleName]: !isOpen }))} className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                          {isOpen ? '▾' : '▸'} {moduleName}
                        </button>
                        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${allSelected ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : partiallySelected ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>{list.length}</span>
                        <div className="ml-auto flex items-center gap-2">
                          <button type="button" onClick={() => selectAll(ids)} className="text-xs text-brand-600 hover:underline">Cocher</button>
                          <button type="button" onClick={() => deselectAll(ids)} className="text-xs text-gray-600 hover:underline">Décocher</button>
                        </div>
                      </div>
                      {isOpen && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
                          {list.map(p => (
                            <label key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                              <input type="checkbox" className="h-4 w-4" checked={selected.includes(p.id)} onChange={() => toggle(p.id)} />
                              <span className="text-sm text-gray-800 dark:text-gray-200">{p.action}</span>
                              <span className="ml-auto text-xs text-gray-500">{p.code}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
                {filteredPerms.length === 0 && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">Aucune permission pour ce filtre.</div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <Link to="/users/roles" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button onClick={submit} disabled={loading || !nom.trim()} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50">{isEdit ? 'Enregistrer' : 'Créer'}</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


