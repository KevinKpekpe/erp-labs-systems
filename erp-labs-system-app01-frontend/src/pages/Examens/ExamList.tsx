import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { PlusIcon, PencilIcon, TrashBinIcon, EyeIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/alert/Alert";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../lib/apiClient";

interface ExamRow { id: number; code: string; nom_examen: string; prix: number; type_echantillon?: string | null }
function isObject(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function extractExams(resp: unknown): ExamRow[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  const arr = isObject(root) && Array.isArray((root as Record<string, unknown>).data) ? (root as Record<string, unknown>).data as unknown[] : Array.isArray(root) ? (root as unknown[]) : [];
  return arr.filter(isObject).map((r) => {
    const rec = r as Record<string, unknown>;
    return {
      id: Number(rec['id'] ?? 0),
      code: String(rec['code'] ?? ''),
      nom_examen: String(rec['nom_examen'] ?? ''),
      prix: Number(rec['prix'] ?? 0),
      type_echantillon: String(rec['type_echantillon'] ?? ''),
    };
  });
}

export default function ExamList() {
  const [items, setItems] = useState<ExamRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [search, setSearch] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: ExamRow | null; hard?: boolean }>({ isOpen: false, item: null, hard: false });

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { const state = (location.state as { success?: string } | null) || null; if (state?.success) { setSuccessMessage(state.success); navigate(location.pathname, { replace: true, state: {} }); } }, [location.state, location.pathname, navigate]);
  useEffect(() => { if (!successMessage) return; const t = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(t); }, [successMessage]);

  useEffect(() => {
    let mounted = true; setLoading(true);
    (async () => {
      try {
        const url = showTrashed ? "/v1/exams-trashed?per_page=100" : "/v1/exams?per_page=100";
        const res = await apiFetch<unknown>(url, { method: "GET" }, "company");
        if (mounted) setItems(extractExams(res));
      } catch { /* noop */ } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [showTrashed]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return items.filter(a => a.nom_examen.toLowerCase().includes(q) || a.code.toLowerCase().includes(q) || (a.type_echantillon ?? '').toLowerCase().includes(q));
  }, [items, search]);

  const openDelete = (item: ExamRow, hard = false) => setDeleteModal({ isOpen: true, item, hard });
  const closeDelete = () => setDeleteModal({ isOpen: false, item: null, hard: false });
  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      if (showTrashed && deleteModal.hard) { await apiFetch(`/v1/exams/${deleteModal.item.id}/force`, { method: 'DELETE' }, 'company'); setSuccessMessage('Examen supprimé définitivement avec succès.'); }
      else { await apiFetch(`/v1/exams/${deleteModal.item.id}`, { method: 'DELETE' }, 'company'); setSuccessMessage('Examen supprimé avec succès.'); }
      setItems(prev => prev.filter(i => i.id !== deleteModal.item!.id));
    } catch { /* noop */ } closeDelete();
  };
  const restore = async (item: ExamRow) => { try { await apiFetch(`/v1/exams/${item.id}/restore`, { method: 'POST' }, 'company'); setItems(prev => prev.filter(i => i.id !== item.id)); setSuccessMessage('Examen restauré avec succès.'); } catch { /* noop */ } };

  return (
    <>
      <Helmet><title>Examens | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Examens</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">{showTrashed ? 'Voir actifs' : 'Corbeille'}</button>
            {!showTrashed && (<Link to="/examens/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"><PlusIcon className="mr-2 h-4 w-4" />Nouvel examen</Link>)}
          </div>
        </div>

        {successMessage && (<div className="mb-6"><Alert variant="success" title="Succès" message={successMessage} /></div>)}

        <div className="mb-6"><Input type="text" placeholder="Rechercher par nom, code ou type d'échantillon..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Examen</th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Code</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Prix</th>
                  <th className="min-w-[180px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Type d'échantillon</th>
                  <th className="min-w-[160px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (<tr><td className="py-8 px-4" colSpan={5}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>) : filtered.map(a => (
                  <tr key={a.id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11"><div className="flex flex-col"><h5 className="font-medium text-gray-800 dark:text-white/90">{a.nom_examen}</h5></div></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90 font-medium">{a.code}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'CDF', maximumFractionDigits: 0 }).format(a.prix)}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{a.type_echantillon || '-'}</p></td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        {!showTrashed ? (<>
                          <Link to={`/examens/${a.id}`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Voir"><EyeIcon className="h-5 w-5" /></Link>
                          <Link to={`/examens/${a.id}/modifier`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
                          <button onClick={() => openDelete(a)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer"><TrashBinIcon className="h-5 w-5" /></button>
                        </>) : (<>
                          <button onClick={() => restore(a)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-success dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-success transition-colors" title="Restaurer">Restaurer</button>
                          <button onClick={() => openDelete(a, true)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer définitivement"><TrashBinIcon className="h-5 w-5" /></button>
                        </>)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={deleteModal.isOpen} onClose={closeDelete} title={showTrashed && deleteModal.hard ? "Confirmer la suppression définitive" : "Confirmer la suppression"} size="sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"><TrashBinIcon className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{showTrashed && deleteModal.hard ? 'Supprimer définitivement' : 'Supprimer l\'examen'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir {showTrashed && deleteModal.hard ? 'supprimer définitivement' : 'supprimer'} l'examen <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.item?.nom_examen}</span> ?</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={closeDelete} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={confirmDelete} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
}
