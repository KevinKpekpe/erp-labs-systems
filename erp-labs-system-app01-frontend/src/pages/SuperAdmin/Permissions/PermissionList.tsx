import { useState, useEffect } from "react";
import { Link } from "react-router";
import { 
  PlusIcon, 
  SearchIcon, 
  PencilIcon, 
  EyeIcon, 
  TrashIcon, 
  RestoreIcon,
  FilterIcon
} from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Modal from "../../../components/ui/Modal";
import Pagination from "../../../components/common/Pagination";

interface Permission {
  id: number;
  code: string;
  action: string;
  module: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

interface PaginatedPermissions {
  data: Permission[];
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export default function PermissionList() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrashed, setShowTrashed] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1
  });
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    permission: null as Permission | null,
    isForceDelete: false
  });

  useEffect(() => {
    fetchPermissions();
  }, [showTrashed, currentPage]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const endpoint = showTrashed ? "/v1/superadmin/permissions-trashed" : "/v1/superadmin/permissions";
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: "10"
      });
      
      const res = await apiFetch<PaginatedPermissions>(`${endpoint}?${params}`, { method: "GET" }, "superadmin");
      
      if (res.data) {
        setPermissions(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          per_page: res.data.per_page,
          total: res.data.total,
          last_page: res.data.last_page
        });
      }
    } catch (error: any) {
      setError("Erreur lors du chargement des permissions");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setCurrentPage(1);
      fetchPermissions();
      return;
    }
    
    try {
      setLoading(true);
      setCurrentPage(1);
      const endpoint = showTrashed ? "/v1/superadmin/permissions-trashed" : "/v1/superadmin/permissions";
      const params = new URLSearchParams({
        q: searchTerm,
        page: "1",
        per_page: "10"
      });
      
      const res = await apiFetch<PaginatedPermissions>(`${endpoint}?${params}`, { method: "GET" }, "superadmin");
      
      if (res.data) {
        setPermissions(res.data.data || []);
        setPagination({
          current_page: res.data.current_page,
          per_page: res.data.per_page,
          total: res.data.total,
          last_page: res.data.last_page
        });
      }
    } catch (error: any) {
      setError("Erreur lors de la recherche");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (permission: Permission, isForceDelete: boolean = false) => {
    setDeleteModal({
      isOpen: true,
      permission,
      isForceDelete
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      permission: null,
      isForceDelete: false
    });
  };

  const handleDelete = async () => {
    if (!deleteModal.permission) return;

    try {
      const endpoint = deleteModal.isForceDelete 
        ? `/v1/superadmin/permissions/${deleteModal.permission.id}/force`
        : `/v1/superadmin/permissions/${deleteModal.permission.id}`;
      
      const method = deleteModal.isForceDelete ? "DELETE" : "DELETE";
      
      await apiFetch(endpoint, { method }, "superadmin");
      
      setSuccessMessage(
        deleteModal.isForceDelete 
          ? "Permission supprimée définitivement" 
          : "Permission supprimée avec succès"
      );
      
      closeDeleteModal();
      fetchPermissions();
    } catch (error: any) {
      setError("Erreur lors de la suppression");
      console.error("Erreur:", error);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiFetch(`/v1/superadmin/permissions/${id}/restore`, { method: "POST" }, "superadmin");
      setSuccessMessage("Permission restaurée avec succès");
      fetchPermissions();
    } catch (error: any) {
      setError("Erreur lors de la restauration");
      console.error("Erreur:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleShowTrashed = () => {
    setShowTrashed(!showTrashed);
    setCurrentPage(1);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
          <div className="h-10 bg-gray-200 rounded dark:bg-gray-700"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Permissions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {showTrashed ? "Permissions supprimées" : "Toutes les permissions système"}
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleShowTrashed}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showTrashed
                ? "border-blue-500 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-600 dark:text-blue-400"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            {showTrashed ? "Voir actives" : "Voir supprimées"}
          </button>
          
          {!showTrashed && (
            <Link
              to="/superadmin/permissions/create"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Nouvelle Permission
            </Link>
          )}
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-6" />
      )}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Barre de recherche */}
      <div className="mb-6">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par code, action ou module..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
          />
        </div>
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {searchTerm ? `${permissions.length} résultat(s) trouvé(s)` : `${pagination.total} permission(s) au total`}
        </div>
      </div>

      {/* Liste des permissions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Permission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Module
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Créée le
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {permissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <SearchIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">Aucune permission trouvée</p>
                      <p className="text-sm">
                        {searchTerm ? "Essayez de modifier vos critères de recherche" : 
                         showTrashed ? "Aucune permission supprimée" : "Commencez par créer votre première permission"}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                permissions.map((permission) => (
                  <tr key={permission.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {permission.code.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4 min-w-0 flex-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {permission.code}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ID: {permission.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {permission.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        {permission.module}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {permission.deleted_at ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Supprimée
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(permission.created_at).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          to={`/superadmin/permissions/${permission.id}`}
                          className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Voir les détails"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </Link>
                        
                        {!permission.deleted_at && (
                          <Link
                            to={`/superadmin/permissions/${permission.id}/edit`}
                            className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                        )}
                        
                        {permission.deleted_at ? (
                          <>
                            <button
                              onClick={() => handleRestore(permission.id)}
                              className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                              title="Restaurer"
                            >
                              <RestoreIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(permission, true)}
                              className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              title="Supprimer définitivement"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => openDeleteModal(permission, false)}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
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

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={pagination.current_page}
          totalPages={pagination.last_page}
          totalItems={pagination.total}
          perPage={pagination.per_page}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Statistiques */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total</div>
          <div className="text-3xl font-bold text-gray-900 dark:text-white">{pagination.total}</div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actives</div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400">
            {pagination.total - (permissions.filter(p => p.deleted_at).length)}
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700">
          <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Supprimées</div>
          <div className="text-3xl font-bold text-red-600 dark:text-red-400">
            {permissions.filter(p => p.deleted_at).length}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        title={deleteModal.isForceDelete ? "Supprimer définitivement" : "Supprimer la permission"}
      >
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {deleteModal.isForceDelete 
              ? "Êtes-vous sûr de vouloir supprimer définitivement cette permission ? Cette action est irréversible."
              : "Êtes-vous sûr de vouloir supprimer cette permission ? Elle sera placée dans la corbeille."
            }
          </p>
          {deleteModal.permission && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Code:</strong> {deleteModal.permission.code}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Action:</strong> {deleteModal.permission.action}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Module:</strong> {deleteModal.permission.module}
              </p>
            </div>
          )}
          <div className="flex justify-end space-x-3">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
                deleteModal.isForceDelete 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {deleteModal.isForceDelete ? "Supprimer définitivement" : "Supprimer"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
