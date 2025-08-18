import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import Input from "../../../components/form/input/InputField";
import Modal from "../../../components/ui/Modal";
import Alert from "../../../components/ui/alert/Alert";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";

interface CategoryArticle { 
  id: number; 
  code: string; 
  nom_categorie: string;
  type_laboratoire?: string;
  conditions_stockage_requises?: string;
  temperature_stockage_min?: number;
  temperature_stockage_max?: number;
  sensible_lumiere?: boolean;
  chaine_froid_critique?: boolean;
  delai_alerte_expiration?: number;
}

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function extractCategories(resp: unknown): CategoryArticle[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  const arr = isObject(root) && Array.isArray((root as Record<string, unknown>).data) ? (root as Record<string, unknown>).data as unknown[] : Array.isArray(root) ? (root as unknown[]) : [];
  return arr.filter(isObject).map((r) => ({ 
    id: Number((r as Record<string, unknown>).id ?? 0), 
    code: String((r as Record<string, unknown>).code ?? ''), 
    nom_categorie: String((r as Record<string, unknown>).nom_categorie ?? ''),
    type_laboratoire: (r as Record<string, unknown>).type_laboratoire ? String((r as Record<string, unknown>).type_laboratoire) : undefined,
    conditions_stockage_requises: (r as Record<string, unknown>).conditions_stockage_requises ? String((r as Record<string, unknown>).conditions_stockage_requises) : undefined,
    temperature_stockage_min: (r as Record<string, unknown>).temperature_stockage_min ? Number((r as Record<string, unknown>).temperature_stockage_min) : undefined,
    temperature_stockage_max: (r as Record<string, unknown>).temperature_stockage_max ? Number((r as Record<string, unknown>).temperature_stockage_max) : undefined,
    sensible_lumiere: Boolean((r as Record<string, unknown>).sensible_lumiere),
    chaine_froid_critique: Boolean((r as Record<string, unknown>).chaine_froid_critique),
    delai_alerte_expiration: Number((r as Record<string, unknown>).delai_alerte_expiration || 30),
  }));
}

export default function CategoryArticleList() {
  const [items, setItems] = useState<CategoryArticle[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: CategoryArticle | null; hard?: boolean }>({ isOpen: false, item: null, hard: false });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const state = (location.state as { success?: string } | null) || null;
    if (state?.success) {
      setSuccessMessage(state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => { if (!successMessage) return; const t = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(t); }, [successMessage]);

  useEffect(() => {
    let mounted = true; setLoading(true);
    (async () => {
      try {
        const url = showTrashed ? "/v1/stock/categories-trashed?per_page=100" : "/v1/stock/categories?per_page=100";
        const res = await apiFetch<unknown>(url, { method: "GET" }, "company");
        if (mounted) setItems(extractCategories(res));
      } catch {
        // noop
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [showTrashed]);

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter(c => c.nom_categorie.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const openDelete = (item: CategoryArticle, hard = false) => setDeleteModal({ isOpen: true, item, hard });
  const closeDelete = () => setDeleteModal({ isOpen: false, item: null, hard: false });
  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      if (showTrashed && deleteModal.hard) {
        await apiFetch(`/v1/stock/categories/${deleteModal.item.id}/force`, { method: "DELETE" }, "company");
        setSuccessMessage("Catégorie supprimée définitivement avec succès.");
      } else {
        await apiFetch(`/v1/stock/categories/${deleteModal.item.id}`, { method: "DELETE" }, "company");
        setSuccessMessage("Catégorie supprimée avec succès.");
      }
      setItems(prev => prev.filter(i => i.id !== deleteModal.item!.id));
    } catch {
      // noop
    } closeDelete();
  };
  const restore = async (item: CategoryArticle) => { try { await apiFetch(`/v1/stock/categories/${item.id}/restore`, { method: "POST" }, "company"); setItems(prev => prev.filter(i => i.id !== item.id)); setSuccessMessage("Catégorie restaurée avec succès."); } catch { /* noop */ } };

  return (
    <>
      <Helmet><title>Catégories d'articles | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Catégories d'articles</h2>
          <div className="flex items-center gap-3">
            <Link to="/stocks/categories/laboratory" className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">🧪 Catégories labo</Link>
            <button onClick={() => setShowTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">{showTrashed ? 'Voir actifs' : 'Corbeille'}</button>
            {!showTrashed && (<Link to="/stocks/categories/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"><PlusIcon className="mr-2 h-4 w-4" />Nouvelle catégorie</Link>)}
          </div>
        </div>

        {successMessage && (<div className="mb-6"><Alert variant="success" title="Succès" message={successMessage} /></div>)}

        <div className="mb-6"><div className="relative"><Input type="text" placeholder="Rechercher par nom ou code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div></div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[250px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Catégorie</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Code</th>
                  <th className="min-w-[200px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Informations laboratoire</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (<tr><td className="py-8 px-4" colSpan={4}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>) : filtered.map((c) => (
                  <tr key={c.id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11">
                      <div className="flex flex-col">
                        <h5 className="font-medium text-gray-800 dark:text-white/90">{c.nom_categorie}</h5>
                        {c.type_laboratoire && (
                          <span className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {c.type_laboratoire}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90 font-medium">{c.code}</p></td>
                    <td className="py-5 px-4">
                      <div className="text-sm">
                        {c.type_laboratoire ? (
                          <div className="space-y-1">
                            {(c.temperature_stockage_min || c.temperature_stockage_max) && (
                              <p className="text-gray-600 dark:text-gray-300">
                                🌡️ {c.temperature_stockage_min && c.temperature_stockage_max
                                  ? `${c.temperature_stockage_min}°C à ${c.temperature_stockage_max}°C`
                                  : c.temperature_stockage_min
                                  ? `> ${c.temperature_stockage_min}°C`
                                  : `< ${c.temperature_stockage_max}°C`
                                }
                              </p>
                            )}
                            <div className="flex gap-1">
                              {c.sensible_lumiere && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                                  💡
                                </span>
                              )}
                              {c.chaine_froid_critique && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                                  ❄️
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">Catégorie standard</span>
                        )}
                      </div>
                    </td>
                    <td className="py-5 px-4"><div className="flex items-center space-x-3.5">
                      {!showTrashed ? (<>
                        <Link to={`/stocks/categories/${c.id}/modifier`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
                        <button onClick={() => openDelete(c)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer"><TrashBinIcon className="h-5 w-5" /></button>
                      </>) : (<>
                        <button onClick={() => restore(c)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-success dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-success transition-colors" title="Restaurer">Restaurer</button>
                        <button onClick={() => openDelete(c, true)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer définitivement"><TrashBinIcon className="h-5 w-5" /></button>
                      </>)}
                    </div></td>
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
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{showTrashed && deleteModal.hard ? 'Supprimer définitivement' : 'Supprimer la catégorie'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir {showTrashed && deleteModal.hard ? 'supprimer définitivement' : 'supprimer'} la catégorie <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.item?.nom_categorie}</span> ?</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={closeDelete} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={confirmDelete} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
}


