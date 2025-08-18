import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { PlusIcon, CalenderIcon } from "../../../icons";

interface StockLot {
  id: number;
  code: string;
  numero_lot?: string;
  quantite_initiale: number;
  quantite_restante: number;
  date_entree: string;
  date_expiration?: string;
  prix_unitaire_achat?: number;
  fournisseur_lot?: string;
  commentaire?: string;
  is_expired?: boolean;
  is_near_expiration?: boolean;
  pourcentage_consommation?: number;
}

interface Stock {
  id: number;
  code: string;
  article?: { id: number; nom_article: string };
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getErrorMessage(err: unknown): string {
  if (isObject(err) && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

export default function StockLotsList() {
  const { stockId } = useParams<{ stockId: string }>();
  const [stock, setStock] = useState<Stock | null>(null);
  const [lots, setLots] = useState<StockLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadStock = async () => {
    if (!stockId || isNaN(Number(stockId))) {
      setApiError('ID de stock invalide');
      return;
    }
    try {
      const resp = await apiFetch<any>(`/v1/stock/stocks/${stockId}`, { method: 'GET' }, 'company');
      const data = resp?.data || resp;
      setStock({
        id: Number(data.id),
        code: String(data.code),
        article: data.article ? {
          id: Number(data.article.id),
          nom_article: String(data.article.nom_article)
        } : undefined
      });
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  const loadLots = async () => {
    if (!stockId) return;
    setLoading(true);
    setApiError(null);
    try {
      const resp = await apiFetch<any>(`/v1/stock/stocks/${stockId}/lots?per_page=100`, { method: 'GET' }, 'company');
      const data = resp?.data?.data ?? (Array.isArray(resp) ? resp : []);
      const mapped: StockLot[] = (data as any[]).map((r: any) => ({
        id: Number(r.id),
        code: String(r.code),
        numero_lot: r.numero_lot ? String(r.numero_lot) : undefined,
        quantite_initiale: Number(r.quantite_initiale),
        quantite_restante: Number(r.quantite_restante),
        date_entree: String(r.date_entree),
        date_expiration: r.date_expiration ? String(r.date_expiration) : undefined,
        prix_unitaire_achat: r.prix_unitaire_achat ? Number(r.prix_unitaire_achat) : undefined,
        fournisseur_lot: r.fournisseur_lot ? String(r.fournisseur_lot) : undefined,
        commentaire: r.commentaire ? String(r.commentaire) : undefined,
        is_expired: Boolean(r.is_expired),
        is_near_expiration: Boolean(r.is_near_expiration),
        pourcentage_consommation: r.pourcentage_consommation ? Number(r.pourcentage_consommation) : undefined,
      }));
      setLots(mapped);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLot = async (lotId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce lot ? Il sera déplacé vers la corbeille.')) {
      return;
    }
    try {
      await apiFetch(`/v1/stock/lots/${lotId}`, { method: 'DELETE' }, 'company');
      await loadLots(); // Recharger la liste
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    loadStock();
    loadLots();
  }, [stockId]);

  if (!stockId || isNaN(Number(stockId))) {
    return <div>ID de stock manquant ou invalide</div>;
  }

  return (
    <>
      <Helmet><title>Lots - {stock?.article?.nom_article || 'Chargement...'} | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Lots - {stock?.article?.nom_article || 'Chargement...'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">Code stock: {stock?.code}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/stocks/lots-trashed" className="inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Corbeille
            </Link>
            <Link to={`/stocks/stocks/${stockId}/add-lot`} className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              <PlusIcon className="mr-2 h-4 w-4" />Nouveau lot
            </Link>
            <Link to={`/stocks/stocks/${stockId}/consume`} className="inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Consommer FIFO
            </Link>
            <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Retour
            </Link>
          </div>
        </div>

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
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Quantités</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Dates</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Prix/Fournisseur</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">État</th>
                  <th className="px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lots.map(lot => (
                  <tr key={lot.id} className={`border-b border-gray-100 dark:border-white/5 ${
                    lot.is_expired ? 'bg-red-50 dark:bg-red-900/10' : 
                    lot.is_near_expiration ? 'bg-orange-50 dark:bg-orange-900/10' : ''
                  }`}>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{lot.code}</span>
                        {lot.numero_lot && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">N°: {lot.numero_lot}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {lot.quantite_restante} / {lot.quantite_initiale}
                        </span>
                        {lot.pourcentage_consommation !== undefined && (
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-1">
                            <div 
                              className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full" 
                              style={{ width: `${lot.pourcentage_consommation}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                          <CalenderIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-600 dark:text-gray-400">Entrée: {new Date(lot.date_entree).toLocaleDateString()}</span>
                        </div>
                        {lot.date_expiration && (
                          <div className="flex items-center gap-1">
                            <CalenderIcon className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                            <span className={`text-xs ${
                              lot.is_expired ? 'text-red-600 dark:text-red-400 font-medium' : 
                              lot.is_near_expiration ? 'text-orange-600 dark:text-orange-400 font-medium' : 'text-gray-600 dark:text-gray-400'
                            }`}>
                              Exp: {new Date(lot.date_expiration).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col">
                        {lot.prix_unitaire_achat && (
                          <span className="font-medium text-gray-900 dark:text-gray-100">{lot.prix_unitaire_achat.toFixed(2)} €</span>
                        )}
                        {lot.fournisseur_lot && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{lot.fournisseur_lot}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        {lot.quantite_restante === 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                            Épuisé
                          </span>
                        )}
                        {lot.is_expired && lot.quantite_restante > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            Expiré
                          </span>
                        )}
                        {lot.is_near_expiration && !lot.is_expired && lot.quantite_restante > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                            À surveiller
                          </span>
                        )}
                        {!lot.is_expired && !lot.is_near_expiration && lot.quantite_restante > 0 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            Disponible
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex flex-col gap-1">
                        <Link 
                          to={`/stocks/lots/${lot.id}`} 
                          className="text-brand-600 dark:text-brand-400 hover:underline text-xs"
                        >
                          Détails
                        </Link>
                        <Link 
                          to={`/stocks/lots/${lot.id}/edit`} 
                          className="text-amber-600 dark:text-amber-400 hover:underline text-xs"
                        >
                          Modifier
                        </Link>
                        <button
                          onClick={() => handleDeleteLot(lot.id)}
                          className={`text-xs text-left hover:underline ${
                            lot.quantite_restante > 0 
                              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                              : 'text-red-600 dark:text-red-400 cursor-pointer'
                          }`}
                          disabled={lot.quantite_restante > 0}
                          title={lot.quantite_restante > 0 ? "Impossible de supprimer un lot avec du stock restant" : "Supprimer ce lot"}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {lots.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                      Aucun lot trouvé
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
