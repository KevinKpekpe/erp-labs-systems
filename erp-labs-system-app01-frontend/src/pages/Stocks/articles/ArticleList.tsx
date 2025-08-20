import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { PlusIcon, PencilIcon, TrashBinIcon } from "../../../icons";
import Input from "../../../components/form/input/InputField";
import Modal from "../../../components/ui/Modal";
import Alert from "../../../components/ui/alert/Alert";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";

interface ArticleRow { id: number; code: string; nom_article: string; categorie?: string | null; prix_unitaire: number; unite_mesure?: string | null; fournisseur?: string | null }
function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function extractArticles(resp: unknown): ArticleRow[] {
  const maybeRoot = (resp as { data?: unknown })?.data ?? resp;
  let arr: unknown[] = [];
  if (Array.isArray(maybeRoot)) arr = maybeRoot;
  else if (isRecord(maybeRoot)) {
    const inner = (maybeRoot as Record<string, unknown>)["data"];
    if (Array.isArray(inner)) arr = inner;
  }
  const toArticle = (r: unknown): ArticleRow | null => {
    if (!isRecord(r)) return null;
    const categoryVal = r["category"];
    let categorie: string | null = null;
    if (isRecord(categoryVal)) {
      const name = categoryVal["nom_categorie"];
      if (typeof name === 'string' || typeof name === 'number') categorie = String(name);
    }
    const idVal = r["id"]; const codeVal = r["code"]; const nomVal = r["nom_article"]; const prixVal = r["prix_unitaire"]; const uniteVal = r["unite_mesure"]; const fournVal = r["fournisseur"];
    return {
      id: typeof idVal === 'number' || typeof idVal === 'string' ? Number(idVal) : 0,
      code: typeof codeVal === 'string' || typeof codeVal === 'number' ? String(codeVal) : '',
      nom_article: typeof nomVal === 'string' ? nomVal : String(nomVal ?? ''),
      categorie,
      prix_unitaire: typeof prixVal === 'number' || typeof prixVal === 'string' ? Number(prixVal) : 0,
      unite_mesure: typeof uniteVal === 'string' ? uniteVal : uniteVal != null ? String(uniteVal) : '',
      fournisseur: typeof fournVal === 'string' ? fournVal : fournVal != null ? String(fournVal) : '',
    };
  };
  return arr.map(toArticle).filter((x): x is ArticleRow => x !== null);
}

