import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { TrashBinIcon, CheckLineIcon, CloseIcon } from "../../../icons";

interface TrashedLot {
  id: number;
  code: string;
  numero_lot?: string;
  quantite_initiale: number;
  quantite_restante: number;
  date_entree: string;
  date_expiration?: string;
  prix_unitaire_achat?: number;
  fournisseur_lot?: string;
  deleted_at: string;
  article?: { id: number; nom_article: string };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getErrorMessage(err: unknown): string {
  if (isObject(err) && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

export default function StockLotsTrashed() {
  const location = useLocation();
  const flashSuccess = (location.state as any)?.success as string | undefined;
  const [lots, setLots] = useState<TrashedLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadTrashedLots = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const resp = await apiFetch<any>('/v1/stock/lots-trashed?per_page=100', { method: 'GET' }, 'company');
      const data = resp?.data?.data ?? (Array.isArray(resp) ? resp : []);
      const mapped: TrashedLot[] = (data as any[]).map((r: any) => ({
        id: Number(r.id),
        code: String(r.code),
        numero_lot: r.numero_lot ? String(r.numero_lot) : undefined,
        quantite_initiale: Number(r.quantite_initiale),
        quantite_restante: Number(r.quantite_restante),
        date_entree: String(r.date_entree),
        date_expiration: r.date_expiration ? String(r.date_expiration) : undefined,
        prix_unitaire_achat: r.prix_unitaire_achat ? Number(r.prix_unitaire_achat) : undefined,
        fournisseur_lot: r.fournisseur_lot ? String(r.fournisseur_lot) : undefined,
        deleted_at: String(r.deleted_at),
        article: r.article ? {
          id: Number(r.article.id),
          nom_article: String(r.article.nom_article)
        } : undefined
      }));
      setLots(mapped);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiFetch(`/v1/stock/lots/${id}/restore`, { method: 'POST' }, 'company');
      await loadTrashedLots(); // Recharger la liste
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  const handleForceDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer définitivement ce lot ? Cette action est irréversible.')) {
      return;
    }
    try {
      await apiFetch(`/v1/stock/lots/${id}/force`, { method: 'DELETE' }, 'company');
      await loadTrashedLots(); // Recharger la liste
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    loadTrashedLots();
  }, []);

  return (
    <>
      <Helmet><title>Corbeille des Lots | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Corbeille des Lots</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Lots supprimés pouvant être restaurés</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/stocks/lots/dashboard" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Dashboard FIFO
            </Link>
            <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Retour aux stocks
            </Link>
          </div>
        </div>

        {flashSuccess && (
          <div className="mb-6">
            <Alert variant="success" title="Succès" message={flashSuccess} />
          </div>
        )}

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-100 dark:bg-white/5 text-left">
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Code/N° Lot</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Article</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Quantités</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Dates</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Supprimé le</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lots.map(lot => (
                  <tr key={lot.id} className="border-b border-gray-100 dark:border-white/5">
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{lot.code}</span>
                        {lot.numero_lot && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">N°: {lot.numero_lot}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-gray-900 dark:text-gray-100">{lot.article?.nom_article}</span>
                      {lot.fournisseur_lot && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Fournisseur: {lot.fournisseur_lot}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col text-gray-700 dark:text-gray-300">
                        <span>Restante: {lot.quantite_restante}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          Initiale: {lot.quantite_initiale}
                        </span>
                        {lot.prix_unitaire_achat && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            Prix: {lot.prix_unitaire_achat.toFixed(2)} €
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col text-gray-700 dark:text-gray-300">
                        <span className="text-xs">
                          Entrée: {new Date(lot.date_entree).toLocaleDateString()}
                        </span>
                        {lot.date_expiration && (
                          <span className="text-xs">
                            Exp: {new Date(lot.date_expiration).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(lot.deleted_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRestore(lot.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400 dark:hover:bg-green-900/30"
                        >
                          <CheckLineIcon className="w-3 h-3 mr-1" />
                          Restaurer
                        </button>
                        <button
                          onClick={() => handleForceDelete(lot.id)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
                        >
                          <CloseIcon className="w-3 h-3 mr-1" />
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lots.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <TrashBinIcon className="w-8 h-8 text-gray-400" />
                        <span>Aucun lot dans la corbeille</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
