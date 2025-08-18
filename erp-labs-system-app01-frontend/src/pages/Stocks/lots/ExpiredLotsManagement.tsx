import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import Modal from "../../../components/ui/Modal";
import { CalenderIcon, AlertIcon, TrashBinIcon, CloseIcon, CheckCircleIcon } from "../../../icons";

interface ExpiredLot {
  id: number;
  code: string;
  numero_lot: string;
  quantite_initiale: number;
  quantite_restante: number;
  date_entree: string;
  date_expiration: string;
  prix_unitaire_achat?: number;
  fournisseur_lot?: string;
  commentaire?: string;
  article: {
    id: number;
    nom_article: string;
    categorie?: {
      nom_categorie: string;
      type_laboratoire?: string;
      chaine_froid_critique?: boolean;
    };
  };
  stock: {
    id: number;
    seuil_critique: number;
  };
  created_at: string;
  deleted_at?: string;
}

interface Filters {
  search: string;
  type_laboratoire: string;
  chaine_froid_critique: string;
  days_expired: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function ExpiredLotsManagement() {
  const [lots, setLots] = useState<ExpiredLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showTrashed, setShowTrashed] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type_laboratoire: "",
    chaine_froid_critique: "",
    days_expired: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    lot: ExpiredLot | null;
    isForceDelete: boolean;
  }>({
    isOpen: false,
    lot: null,
    isForceDelete: false,
  });

  const loadExpiredLots = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append('q', filters.search);
      if (filters.type_laboratoire) params.append('type_laboratoire', filters.type_laboratoire);
      if (filters.chaine_froid_critique) params.append('chaine_froid_critique', filters.chaine_froid_critique);
      if (filters.days_expired) params.append('days_expired', filters.days_expired);
      if (showTrashed) params.append('trashed', '1');
      params.append('per_page', '50');

      const endpoint = showTrashed ? '/v1/stock/lots-trashed' : '/v1/stock/lots-expired';
      const url = `${endpoint}?${params.toString()}`;
      
      const resp = await apiFetch<{ data: { data: ExpiredLot[] } }>(url, { method: 'GET' }, 'company');
      const data = resp?.data?.data ?? (Array.isArray(resp) ? resp : []);
      setLots(data as ExpiredLot[]);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpiredLots();
  }, [showTrashed, filters]);

  const handleFilterChange = (field: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type_laboratoire: "",
      chaine_froid_critique: "",
      days_expired: "",
    });
  };

  const openDeleteModal = (lot: ExpiredLot, isForceDelete = false) => {
    setDeleteModal({ isOpen: true, lot, isForceDelete });
  };

  const closeDeleteModal = () => {
    setDeleteModal({ isOpen: false, lot: null, isForceDelete: false });
  };

  const handleDelete = async () => {
    if (!deleteModal.lot) return;

    try {
      const endpoint = deleteModal.isForceDelete
        ? `/v1/stock/lots/${deleteModal.lot.id}/force`
        : `/v1/stock/lots/${deleteModal.lot.id}`;
      
      await apiFetch(endpoint, { method: 'DELETE' }, 'company');
      
      setSuccessMessage(
        deleteModal.isForceDelete
          ? 'Lot supprimé définitivement avec succès.'
          : 'Lot déplacé vers la corbeille avec succès.'
      );
      
      closeDeleteModal();
      loadExpiredLots();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const handleRestore = async (lot: ExpiredLot) => {
    try {
      await apiFetch(`/v1/stock/lots/${lot.id}/restore`, { method: 'POST' }, 'company');
      setSuccessMessage('Lot restauré avec succès.');
      loadExpiredLots();
    } catch (err) {
      setApiError(getErrorMessage(err));
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (value?: number): string => {
    if (!value) return '-';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const getDaysExpired = (expirationDate: string): number => {
    const now = new Date();
    const expDate = new Date(expirationDate);
    const diffTime = now.getTime() - expDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getExpirationBadge = (expirationDate: string) => {
    const daysExpired = getDaysExpired(expirationDate);
    
    if (daysExpired <= 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
          Expire aujourd'hui
        </span>
      );
    }
    
    const severity = daysExpired <= 7 ? 'orange' : daysExpired <= 30 ? 'red' : 'gray';
    const colors = {
      orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      red: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      gray: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[severity]}`}>
        Expiré depuis {daysExpired} jour{daysExpired > 1 ? 's' : ''}
      </span>
    );
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
      <Helmet><title>Lots expirés | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            {showTrashed ? 'Lots supprimés' : 'Lots expirés'}
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
              {showTrashed ? 'Voir expirés' : 'Corbeille'}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recherche
                </label>
                <Input
                  type="text"
                  placeholder="Article, lot, fournisseur..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type laboratoire
                </label>
                <select
                  value={filters.type_laboratoire}
                  onChange={(e) => handleFilterChange('type_laboratoire', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous les types</option>
                  <option value="Réactifs">Réactifs</option>
                  <option value="Consommables">Consommables</option>
                  <option value="Équipements">Équipements</option>
                  <option value="Contrôles">Contrôles</option>
                  <option value="Références">Références</option>
                  <option value="Kits">Kits</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Chaîne du froid
                </label>
                <select
                  value={filters.chaine_froid_critique}
                  onChange={(e) => handleFilterChange('chaine_froid_critique', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous</option>
                  <option value="1">Chaîne froid critique</option>
                  <option value="0">Non critique</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Jours d'expiration
                </label>
                <select
                  value={filters.days_expired}
                  onChange={(e) => handleFilterChange('days_expired', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Tous</option>
                  <option value="0-7">0-7 jours</option>
                  <option value="8-30">8-30 jours</option>
                  <option value="31-90">31-90 jours</option>
                  <option value="90+">Plus de 90 jours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Liste des lots */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : lots.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                {showTrashed ? 'Aucun lot supprimé' : 'Aucun lot expiré trouvé'}
              </p>
            </div>
          ) : (
            lots.map((lot) => (
              <div key={lot.id} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
                {/* En-tête */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{lot.code}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{lot.numero_lot}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {getExpirationBadge(lot.date_expiration)}
                    {lot.article.categorie?.chaine_froid_critique && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                        <AlertIcon className="w-3 h-3 mr-1" />
                        Froid critique
                      </span>
                    )}
                  </div>
                </div>

                {/* Article */}
                <div className="mb-4">
                  <p className="font-medium text-gray-900 dark:text-gray-100">{lot.article.nom_article}</p>
                  {lot.article.categorie && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {lot.article.categorie.nom_categorie}
                      {lot.article.categorie.type_laboratoire && (
                        <span className="ml-1 text-blue-600 dark:text-blue-400">
                          ({lot.article.categorie.type_laboratoire})
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Détails */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Quantité restante:</span>
                    <span className={`font-medium ${
                      lot.quantite_restante > 0 
                        ? 'text-orange-600 dark:text-orange-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {lot.quantite_restante} / {lot.quantite_initiale}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date d'expiration:</span>
                    <span className="font-medium text-red-600 dark:text-red-400">
                      {formatDate(lot.date_expiration)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date d'entrée:</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {formatDate(lot.date_entree)}
                    </span>
                  </div>

                  {lot.prix_unitaire_achat && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Prix unitaire:</span>
                      <span className="text-gray-700 dark:text-gray-300">
                        {formatCurrency(lot.prix_unitaire_achat)}
                      </span>
                    </div>
                  )}

                  {lot.fournisseur_lot && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Fournisseur:</span>
                      <span className="text-gray-700 dark:text-gray-300">{lot.fournisseur_lot}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                  {showTrashed ? (
                    <>
                      <button
                        onClick={() => handleRestore(lot)}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white hover:bg-green-600"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Restaurer
                      </button>
                      <button
                        onClick={() => openDeleteModal(lot, true)}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                      >
                        <CloseIcon className="w-4 h-4 mr-2" />
                        Supprimer définitivement
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to={`/stocks/stocks/${lot.stock.id}/lots`}
                        className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                      >
                        Voir stock
                      </Link>
                      <button
                        onClick={() => openDeleteModal(lot, false)}
                        disabled={lot.quantite_restante > 0}
                        className="flex-1 inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={lot.quantite_restante > 0 ? "Impossible de supprimer un lot avec du stock restant" : "Supprimer le lot"}
                      >
                        <TrashBinIcon className="w-4 h-4 mr-2" />
                        Supprimer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title={deleteModal.isForceDelete ? "Suppression définitive" : "Confirmer la suppression"}
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <TrashBinIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            {deleteModal.isForceDelete ? 'Supprimer définitivement ce lot ?' : 'Supprimer ce lot ?'}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {deleteModal.isForceDelete
              ? `Le lot "${deleteModal.lot?.code}" sera définitivement supprimé. Cette action est irréversible.`
              : `Le lot "${deleteModal.lot?.code}" sera déplacé vers la corbeille et pourra être restauré.`
            }
          </p>
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={closeDeleteModal}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              {deleteModal.isForceDelete ? 'Supprimer définitivement' : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
