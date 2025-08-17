import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { CheckLineIcon, PlusIcon } from "../../../icons";

interface StockRow { id:number; code:string; quantite_actuelle:number; seuil_critique:number; date_expiration?: string | null; article?: { id:number; nom_article:string } }
function isObject(v:unknown): v is Record<string, unknown> { return typeof v==='object' && v!==null }
function getErrorMessage(err: unknown): string { if (isObject(err) && 'message' in err) return String((err as any).message || ''); return 'Une erreur est survenue.'; }

export default function StockList() {
  const location = useLocation();
  const flashSuccess = (location.state as any)?.success as string | undefined;
  const [rows, setRows] = useState<StockRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string|null>(null);

  const load = async () => {
    setLoading(true); setApiError(null);
    try {
      const resp = await apiFetch<any>(`/v1/stock/stocks?per_page=100`, { method:'GET' }, 'company');
      const data = (resp as any)?.data?.data ?? (Array.isArray(resp) ? resp : []);
      const mapped: StockRow[] = (data as any[]).map((r:any) => ({ id:Number(r.id), code:String(r.code), quantite_actuelle:Number(r.quantite_actuelle), seuil_critique:Number(r.seuil_critique), date_expiration: r.date_expiration ?? null, article: r.article ? { id:Number(r.article.id), nom_article:String(r.article.nom_article) } : undefined }));
      setRows(mapped);
    } catch (e) { setApiError(getErrorMessage(e)); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <Helmet><title>Stocks | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Gestion des stocks</h2>
          <div className="flex items-center gap-2">
            <Link to="/stocks/stocks/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"><PlusIcon className="mr-2 h-4 w-4" />Nouveau</Link>
          </div>
        </div>

        {flashSuccess && (<div className="mb-6"><Alert variant="success" title="Succès" message={flashSuccess} /></div>)}
        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-white/5 text-left">
                  <th className="px-4 py-3 text-sm font-medium">Code</th>
                  <th className="px-4 py-3 text-sm font-medium">Article</th>
                  <th className="px-4 py-3 text-sm font-medium">Quantité</th>
                  <th className="px-4 py-3 text-sm font-medium">Seuil critique</th>
                  <th className="px-4 py-3 text-sm font-medium">Date d'expiration</th>
                  <th className="px-4 py-3 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="px-4 py-3 text-sm">{r.code}</td>
                    <td className="px-4 py-3 text-sm">{r.article?.nom_article ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">{r.quantite_actuelle}</td>
                    <td className="px-4 py-3 text-sm">{r.seuil_critique}</td>
                    <td className="px-4 py-3 text-sm">{r.date_expiration ? new Date(r.date_expiration).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <Link to={`/stocks/stocks/${r.id}/modifier`} className="text-brand-600 hover:underline mr-4">Modifier</Link>
                      <Link to={`/stocks/stocks/${r.id}/add`} className="text-emerald-600 hover:underline">Ajouter du stock</Link>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && !loading && (
                  <tr><td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">Aucun stock</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
