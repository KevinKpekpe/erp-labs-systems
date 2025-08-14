import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon } from "../../../icons";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";

interface Category { id: number; nom_categorie: string }
function isObject(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function extractCategories(resp: unknown): Category[] { const root = (resp as { data?: unknown })?.data ?? resp; const arr = isObject(root) && Array.isArray((root as any).data) ? (root as any).data as unknown[] : Array.isArray(root) ? root as unknown[] : []; return arr.filter(isObject).map(r => ({ id: Number((r as any).id ?? 0), nom_categorie: String((r as any).nom_categorie ?? '') })); }
function getErrorMessage(err: unknown): string { if (isObject(err) && 'message' in err) return String((err as any).message || ''); return 'Une erreur est survenue.'; }

export default function ArticleCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState({ nom_article: "", categorie_id: "", prix_unitaire: "", unite_mesure: "", fournisseur: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { (async () => { try { const res = await apiFetch<unknown>("/v1/stock/categories?per_page=100", { method: 'GET' }, 'company'); setCategories(extractCategories(res)); } catch { /* noop */ } })(); }, []);

  const onChange = (field: string, value: string) => { setForm(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" })); };
  const validate = () => { const e: Record<string,string> = {}; if (!form.nom_article.trim()) e.nom_article = "Le nom est requis"; if (!form.categorie_id) e.categorie_id = "La catégorie est requise"; if (!form.prix_unitaire) e.prix_unitaire = "Le prix est requis"; if (!form.unite_mesure) e.unite_mesure = "L'unité est requise"; setErrors(e); return Object.keys(e).length === 0; };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setApiError(null); if (!validate()) return; setSubmitting(true);
    try {
      await apiFetch("/v1/stock/articles", { method: 'POST', body: JSON.stringify({ nom_article: form.nom_article, categorie_id: Number(form.categorie_id), prix_unitaire: Number(form.prix_unitaire), unite_mesure: form.unite_mesure, fournisseur: form.fournisseur || undefined, description: form.description || undefined }) }, 'company');
      navigate('/stocks/articles', { state: { success: 'Article créé avec succès.' } });
    } catch (err: unknown) { setApiError(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Nouvel article | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/stocks/articles" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouvel article</h2>
          </div>
        </div>

        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'article <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: Réactif A" value={form.nom_article} onChange={(e) => onChange('nom_article', e.target.value)} className={errors.nom_article ? 'border-red-500' : ''} />
                {errors.nom_article && <p className="mt-1 text-sm text-red-500">{errors.nom_article}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie <span className="text-red-500">*</span></label>
                <Select options={categories.map(c => ({ value: String(c.id), label: c.nom_categorie }))} placeholder="Sélectionner" defaultValue={form.categorie_id} onChange={(v) => onChange('categorie_id', v)} className={errors.categorie_id ? 'border-red-500' : ''} />
                {errors.categorie_id && <p className="mt-1 text-sm text-red-500">{errors.categorie_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix unitaire (CDF) <span className="text-red-500">*</span></label>
                <Input type="number" step="0.01" placeholder="0" value={form.prix_unitaire} onChange={(e) => onChange('prix_unitaire', e.target.value)} className={errors.prix_unitaire ? 'border-red-500' : ''} />
                {errors.prix_unitaire && <p className="mt-1 text-sm text-red-500">{errors.prix_unitaire}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unité de mesure <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: ml, mg, pièce" value={form.unite_mesure} onChange={(e) => onChange('unite_mesure', e.target.value)} className={errors.unite_mesure ? 'border-red-500' : ''} />
                {errors.unite_mesure && <p className="mt-1 text-sm text-red-500">{errors.unite_mesure}</p>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fournisseur</label>
                <Input type="text" placeholder="Ex: BioSupplies" value={form.fournisseur} onChange={(e) => onChange('fournisseur', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <Input type="text" placeholder="Description courte" value={form.description} onChange={(e) => onChange('description', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6">
              <Link to="/stocks/articles" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Création...</>) : (<><CheckLineIcon className="mr-2 h-4 w-4" />Créer</>)}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


