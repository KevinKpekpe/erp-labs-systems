import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { CheckLineIcon, PlusIcon } from "../../../icons";

interface StockRow { 
  id:number; 
  code:string; 
  quantite_actuelle:number; 
  quantite_actuelle_lots?: number;
  valeur_stock?: number;
  seuil_critique:number; 
  date_expiration?: string | null; 
  has_expired_lots?: boolean;
  has_near_expiration_lots?: boolean;
  article?: { id:number; nom_article:string };
  lots_overview?: {
    quantite_totale: number;
    nombre_lots: number;
    lots_expires: number;
    lots_proche_expiration: number;
  };
}
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
      const mapped: StockRow[] = (data as any[]).map((r:any) => ({ 
        id:Number(r.id), 
        code:String(r.code), 
        quantite_actuelle:Number(r.quantite_actuelle),
        quantite_actuelle_lots: r.quantite_actuelle_lots ? Number(r.quantite_actuelle_lots) : undefined,
        valeur_stock: r.valeur_stock ? Number(r.valeur_stock) : undefined,
        seuil_critique:Number(r.seuil_critique), 
        date_expiration: r.date_expiration ?? null,
        has_expired_lots: Boolean(r.has_expired_lots),
        has_near_expiration_lots: Boolean(r.has_near_expiration_lots),
        article: r.article ? { id:Number(r.article.id), nom_article:String(r.article.nom_article) } : undefined,
        lots_overview: r.lots_overview ? {
          quantite_totale: Number(r.lots_overview.quantite_totale || 0),
          nombre_lots: Number(r.lots_overview.nombre_lots || 0),
          lots_expires: Number(r.lots_overview.lots_expires || 0),
          lots_proche_expiration: Number(r.lots_overview.lots_proche_expiration || 0),
        } : undefined
      }));
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
            <Link to="/stocks/lots/dashboard" className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">Dashboard FIFO</Link>
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
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Code</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Article</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Quantité (Lots)</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Valeur</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Lots/Alertes</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{r.code}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{r.article?.nom_article ?? '-'}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{r.quantite_actuelle_lots ?? r.quantite_actuelle}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Seuil: {r.seuil_critique}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {r.valeur_stock ? (
                        <span className="font-medium text-gray-900 dark:text-gray-100">{Number(r.valeur_stock).toFixed(2)} €</span>
                      ) : <span className="text-gray-500 dark:text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {r.lots_overview && (
                          <span className="text-xs text-gray-600 dark:text-gray-400">{r.lots_overview.nombre_lots} lots</span>
                        )}
                        <div className="flex gap-1">
                          {r.has_expired_lots && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              Expirés
                            </span>
                          )}
                          {r.has_near_expiration_lots && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                              À surveiller
                            </span>
                          )}
                          {r.quantite_actuelle_lots !== undefined && r.quantite_actuelle_lots <= r.seuil_critique && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              Stock bas
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <Link to={`/stocks/stocks/${r.id}/lots`} className="text-brand-600 dark:text-brand-400 hover:underline text-xs">Voir lots</Link>
                        <Link to={`/stocks/stocks/${r.id}/add-lot`} className="text-emerald-600 dark:text-emerald-400 hover:underline text-xs">Nouveau lot</Link>
                        <Link to={`/stocks/stocks/${r.id}/consume`} className="text-orange-600 dark:text-orange-400 hover:underline text-xs">Consommer</Link>
                      </div>
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
