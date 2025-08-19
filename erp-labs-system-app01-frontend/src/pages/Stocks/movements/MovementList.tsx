import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import { CalenderIcon, CheckCircleIcon, TrashBinIcon, CloseIcon, ArrowUpIcon, ArrowDownIcon } from "../../../icons";

interface StockMovement {
  id: number;
  code: string;
  stock_id: number;
  stock_lot_id?: number;
  date_mouvement: string;
  quantite: number;
  type_mouvement: 'Entrée' | 'Sortie';
  prix_unitaire_mouvement?: number;
  demande_id?: number;
  motif?: string;
  stock?: {
    id: number;
    article: {
      nom_article: string;
    };
  };
  stockLot?: {
    id: number;
    code: string;
    numero_lot: string;
    date_expiration?: string;
  };
  created_at: string;
  deleted_at?: string;
}

interface Filters {
  search: string;
  type_mouvement: string;
  stock_id: string;
  lot_id: string;
  date_debut: string;
  date_fin: string;
  demande_id: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function MovementList() {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTrashed, setShowTrashed] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type_mouvement: "",
    stock_id: "",
    lot_id: "",
    date_debut: "",
    date_fin: "",
    demande_id: "",
  });

  const loadMovements = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.type_mouvement) params.append('type_mouvement', filters.type_mouvement);
      if (filters.stock_id) params.append('stock_id', filters.stock_id);
      if (filters.lot_id) params.append('lot_id', filters.lot_id);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (filters.demande_id) params.append('demande_id', filters.demande_id);
      if (showTrashed) params.append('trashed', '1');
      params.append('per_page', '50');

      // Appel API réel au backend
      const response = await apiFetch(`/v1/stock/movements?${params.toString()}`, {}, 'company');
      
      if (response.success && response.data) {
        setMovements(response.data.data || []);
      } else {
        setMovements([]);
      }
    } catch (e) {
      setApiError(getErrorMessage(e));
      setMovements([]);
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
      stock_id: "",
      lot_id: "",
      date_debut: "",
      date_fin: "",
      demande_id: "",
    });
  };

  const handleRestore = async (id: number) => {
    try {
      await apiFetch(`/v1/stock/movements/${id}/restore`, { method: 'POST' }, 'company');
      setSuccessMessage('Mouvement restauré avec succès.');
      loadMovements();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const handleForceDelete = async (id: number) => {
    try {
      await apiFetch(`/v1/stock/movements/${id}/force`, { method: 'DELETE' }, 'company');
      setSuccessMessage('Mouvement supprimé définitivement.');
      loadMovements();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Entrée' ? (
      <ArrowUpIcon className="h-5 w-5 text-green-500" />
    ) : (
      <ArrowDownIcon className="h-5 w-5 text-red-500" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'Entrée' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatDateTime = (dateString: string): string => {
    return new Date(dateString).toLocaleString('fr-FR');
  };

  const activeFiltersCount = Object.values(filters).filter(value => value !== "").length;

  // Clear success message after 5 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timeout = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timeout);
  }, [successMessage]);

  return (
    <>
      <Helmet><title>Mouvements de stock | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {showTrashed ? 'Mouvements supprimés' : 'Mouvements de stock'}
          </h2>
          <div className="flex items-center gap-3">
            <Link
              to="/stocks/lots/dashboard"
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Dashboard FIFO
            </Link>
            <button
              onClick={() => setShowTrashed(v => !v)}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              {showTrashed ? 'Voir actifs' : 'Corbeille'}
            </button>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6">
            <Alert variant="success" title="Succès" message={successMessage} />
          </div>
        )}

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        {/* Filtres */}
        {!showTrashed && (
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
                  placeholder="Code, motif..."
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
                  <option value="Entrée">Entrée</option>
                  <option value="Sortie">Sortie</option>
                </select>
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
                  ID Demande
                </label>
                <Input
                  type="number"
                  placeholder="ID de la demande"
                  value={filters.demande_id}
                  onChange={(e) => handleFilterChange('demande_id', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Liste des mouvements */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                    Motif
                  </th>
                  {showTrashed && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-white/[0.03] dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={showTrashed ? 8 : 7} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand-500"></div>
                      </div>
                    </td>
                  </tr>
                ) : movements.length === 0 ? (
                  <tr>
                    <td colSpan={showTrashed ? 8 : 7} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      {showTrashed ? 'Aucun mouvement supprimé' : 'Aucun mouvement trouvé'}
                    </td>
                  </tr>
                ) : (
                  movements.map((movement) => (
                    <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {movement.code}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(movement.type_mouvement)}`}>
                          {getTypeIcon(movement.type_mouvement)}
                          <span className="ml-1">{movement.type_mouvement}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {movement.quantite}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {movement.stock?.article?.nom_article || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {movement.stockLot ? (
                          <div>
                            <div>{movement.stockLot.code}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {movement.stockLot.numero_lot}
                            </div>
                          </div>
                        ) : (
                          'N/A'
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatDateTime(movement.date_mouvement)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {movement.motif || '-'}
                      </td>
                      {showTrashed && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRestore(movement.id)}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-green-500 text-white text-xs font-medium hover:bg-green-600"
                            >
                              <CheckCircleIcon className="w-3 h-3 mr-1" />
                              Restaurer
                            </button>
                            <button
                              onClick={() => handleForceDelete(movement.id)}
                              className="inline-flex items-center px-2 py-1 rounded-md bg-red-500 text-white text-xs font-medium hover:bg-red-600"
                            >
                              <TrashBinIcon className="w-3 h-3 mr-1" />
                              Supprimer
                            </button>
                          </div>
                        </td>
                      )}
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
