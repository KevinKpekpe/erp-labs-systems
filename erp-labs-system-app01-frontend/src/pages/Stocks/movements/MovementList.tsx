import { useEffect, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import { CalenderIcon, ArrowUpIcon, ArrowDownIcon, TrashBinIcon, PencilIcon } from "../../../icons";

interface Movement {
  id: number;
  stock_id: number;
  stock_lot_id?: number;
  type_mouvement: 'entrée' | 'sortie' | 'ajustement' | 'retour' | 'transfert' | 'consommation';
  quantite_mouvement: number;
  prix_unitaire_mouvement?: number;
  date_mouvement: string;
  motif?: string;
  reference_document?: string;
  user_id: number;
  created_at: string;
  stock?: {
    id: number;
    article: {
      nom_article: string;
      categorie?: {
        nom_categorie: string;
        type_laboratoire?: string;
      };
    };
  };
  stock_lot?: {
    id: number;
    code: string;
    numero_lot: string;
    date_expiration?: string;
  };
  user?: {
    name: string;
  };
}

interface Filters {
  search: string;
  type_mouvement: string;
  date_debut: string;
  date_fin: string;
  stock_id: string;
  lot_id: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function MovementList() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [showTrashed, setShowTrashed] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type_mouvement: "",
    date_debut: "",
    date_fin: "",
    stock_id: "",
    lot_id: "",
  });

  const loadMovements = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.type_mouvement) params.append('type', filters.type_mouvement);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (filters.stock_id) params.append('stock_id', filters.stock_id);
      if (filters.lot_id) params.append('lot_id', filters.lot_id);
      if (showTrashed) params.append('trashed', '1');
      params.append('per_page', '50');
      params.append('with_relations', '1');

      const url = `/v1/stock/movements?${params.toString()}`;
      const resp = await apiFetch<{ data: { data: Movement[] } }>(url, { method: 'GET' }, 'company');
      const data = resp?.data?.data ?? (Array.isArray(resp) ? resp : []);
      setMovements(data as Movement[]);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovements();
  }, [showTrashed, filters]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type_mouvement: "",
      date_debut: "",
      date_fin: "",
      stock_id: "",
      lot_id: "",
    });
  };

  const getMovementTypeIcon = (type: string) => {
    switch (type) {
      case 'entrée':
      case 'retour':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'sortie':
      case 'consommation':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      default:
        return <CalenderIcon className="h-4 w-4 text-blue-500" />;
    }
  };

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'entrée':
      case 'retour':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sortie':
      case 'consommation':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'ajustement':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'transfert':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => value !== "").length;
  }, [filters]);

  return (
    <>
      <Helmet><title>Mouvements de stock | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Mouvements de stock</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTrashed(v => !v)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {showTrashed ? 'Voir actifs' : 'Corbeille'}
            </button>
          </div>
        </div>

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        {/* Filtres */}
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
                onClick={clearFilters}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >
                Effacer les filtres
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Recherche
              </label>
              <Input
                type="text"
                placeholder="Article, motif, référence..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type de mouvement
              </label>
              <select
                value={filters.type_mouvement}
                onChange={(e) => handleFilterChange('type_mouvement', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">Tous les types</option>
                <option value="entrée">Entrée</option>
                <option value="sortie">Sortie</option>
                <option value="consommation">Consommation</option>
                <option value="ajustement">Ajustement</option>
                <option value="retour">Retour</option>
                <option value="transfert">Transfert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date début
              </label>
              <Input
                type="date"
                value={filters.date_debut}
                onChange={(e) => handleFilterChange('date_debut', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date fin
              </label>
              <Input
                type="date"
                value={filters.date_fin}
                onChange={(e) => handleFilterChange('date_fin', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Stock
              </label>
              <Input
                type="number"
                placeholder="ID du stock"
                value={filters.stock_id}
                onChange={(e) => handleFilterChange('stock_id', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                ID Lot
              </label>
              <Input
                type="number"
                placeholder="ID du lot"
                value={filters.lot_id}
                onChange={(e) => handleFilterChange('lot_id', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tableau des mouvements */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Date</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Type</th>
                  <th className="min-w-[200px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Article</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Lot</th>
                  <th className="min-w-[80px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-end">Quantité</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-end">Prix unit.</th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Motif</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Utilisateur</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr>
                    <td className="py-8 px-4" colSpan={9}>
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td className="py-8 px-4 text-center text-gray-500 dark:text-gray-400" colSpan={9}>
                      Aucun mouvement trouvé
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="py-5 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {formatDate(movement.date_mouvement)}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400">
                            {formatDateTime(movement.created_at)}
                          </p>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center gap-2">
                          {getMovementTypeIcon(movement.type_mouvement)}
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementTypeColor(movement.type_mouvement)}`}>
                            {movement.type_mouvement}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {movement.stock?.article.nom_article || 'Article supprimé'}
                          </p>
                          {movement.stock?.article.categorie && (
                            <p className="text-gray-500 dark:text-gray-400">
                              {movement.stock.article.categorie.nom_categorie}
                              {movement.stock.article.categorie.type_laboratoire && (
                                <span className="ml-1 text-blue-600 dark:text-blue-400">
                                  ({movement.stock.article.categorie.type_laboratoire})
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        {movement.stock_lot ? (
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {movement.stock_lot.code}
                            </p>
                            <p className="text-gray-500 dark:text-gray-400">
                              {movement.stock_lot.numero_lot}
                            </p>
                            {movement.stock_lot.date_expiration && (
                              <p className="text-xs text-orange-600 dark:text-orange-400">
                                Exp: {formatDate(movement.stock_lot.date_expiration)}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="py-5 px-4 text-end">
                        <span className={`font-medium ${
                          movement.type_mouvement === 'entrée' || movement.type_mouvement === 'retour'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {movement.type_mouvement === 'entrée' || movement.type_mouvement === 'retour' ? '+' : '-'}
                          {movement.quantite_mouvement}
                        </span>
                      </td>
                      <td className="py-5 px-4 text-end">
                        <span className="text-gray-900 dark:text-gray-100">
                          {formatCurrency(movement.prix_unitaire_mouvement)}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="text-sm">
                          {movement.motif && (
                            <p className="text-gray-900 dark:text-gray-100 mb-1">{movement.motif}</p>
                          )}
                          {movement.reference_document && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs">
                              Réf: {movement.reference_document}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {movement.user?.name || 'Utilisateur supprimé'}
                        </span>
                      </td>
                      <td className="py-5 px-4">
                        <div className="flex items-center space-x-3.5">
                          {!showTrashed ? (
                            <>
                              <Link
                                to={`/stocks/movements/${movement.id}`}
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-brand-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 transition-colors"
                                title="Voir détails"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </Link>
                              <button
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-red-400 transition-colors"
                                title="Supprimer"
                              >
                                <TrashBinIcon className="h-5 w-5" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="text-sm text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300">
                                Restaurer
                              </button>
                              <button className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300">
                                Supprimer définitivement
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