export default function ArticleList() {
  const [items, setItems] = useState<ArticleRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [showTrashed, setShowTrashed] = useState(false);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<{ id: number; nom: string }[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; item: ArticleRow | null; hard?: boolean }>({ isOpen: false, item: null, hard: false });

  const location = useLocation();
  const navigate = useNavigate();
  useEffect(() => { const state = (location.state as { success?: string } | null) || null; if (state?.success) { setSuccessMessage(state.success); navigate(location.pathname, { replace: true, state: {} }); } }, [location.state, location.pathname, navigate]);
  useEffect(() => { if (!successMessage) return; const t = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(t); }, [successMessage]);

  // Lecture du categorie_id depuis l'URL
  const urlParams = new URLSearchParams(location.search);
  const categorieId = urlParams.get('categorie_id') || urlParams.get('category') || undefined;

  // Charger les catégories pour le filtre
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch<unknown>(`/v1/stock/categories?per_page=200`, { method: 'GET' }, 'company');
        const maybeRoot = (res as { data?: unknown })?.data ?? res;
        let arr: unknown[] = [];
        if (Array.isArray(maybeRoot)) arr = maybeRoot;
        else if (isRecord(maybeRoot)) {
          const inner = (maybeRoot as Record<string, unknown>)["data"];
          if (Array.isArray(inner)) arr = inner;
        }
        const mapped = arr.map((c) => {
          if (!isRecord(c)) return null;
          const idVal = c["id"]; const nameVal = c["nom_categorie"];
          return {
            id: typeof idVal === 'number' || typeof idVal === 'string' ? Number(idVal) : 0,
            nom: typeof nameVal === 'string' || typeof nameVal === 'number' ? String(nameVal) : '',
          };
        }).filter((v): v is { id: number; nom: string } => v !== null);
        if (mounted) setCategories(mapped);
      } catch { /* noop */ }
    })();
    return () => { mounted = false; };
  }, []);

  // Debounce de la recherche
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (debouncedSearch) count += 1;
    if (categorieId) count += 1;
    return count;
  }, [debouncedSearch, categorieId]);

  useEffect(() => {
    let mounted = true; setLoading(true);
    (async () => {
      try {
        const base = showTrashed ? "/v1/stock/articles-trashed" : "/v1/stock/articles";
        const params = new URLSearchParams({ per_page: '100' });
        if (categorieId) params.append('categorie_id', String(categorieId));
        if (debouncedSearch) params.append('q', debouncedSearch);
        const url = `${base}?${params.toString()}`;
        const res = await apiFetch<unknown>(url, { method: "GET" }, "company");
        if (mounted) setItems(extractArticles(res));
      } catch { /* noop */ } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [showTrashed, categorieId, debouncedSearch]);

  // Le filtrage principal est maintenant côté API via q & categorie_id
  const filtered = useMemo(() => items, [items]);

  const openDelete = (item: ArticleRow, hard = false) => setDeleteModal({ isOpen: true, item, hard });
  const closeDelete = () => setDeleteModal({ isOpen: false, item: null, hard: false });
  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    try {
      if (showTrashed && deleteModal.hard) { await apiFetch(`/v1/stock/articles/${deleteModal.item.id}/force`, { method: 'DELETE' }, 'company'); setSuccessMessage('Article supprimé définitivement avec succès.'); }
      else { await apiFetch(`/v1/stock/articles/${deleteModal.item.id}`, { method: 'DELETE' }, 'company'); setSuccessMessage('Article supprimé avec succès.'); }
      setItems(prev => prev.filter(i => i.id !== deleteModal.item!.id));
    } catch { /* noop */ } closeDelete();
  };
  const restore = async (item: ArticleRow) => { try { await apiFetch(`/v1/stock/articles/${item.id}/restore`, { method: 'POST' }, 'company'); setItems(prev => prev.filter(i => i.id !== item.id)); setSuccessMessage('Article restauré avec succès.'); } catch { /* noop */ } };

  return (
    <>
      <Helmet><title>Articles | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Articles</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">{showTrashed ? 'Voir actifs' : 'Corbeille'}</button>
            {!showTrashed && (<Link to="/stocks/articles/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"><PlusIcon className="mr-2 h-4 w-4" />Nouvel article</Link>)}
          </div>
        </div>

        {successMessage && (<div className="mb-6"><Alert variant="success" title="Succès" message={successMessage} /></div>)}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtres {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400">
                  {activeFiltersCount}
                </span>
              )}
            </h3>
            {activeFiltersCount > 0 && (
              <button
                onClick={() => {
                  setSearch('');
                  const params = new URLSearchParams(location.search);
                  params.delete('categorie_id');
                  params.delete('category');
                  navigate({ pathname: location.pathname, search: params.toString() });
                }}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Effacer les filtres
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche</label>
              <Input type="text" placeholder="Rechercher par nom ou code..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={categorieId ?? ''}
                onChange={(e) => {
                  const value = e.target.value;
                  const params = new URLSearchParams(location.search);
                  if (value) params.set('categorie_id', value); else { params.delete('categorie_id'); params.delete('category'); }
                  navigate({ pathname: location.pathname, search: params.toString() });
                }}
              >
                <option value="">Toutes les catégories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.nom}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Article</th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Code</th>
                  <th className="min-w-[180px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Catégorie</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Prix</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (<tr><td className="py-8 px-4" colSpan={5}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>) : filtered.map(a => (
                  <tr key={a.id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11"><div className="flex flex-col"><h5 className="font-medium text-gray-800 dark:text-white/90">{a.nom_article}</h5></div></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90 font-medium">{a.code}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{a.categorie || '-'}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{a.prix_unitaire.toLocaleString('fr-FR')}</p></td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        {!showTrashed ? (<>
                          <Link to={`/stocks/articles/${a.id}/modifier`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
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
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{showTrashed && deleteModal.hard ? 'Supprimer définitivement' : 'Supprimer l\'article'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir {showTrashed && deleteModal.hard ? 'supprimer définitivement' : 'supprimer'} l'article <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.item?.nom_article}</span> ?</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={closeDelete} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={confirmDelete} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
}


