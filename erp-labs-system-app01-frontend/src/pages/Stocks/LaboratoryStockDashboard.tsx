import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { apiFetch } from "../../lib/apiClient";
import Alert from "../../components/ui/alert/Alert";
import { 
  AlertIcon, 
  CalenderIcon, 
  BoxIcon as TruckIcon,
  PieChartIcon as ChartIcon,
  CloseIcon,
  BoltIcon as ThermometerIcon,
  TestTubeIcon as BeakerIcon,
  InfoIcon as DropletIcon
} from "../../icons";

interface DashboardData {
  stocks_overview: {
    total_stocks: number;
    total_valeur: number;
    stocks_critiques: number;
    stocks_expires: number;
    stocks_proche_expiration: number;
  };
  lots_overview: {
    total_lots: number;
    lots_expires: number;
    lots_proche_expiration: number;
    chaine_froid_critique: number;
  };
  categories_overview: {
    total_categories: number;
    reactifs: number;
    consommables: number;
    equipements: number;
    controles: number;
  };
  alertes_critiques: {
    id: number;
    type: 'expiration' | 'stock_faible' | 'chaine_froid';
    titre: string;
    message: string;
    priorite: 'haute' | 'moyenne' | 'faible';
    date_creation: string;
  }[];
  stocks_expires: {
    id: number;
    code: string;
    article: { nom_article: string };
    quantite_restante: number;
    date_expiration: string;
    type_laboratoire?: string;
  }[];
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

export default function LaboratoryStockDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setApiError(null);
    try {
      // Pour l'instant, simulons les données du dashboard
      // En production, cela viendrait d'une API dédiée
      const [stocksResp, lotsResp, categoriesResp] = await Promise.all([
        apiFetch<any>('/v1/stock/stocks?per_page=100', { method: 'GET' }, 'company'),
        apiFetch<any>('/v1/stock/lots-expired?per_page=10', { method: 'GET' }, 'company'),
        apiFetch<any>('/v1/stock/categories?per_page=100', { method: 'GET' }, 'company'),
      ]);

      const stocks = stocksResp?.data?.data ?? [];
      const lotsExpires = lotsResp?.data?.data ?? [];
      const categories = categoriesResp?.data?.data ?? [];

      // Calculs des métriques
      const totalValeur = stocks.reduce((sum: number, stock: any) => 
        sum + (stock.valeur_stock || 0), 0);
      
      const stocksCritiques = stocks.filter((stock: any) => 
        (stock.quantite_actuelle_lots || stock.quantite_actuelle) <= stock.seuil_critique).length;

      const stocksExpires = stocks.filter((stock: any) => 
        stock.has_expired_lots || new Date(stock.date_expiration) < new Date()).length;

      const stocksProcheExpiration = stocks.filter((stock: any) => 
        stock.has_near_expiration_lots).length;

      const categoriesParType = categories.reduce((acc: any, cat: any) => {
        const type = cat.type_laboratoire || 'autre';
        acc[type.toLowerCase()] = (acc[type.toLowerCase()] || 0) + 1;
        return acc;
      }, {});

      // Construction des alertes critiques
      const alertesCritiques = [
        ...(stocksExpires > 0 ? [{
          id: 1,
          type: 'expiration' as const,
          titre: 'Lots expirés détectés',
          message: `${stocksExpires} stock(s) avec des lots expirés nécessitent une attention immédiate`,
          priorite: 'haute' as const,
          date_creation: new Date().toISOString(),
        }] : []),
        ...(stocksCritiques > 0 ? [{
          id: 2,
          type: 'stock_faible' as const,
          titre: 'Stocks critiques',
          message: `${stocksCritiques} stock(s) sous le seuil critique`,
          priorite: 'moyenne' as const,
          date_creation: new Date().toISOString(),
        }] : []),
      ];

      const dashboardData: DashboardData = {
        stocks_overview: {
          total_stocks: stocks.length,
          total_valeur: totalValeur,
          stocks_critiques: stocksCritiques,
          stocks_expires: stocksExpires,
          stocks_proche_expiration: stocksProcheExpiration,
        },
        lots_overview: {
          total_lots: stocks.reduce((sum: number, stock: any) => 
            sum + (stock.lots_overview?.nombre_lots || 0), 0),
          lots_expires: stocks.reduce((sum: number, stock: any) => 
            sum + (stock.lots_overview?.lots_expires || 0), 0),
          lots_proche_expiration: stocks.reduce((sum: number, stock: any) => 
            sum + (stock.lots_overview?.lots_proche_expiration || 0), 0),
          chaine_froid_critique: categories.filter((cat: any) => cat.chaine_froid_critique).length,
        },
        categories_overview: {
          total_categories: categories.length,
          reactifs: categoriesParType['réactifs'] || 0,
          consommables: categoriesParType['consommables'] || 0,
          equipements: categoriesParType['équipements'] || 0,
          controles: categoriesParType['contrôles'] || 0,
        },
        alertes_critiques: alertesCritiques,
        stocks_expires: lotsExpires.slice(0, 5).map((lot: any) => ({
          id: lot.id,
          code: lot.code,
          article: { nom_article: lot.article?.nom_article || 'Article inconnu' },
          quantite_restante: lot.quantite_restante,
          date_expiration: lot.date_expiration,
          type_laboratoire: lot.article?.categorie?.type_laboratoire,
        })),
      };

      setData(dashboardData);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'haute': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'moyenne': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Dashboard Laboratoire | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Dashboard Laboratoire</h2>
          <div className="flex items-center gap-3">
            <Link 
              to="/stocks/lots/dashboard" 
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Dashboard FIFO
            </Link>
            <button 
              onClick={loadDashboardData}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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

        {data && (
          <>
            {/* Alertes critiques */}
            {data.alertes_critiques.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">🚨 Alertes critiques</h3>
                <div className="space-y-3">
                  {data.alertes_critiques.map(alerte => (
                    <div key={alerte.id} className={`p-4 rounded-lg border ${getPriorityColor(alerte.priorite)}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium">{alerte.titre}</h4>
                          <p className="text-sm mt-1">{alerte.message}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">
                            {new Date(alerte.date_creation).toLocaleDateString()}
                          </span>
                          {alerte.type === 'expiration' && (
                            <Link 
                              to="/stocks/lots/dashboard" 
                              className="text-sm underline hover:no-underline"
                            >
                              Voir les lots expirés
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Métriques principales */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Valeur totale */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <ChartIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="mt-4">
                  <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                    {formatCurrency(data.stocks_overview.total_valeur)}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur totale du stock</p>
                </div>
              </div>

              {/* Stocks critiques */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="mt-4">
                  <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                    {data.stocks_overview.stocks_critiques}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Stocks critiques</p>
                </div>
              </div>

              {/* Lots expirés */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                  <CalenderIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="mt-4">
                  <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                    {data.lots_overview.lots_expires}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Lots expirés</p>
                </div>
              </div>

              {/* Chaîne du froid */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
                <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ThermometerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="mt-4">
                  <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                    {data.lots_overview.chaine_froid_critique}
                  </h4>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Catégories chaîne froid</p>
                </div>
              </div>
            </div>

            {/* Vue d'ensemble des catégories */}
            <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Répartition par type</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <BeakerIcon className="h-4 w-4 text-blue-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Réactifs</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {data.categories_overview.reactifs}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TruckIcon className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Consommables</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {data.categories_overview.consommables}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DropletIcon className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Contrôles</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {data.categories_overview.controles}
                    </span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Link 
                    to="/stocks/categories/laboratory" 
                    className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Gérer les catégories →
                  </Link>
                </div>
              </div>

              {/* Stocks nécessitant une attention */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Stocks expirés récents</h3>
                {data.stocks_expires.length > 0 ? (
                  <div className="space-y-3">
                    {data.stocks_expires.map(stock => (
                      <div key={stock.id} className="flex items-start justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-md">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{stock.code}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{stock.article.nom_article}</p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            Expiré le {new Date(stock.date_expiration).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {stock.quantite_restante} restant
                        </span>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Link 
                        to="/stocks/lots/dashboard" 
                        className="text-sm text-brand-600 dark:text-brand-400 hover:underline"
                      >
                        Voir tous les lots expirés →
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun stock expiré</p>
                )}
              </div>
            </div>

            {/* Actions rapides */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-900/10">
              <h3 className="text-lg font-semibold mb-4 text-blue-800 dark:text-blue-400">⚡ Actions rapides</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  to="/stocks/categories/laboratory/new"
                  className="p-4 bg-white rounded-md border border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-blue-700 text-center"
                >
                  <BeakerIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Nouvelle catégorie</p>
                </Link>
                <Link
                  to="/stocks/stocks"
                  className="p-4 bg-white rounded-md border border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-blue-700 text-center"
                >
                  <TruckIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Gérer les stocks</p>
                </Link>
                <Link
                  to="/stocks/lots/dashboard"
                  className="p-4 bg-white rounded-md border border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-blue-700 text-center"
                >
                  <CalenderIcon className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Dashboard FIFO</p>
                </Link>
                <Link
                  to="/stocks/lots-trashed"
                  className="p-4 bg-white rounded-md border border-blue-200 hover:border-blue-300 dark:bg-gray-800 dark:border-blue-700 text-center"
                >
                  <CloseIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Corbeille</p>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
