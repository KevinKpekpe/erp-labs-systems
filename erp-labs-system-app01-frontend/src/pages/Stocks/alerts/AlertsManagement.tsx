import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import Modal from "../../../components/ui/Modal";
import { AlertIcon, CalenderIcon, CheckCircleIcon, TrashBinIcon, CloseIcon, BoltIcon } from "../../../icons";

interface StockAlert {
  id: number;
  type: 'stock_critique' | 'expiration_proche' | 'lot_expire' | 'chaine_froid' | 'temperature';
  priorite: 'haute' | 'moyenne' | 'faible';
  titre: string;
  message: string;
  stock_id?: number;
  lot_id?: number;
  date_creation: string;
  date_traitement?: string;
  statut: 'nouveau' | 'en_cours' | 'traite' | 'ignore';
  stock?: {
    id: number;
    article: {
      nom_article: string;
      categorie?: {
        nom_categorie: string;
        type_laboratoire?: string;
        chaine_froid_critique?: boolean;
      };
    };
  };
  lot?: {
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
  type: string;
  priorite: string;
  statut: string;
  date_debut: string;
  date_fin: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function AlertsManagement() {
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTrashed, setShowTrashed] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "",
    priorite: "",
    statut: "",
    date_debut: "",
    date_fin: "",
  });
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    alert: StockAlert | null;
    action: 'traiter' | 'ignorer' | 'supprimer' | 'restaurer' | 'force_delete';
  }>({
    isOpen: false,
    alert: null,
    action: 'traiter',
  });

  const loadAlerts = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.type) params.append('type', filters.type);
      if (filters.priorite) params.append('priorite', filters.priorite);
      if (filters.statut) params.append('statut', filters.statut);
      if (filters.date_debut) params.append('date_debut', filters.date_debut);
      if (filters.date_fin) params.append('date_fin', filters.date_fin);
      if (showTrashed) params.append('trashed', '1');
      params.append('per_page', '50');

      // Simulons les données d'alertes pour le moment
      // En production, cela viendrait d'une API dédiée comme /v1/stock/alerts
      const simulatedAlerts: StockAlert[] = [
        {
          id: 1,
          type: 'stock_critique',
          priorite: 'haute',
          titre: 'Stock critique détecté',
          message: 'Le stock de Réactifs Biochimie est sous le seuil critique (5 unités restantes)',
          stock_id: 1,
          date_creation: new Date().toISOString(),
          statut: 'nouveau',
          stock: {
            id: 1,
            article: {
              nom_article: 'Réactifs Biochimie',
              categorie: {
                nom_categorie: 'Réactifs',
                type_laboratoire: 'Réactifs',
                chaine_froid_critique: true,
              },
            },
          },
          created_at: new Date().toISOString(),
        },
        {
          id: 2,
          type: 'expiration_proche',
          priorite: 'moyenne',
          titre: 'Expiration proche',
          message: 'Le lot LOT-2024-001 expire dans 7 jours',
          lot_id: 1,
          date_creation: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          statut: 'nouveau',
          lot: {
            id: 1,
            code: 'LOT-2024-001',
            numero_lot: 'BIO-001',
            date_expiration: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          },
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 3,
          type: 'chaine_froid',
          priorite: 'haute',
          titre: 'Alerte chaîne du froid',
          message: 'Rupture de la chaîne du froid détectée pour les réactifs critiques',
          stock_id: 2,
          date_creation: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          statut: 'en_cours',
          stock: {
            id: 2,
            article: {
              nom_article: 'Contrôles Pathologiques',
              categorie: {
                nom_categorie: 'Contrôles',
                type_laboratoire: 'Contrôles',
                chaine_froid_critique: true,
              },
            },
          },
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      setAlerts(simulatedAlerts.filter(alert => 
        showTrashed ? alert.deleted_at : !alert.deleted_at
      ));
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, [showTrashed, filters]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "",
      priorite: "",
      statut: "",
      date_debut: "",
      date_fin: "",
    });
  };

  const openActionModal = (alert: StockAlert, action: typeof actionModal.action) => {
    setActionModal({ isOpen: true, alert, action });
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, alert: null, action: 'traiter' });
  };

  const handleAlertAction = async () => {
    if (!actionModal.alert) return;

    try {
      // Simulation des actions sur les alertes
      // En production, cela ferait des appels API comme:
      // await apiFetch(`/v1/stock/alerts/${actionModal.alert.id}/${actionModal.action}`, { method: 'POST' }, 'company');
      
      let message = '';
      switch (actionModal.action) {
        case 'traiter':
          message = 'Alerte marquée comme traitée.';
          break;
        case 'ignorer':
          message = 'Alerte ignorée.';
          break;
        case 'supprimer':
          message = 'Alerte supprimée.';
          break;
        case 'restaurer':
          message = 'Alerte restaurée.';
          break;
        case 'force_delete':
          message = 'Alerte supprimée définitivement.';
          break;
      }
      
      setSuccessMessage(message);
      closeActionModal();
      loadAlerts();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock_critique':
        return <AlertIcon className="h-5 w-5 text-red-500" />;
      case 'expiration_proche':
        return <CalenderIcon className="h-5 w-5 text-orange-500" />;
      case 'lot_expire':
        return <CloseIcon className="h-5 w-5 text-red-600" />;
      case 'chaine_froid':
        return <BoltIcon className="h-5 w-5 text-blue-500" />;
      case 'temperature':
        return <BoltIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <AlertIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'stock_critique':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expiration_proche':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'lot_expire':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'chaine_froid':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'temperature':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPriorityColor = (priorite: string) => {
    switch (priorite) {
      case 'haute':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800';
      case 'moyenne':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800';
      case 'faible':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800';
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'nouveau':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'en_cours':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'traite':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'ignore':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
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
      <Helmet><title>Alertes de stock | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {showTrashed ? 'Alertes supprimées' : 'Alertes de stock'}
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
              {showTrashed ? 'Voir actives' : 'Corbeille'}
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
                  placeholder="Titre, message, article..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'alerte
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="stock_critique">Stock critique</option>
                  <option value="expiration_proche">Expiration proche</option>
                  <option value="lot_expire">Lot expiré</option>
                  <option value="chaine_froid">Chaîne du froid</option>
                  <option value="temperature">Température</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priorité
                </label>
                <select
                  value={filters.priorite}
                  onChange={(e) => handleFilterChange('priorite', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Toutes les priorités</option>
                  <option value="haute">Haute</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="faible">Faible</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Statut
                </label>
                <select
                  value={filters.statut}
                  onChange={(e) => handleFilterChange('statut', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous les statuts</option>
                  <option value="nouveau">Nouveau</option>
                  <option value="en_cours">En cours</option>
                  <option value="traite">Traité</option>
                  <option value="ignore">Ignoré</option>
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
            </div>
          </div>
        )}

        {/* Liste des alertes */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {showTrashed ? 'Aucune alerte supprimée' : 'Aucune alerte trouvée'}
              </p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`rounded-2xl border p-6 ${getPriorityColor(alert.priorite)} dark:bg-white/[0.03]`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {getTypeIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                          {alert.titre}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(alert.type)}`}>
                          {alert.type.replace('_', ' ')}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(alert.statut)}`}>
                          {alert.statut.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-gray-700 dark:text-gray-300 mb-3">
                        {alert.message}
                      </p>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>Créé le {formatDateTime(alert.date_creation)}</span>
                        {alert.stock && (
                          <span>
                            Stock: {alert.stock.article.nom_article}
                            {alert.stock.article.categorie?.type_laboratoire && (
                              <span className="ml-1 text-blue-600 dark:text-blue-400">
                                ({alert.stock.article.categorie.type_laboratoire})
                              </span>
                            )}
                          </span>
                        )}
                        {alert.lot && (
                          <span>Lot: {alert.lot.code} ({alert.lot.numero_lot})</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    {showTrashed ? (
                      <>
                        <button
                          onClick={() => openActionModal(alert, 'restaurer')}
                          className="inline-flex items-center px-3 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                        >
                          <CheckCircleIcon className="w-4 h-4 mr-1" />
                          Restaurer
                        </button>
                        <button
                          onClick={() => openActionModal(alert, 'force_delete')}
                          className="inline-flex items-center px-3 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                        >
                          <TrashBinIcon className="w-4 h-4 mr-1" />
                          Supprimer définitivement
                        </button>
                      </>
                    ) : (
                      <>
                        {alert.statut === 'nouveau' && (
                          <button
                            onClick={() => openActionModal(alert, 'traiter')}
                            className="inline-flex items-center px-3 py-2 rounded-md bg-green-500 text-white text-sm font-medium hover:bg-green-600"
                          >
                            <CheckCircleIcon className="w-4 h-4 mr-1" />
                            Traiter
                          </button>
                        )}
                        <button
                          onClick={() => openActionModal(alert, 'ignorer')}
                          className="inline-flex items-center px-3 py-2 rounded-md bg-gray-500 text-white text-sm font-medium hover:bg-gray-600"
                        >
                          Ignorer
                        </button>
                        <button
                          onClick={() => openActionModal(alert, 'supprimer')}
                          className="inline-flex items-center px-3 py-2 rounded-md bg-red-500 text-white text-sm font-medium hover:bg-red-600"
                        >
                          <TrashBinIcon className="w-4 h-4 mr-1" />
                          Supprimer
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal d'action */}
      <Modal
        isOpen={actionModal.isOpen}
        onClose={closeActionModal}
        title={`Confirmer l'action`}
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            {actionModal.action === 'supprimer' || actionModal.action === 'force_delete' ? (
              <TrashBinIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            )}
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {actionModal.action === 'traiter' && 'Marquer comme traitée'}
            {actionModal.action === 'ignorer' && 'Ignorer cette alerte'}
            {actionModal.action === 'supprimer' && 'Supprimer cette alerte'}
            {actionModal.action === 'restaurer' && 'Restaurer cette alerte'}
            {actionModal.action === 'force_delete' && 'Supprimer définitivement'}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {actionModal.action === 'traiter' && `L'alerte "${actionModal.alert?.titre}" sera marquée comme traitée.`}
            {actionModal.action === 'ignorer' && `L'alerte "${actionModal.alert?.titre}" sera ignorée.`}
            {actionModal.action === 'supprimer' && `L'alerte "${actionModal.alert?.titre}" sera déplacée vers la corbeille.`}
            {actionModal.action === 'restaurer' && `L'alerte "${actionModal.alert?.titre}" sera restaurée.`}
            {actionModal.action === 'force_delete' && `L'alerte "${actionModal.alert?.titre}" sera définitivement supprimée.`}
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={closeActionModal}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={handleAlertAction}
              className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-white ${
                actionModal.action === 'supprimer' || actionModal.action === 'force_delete'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              Confirmer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
