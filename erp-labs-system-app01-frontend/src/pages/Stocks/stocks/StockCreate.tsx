import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { ChevronLeftIcon, CheckLineIcon } from "../../../icons";

type ArticleDto = { id:number; nom_article:string };
interface ArticleOption { value:string; label:string }
function isObject(v: unknown): v is Record<string, unknown> { return typeof v==='object' && v!==null }
function getErrorMessage(err:unknown):string { if (isObject(err) && 'message' in err) return String((err as any).message||''); return 'Une erreur est survenue.'; }
function extractArticles(resp: unknown): ArticleDto[] { const root = (resp as { data?: unknown })?.data ?? resp; const arr = isObject(root) && Array.isArray((root as any).data) ? (root as any).data as unknown[] : Array.isArray(root) ? root as unknown[] : []; return arr.filter(isObject).map(r => ({ id: Number((r as any).id ?? 0), nom_article: String((r as any).nom_article ?? '') })); }

export default function StockCreate(){
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleOption[]>([]);
  const [form, setForm] = useState({ article_id: '', quantite_actuelle: '', seuil_critique: '', date_expiration: '' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [apiError, setApiError] = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { (async () => { try { const res = await apiFetch<unknown>("/v1/stock/articles?per_page=100", { method:'GET' }, 'company'); const arr = extractArticles(res); setArticles(arr.map((a)=>({ value: String(a.id), label: String(a.nom_article) }))); } catch { /* noop */ } })(); }, []);

  const onChange = (field: string, value: string) => { setForm(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };
  const validate = () => { const e: Record<string,string> = {}; if (!form.article_id) e.article_id = 'Article requis'; if (!form.seuil_critique) e.seuil_critique = 'Seuil requis'; setErrors(e); return Object.keys(e).length===0; };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setApiError(null); if (!validate()) return; setSubmitting(true);
    try {
      await apiFetch('/v1/stock/stocks', { method:'POST', body: JSON.stringify({ article_id: Number(form.article_id), quantite_actuelle: form.quantite_actuelle? Number(form.quantite_actuelle): undefined, seuil_critique: Number(form.seuil_critique), date_expiration: form.date_expiration || undefined }) }, 'company');
      navigate('/stocks/stocks', { state: { success: 'Stock créé avec succès.' } });
    } catch (err) { setApiError(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Nouveau stock | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouveau stock</h2>
        </div>

        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Article <span className="text-red-500">*</span></label>
                <Select options={articles} placeholder="Sélectionner" defaultValue={form.article_id} onChange={(v)=>onChange('article_id', v)} className={errors.article_id? 'border-red-500':''} />
                {errors.article_id && <p className="mt-1 text-sm text-red-500">{errors.article_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantité initiale</label>
                <Input type="number" placeholder="0" value={form.quantite_actuelle} onChange={(e)=>onChange('quantite_actuelle', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Seuil critique <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={form.seuil_critique} onChange={(e)=>onChange('seuil_critique', e.target.value)} className={errors.seuil_critique? 'border-red-500':''} />
                {errors.seuil_critique && <p className="mt-1 text-sm text-red-500">{errors.seuil_critique}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date d'expiration (optionnelle)</label>
                <Input type="date" value={form.date_expiration} onChange={(e)=>onChange('date_expiration', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Création...</>) : (<><CheckLineIcon className="mr-2 h-4 w-4" />Créer</>)}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
