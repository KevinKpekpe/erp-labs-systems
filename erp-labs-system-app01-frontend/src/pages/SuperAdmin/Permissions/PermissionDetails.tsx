import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router";
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon, 
  RestoreIcon,
  CalendarIcon,
  ClockIcon
} from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Modal from "../../../components/ui/Modal";

interface Permission {
  id: number;
  code: string;
  action: string;
  module: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export default function PermissionDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isForceDelete: false
  });

  useEffect(() => {
    if (location.state?.success) {
      setSuccessMessage(location.state.success);
    }
    fetchPermission();
  }, [id]);

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

  const fetchPermission = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<any>(`/v1/superadmin/permissions/${id}`, { method: "GET" }, "superadmin");
      setPermission(res.data);
    } catch (error: any) {
      setError("Erreur lors du chargement de la permission");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = (isForceDelete: boolean = false) => {
    setDeleteModal({
      isOpen: true,
      isForceDelete
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      isForceDelete: false
    });
  };

  const handleDelete = async () => {
    if (!permission) return;

    try {
      const endpoint = deleteModal.isForceDelete 
        ? `/v1/superadmin/permissions/${permission.id}/force`
        : `/v1/superadmin/permissions/${permission.id}`;
      
      await apiFetch(endpoint, { method: "DELETE" }, "superadmin");
      
      setSuccessMessage(
        deleteModal.isForceDelete 
          ? "Permission supprimée définitivement" 
          : "Permission supprimée avec succès"
      );
      
      closeDeleteModal();
      
      // Rediriger vers la liste après un délai
      setTimeout(() => {
        navigate("/superadmin/permissions", { 
          state: { success: deleteModal.isForceDelete ? "Permission supprimée définitivement" : "Permission supprimée avec succès" }
        });
      }, 1500);

    } catch (error: any) {
      setError("Erreur lors de la suppression");
      console.error("Erreur:", error);
    }
  };

  const handleRestore = async () => {
    if (!permission) return;

    try {
      await apiFetch(`/v1/superadmin/permissions/${permission.id}/restore`, { method: "POST" }, "superadmin");
      setSuccessMessage("Permission restaurée avec succès");
      fetchPermission(); // Recharger pour mettre à jour l'état
    } catch (error: any) {
      setError("Erreur lors de la restauration");
      console.error("Erreur:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
          <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (!permission) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Permission non trouvée
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            La permission que vous recherchez n'existe pas ou a été supprimée.
          </p>
          <button
            onClick={() => navigate("/superadmin/permissions")}
            className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition ease-in-out duration-150"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour à la liste
          </button>
        </div>
      </div>
    );
  }

  const isDeleted = !!permission.deleted_at;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/superadmin/permissions")}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Détails de la Permission
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Informations détaillées sur la permission système
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {isDeleted ? (
            <button
              onClick={handleRestore}
              className="inline-flex items-center px-4 py-2 bg-green-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150"
            >
              <RestoreIcon className="w-4 h-4 mr-2" />
              Restaurer
            </button>
          ) : (
            <Link
              to={`/superadmin/permissions/${permission.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 focus:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150"
            >
              <PencilIcon className="w-4 h-4 mr-2" />
              Modifier
            </Link>
          )}
          <button
            onClick={() => openDeleteModal(isDeleted)}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-offset-2 transition ease-in-out duration-150 ${
              isDeleted 
                ? "bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:ring-red-500"
                : "bg-red-600 hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:ring-red-500"
            }`}
          >
            <TrashIcon className="w-4 h-4 mr-2" />
            {isDeleted ? "Supprimer définitivement" : "Supprimer"}
          </button>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-6" />
      )}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Permission Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations de la Permission
            </h2>
            
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Statut</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  isDeleted 
                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                    : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                }`}>
                  {isDeleted ? "Supprimée" : "Active"}
                </span>
              </div>

              {/* Code */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Code</span>
                <span className="text-sm text-gray-900 dark:text-white font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                  {permission.code}
                </span>
              </div>

              {/* Action */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Action</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                  {permission.action}
                </span>
              </div>

              {/* Module */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Module</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  {permission.module}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Timestamps */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Informations temporelles
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Créée le</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(permission.created_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <ClockIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Modifiée le</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(permission.updated_at).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              {isDeleted && (
                <div className="flex items-start space-x-3">
                  <TrashIcon className="w-5 h-5 text-red-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Supprimée le</p>
                    <p className="text-sm text-red-500 dark:text-red-400">
                      {new Date(permission.deleted_at!).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
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
          {permission && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Code:</strong> {permission.code}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Action:</strong> {permission.action}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Module:</strong> {permission.module}
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
