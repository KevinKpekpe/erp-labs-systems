import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { CalenderIcon, AlertIcon, CheckCircleIcon, CloseIcon } from "../../../icons";

interface ExpiredLot {
  id: number;
  code: string;
  numero_lot?: string;
  quantite_restante: number;
  date_expiration: string;
  article?: { id: number; nom_article: string };
}

interface NearExpirationLot extends ExpiredLot {}

interface StockValueStats {
  total_lots: number;
  total_quantity: number;
  total_value: number;
  average_unit_price: number;
  lots_with_expiration: number;
  expired_lots: number;
  near_expiration_lots: number;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getErrorMessage(err: unknown): string {
  if (isObject(err) && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

export default function FifoDashboard() {
  const [expiredLots, setExpiredLots] = useState<ExpiredLot[]>([]);
  const [nearExpirationLots, setNearExpirationLots] = useState<NearExpirationLot[]>([]);
  const [stockValueStats, setStockValueStats] = useState<StockValueStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      // Charger les données en parallèle
      const [expiredResp, nearExpirationResp, statsResp] = await Promise.all([
        apiFetch<any>('/v1/stock/lots-expired?per_page=20', { method: 'GET' }, 'company'),
        apiFetch<any>('/v1/stock/lots-near-expiration?days=30&per_page=20', { method: 'GET' }, 'company'),
        apiFetch<any>('/v1/stock/lots-value', { method: 'GET' }, 'company'),
      ]);

      // Traiter les lots expirés
      const expiredData = expiredResp?.data?.data ?? (Array.isArray(expiredResp) ? expiredResp : []);
      const mappedExpired: ExpiredLot[] = (expiredData as any[]).map((r: any) => ({
        id: Number(r.id),
        code: String(r.code),
        numero_lot: r.numero_lot ? String(r.numero_lot) : undefined,
        quantite_restante: Number(r.quantite_restante),
        date_expiration: String(r.date_expiration),
        article: r.article ? {
          id: Number(r.article.id),
          nom_article: String(r.article.nom_article)
        } : undefined
      }));
      setExpiredLots(mappedExpired);

      // Traiter les lots proches expiration
      const nearExpirationData = nearExpirationResp?.data?.data ?? (Array.isArray(nearExpirationResp) ? nearExpirationResp : []);
      const mappedNearExpiration: NearExpirationLot[] = (nearExpirationData as any[]).map((r: any) => ({
        id: Number(r.id),
        code: String(r.code),
        numero_lot: r.numero_lot ? String(r.numero_lot) : undefined,
        quantite_restante: Number(r.quantite_restante),
        date_expiration: String(r.date_expiration),
        article: r.article ? {
          id: Number(r.article.id),
          nom_article: String(r.article.nom_article)
        } : undefined
      }));
      setNearExpirationLots(mappedNearExpiration);

      // Traiter les statistiques
      const stats = statsResp?.data ?? statsResp;
      if (stats) {
        setStockValueStats({
          total_lots: Number(stats.total_lots || 0),
          total_quantity: Number(stats.total_quantity || 0),
          total_value: Number(stats.total_value || 0),
          average_unit_price: Number(stats.average_unit_price || 0),
          lots_with_expiration: Number(stats.lots_with_expiration || 0),
          expired_lots: Number(stats.expired_lots || 0),
          near_expiration_lots: Number(stats.near_expiration_lots || 0),
        });
      }

    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getDaysUntilExpiration = (expirationDate: string): number => {
    const expDate = new Date(expirationDate);
    const today = new Date();
    const diffTime = expDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <>
      <Helmet><title>Dashboard FIFO - Gestion des Lots | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Dashboard FIFO - Surveillance des Lots</h2>
          <div className="flex items-center gap-2">
            <Link to="/stocks/lots-trashed" className="inline-flex items-center justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Corbeille
            </Link>
            <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90">
              Retour aux stocks
            </Link>
            <button 
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Actualisation...' : 'Actualiser'}
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        {/* Statistiques générales */}
        {stockValueStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lots</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{stockValueStats.total_lots}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quantité Totale</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{stockValueStats.total_quantity}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Valeur Totale</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(stockValueStats.total_value)}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-emerald-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prix Moyen</p>
                  <p className="text-2xl font-bold text-black dark:text-white">{formatCurrency(stockValueStats.average_unit_price)}</p>
                </div>
                <CheckCircleIcon className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {/* Alertes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-400">Lots Expirés</h3>
              <CloseIcon className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-3xl font-bold text-red-600">{stockValueStats?.expired_lots || 0}</div>
            <p className="text-sm text-red-700 dark:text-red-300">Nécessitent une action immédiate</p>
          </div>

          <div className="rounded-2xl border border-orange-200 bg-orange-50 p-6 dark:border-orange-800 dark:bg-orange-900/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-400">Expirent Bientôt</h3>
              <AlertIcon className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-600">{stockValueStats?.near_expiration_lots || 0}</div>
            <p className="text-sm text-orange-700 dark:text-orange-300">Dans les 30 prochains jours</p>
          </div>

          <div className="rounded-2xl border border-green-200 bg-green-50 p-6 dark:border-green-800 dark:bg-green-900/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-400">Avec Expiration</h3>
              <CalenderIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-600">{stockValueStats?.lots_with_expiration || 0}</div>
            <p className="text-sm text-green-700 dark:text-green-300">Lots avec date d'expiration</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Lots expirés */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold mb-4 text-red-600">⚠️ Lots Expirés ({expiredLots.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {expiredLots.map(lot => (
                <div key={lot.id} className="p-3 bg-red-50 border border-red-200 rounded-md dark:bg-red-900/10 dark:border-red-800">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{lot.code}</span>
                        {lot.numero_lot && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">N°: {lot.numero_lot}</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{lot.article?.nom_article}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span>Quantité: {lot.quantite_restante}</span>
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Expiré depuis {Math.abs(getDaysUntilExpiration(lot.date_expiration))} jour(s)
                        </span>
                      </div>
                    </div>
                    <Link 
                      to={`/stocks/lots/${lot.id}`}
                      className="text-xs text-brand-600 hover:underline"
                    >
                      Voir
                    </Link>
                  </div>
                </div>
              ))}
              {expiredLots.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  🎉 Aucun lot expiré !
                </div>
              )}
            </div>
          </div>

          {/* Lots proches expiration */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">⏰ Lots Proches Expiration ({nearExpirationLots.length})</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {nearExpirationLots.map(lot => {
                const daysUntilExpiration = getDaysUntilExpiration(lot.date_expiration);
                const isUrgent = daysUntilExpiration <= 7;
                
                return (
                  <div key={lot.id} className={`p-3 border rounded-md ${
                    isUrgent ? 'bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800' : 'bg-orange-50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-800'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{lot.code}</span>
                          {lot.numero_lot && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">N°: {lot.numero_lot}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{lot.article?.nom_article}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-600 dark:text-gray-400">
                          <span>Quantité: {lot.quantite_restante}</span>
                          <span className={`font-medium ${isUrgent ? 'text-red-600 dark:text-red-400' : 'text-orange-600 dark:text-orange-400'}`}>
                            {daysUntilExpiration > 0 ? `Dans ${daysUntilExpiration} jour(s)` : 'Expire aujourd\'hui'}
                          </span>
                        </div>
                      </div>
                      <Link 
                        to={`/stocks/lots/${lot.id}`}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        Voir
                      </Link>
                    </div>
                  </div>
                );
              })}
              {nearExpirationLots.length === 0 && (
                <div className="text-center py-6 text-sm text-gray-500">
                  ✅ Aucun lot proche de l'expiration !
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions recommandées */}
        <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
          <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-400">💡 Actions Recommandées</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-md border border-blue-200 dark:bg-gray-800 dark:border-blue-700">
              <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Lots Expirés</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Vérifiez si ces lots peuvent encore être utilisés ou doivent être écartés.
              </p>
              <Link to="/stocks/lots?expired_only=true" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Voir tous les lots expirés →
              </Link>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-blue-200 dark:bg-gray-800 dark:border-blue-700">
              <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Rotation FEFO</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Utilisez la méthode FEFO pour prioriser les lots proches expiration.
              </p>
              <Link to="/stocks/stocks" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Consommer en FEFO →
              </Link>
            </div>
            
            <div className="bg-white p-4 rounded-md border border-blue-200 dark:bg-gray-800 dark:border-blue-700">
              <h4 className="font-medium text-sm mb-2 text-gray-900 dark:text-gray-100">Surveillance</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Configurez des alertes automatiques pour les expirations.
              </p>
              <Link to="/stocks/alerts" className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                Gérer les alertes →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
