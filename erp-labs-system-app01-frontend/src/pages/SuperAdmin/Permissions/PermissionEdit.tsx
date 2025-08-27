import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ArrowLeftIcon, SaveIcon } from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";

interface Permission {
  id: number;
  code: string;
  action: string;
  module: string;
  created_at: string;
  updated_at: string;
}

export default function PermissionEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    code: "",
    action: "",
    module: ""
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
      const permissionData = res.data;
      setPermission(permissionData);
      setFormData({
        code: permissionData.code,
        action: permissionData.action,
        module: permissionData.module
      });
    } catch (error: any) {
      setError("Erreur lors du chargement de la permission");
      console.error("Erreur:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.action.trim() || !formData.module.trim()) {
      setError("Tous les champs sont obligatoires");
      return;
    }

    try {
      setSaving(true);
      setError("");

      await apiFetch(`/v1/superadmin/permissions/${id}`, {
        method: "PUT",
        body: JSON.stringify(formData)
      }, "superadmin");

      setSuccessMessage("Permission modifiée avec succès");
      
      // Rediriger vers les détails après un délai
      setTimeout(() => {
        navigate(`/superadmin/permissions/${id}`, { 
          state: { success: "Permission modifiée avec succès" }
        });
      }, 1500);

    } catch (error: any) {
      console.error("Erreur lors de la modification:", error);
      setError("Erreur lors de la modification de la permission");
    } finally {
      setSaving(false);
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(`/superadmin/permissions/${id}`)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Retour
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Modifier la Permission
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Modifiez les informations de la permission système
            </p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMessage && (
        <Alert type="success" message={successMessage} className="mb-6" />
      )}
      {error && (
        <Alert type="error" message={error} className="mb-6" />
      )}

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            
            {/* Code Field */}
            <div className="mb-6">
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code de la Permission *
              </label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Ex: CREATE_USER"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Code unique identifiant la permission (en majuscules avec des underscores)
              </p>
            </div>

            {/* Action Field */}
            <div className="mb-6">
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Action *
              </label>
              <input
                type="text"
                id="action"
                name="action"
                value={formData.action}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Ex: CREATE"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Type d'action (CREATE, READ, UPDATE, DELETE, LIST, etc.)
              </p>
            </div>

            {/* Module Field */}
            <div className="mb-6">
              <label htmlFor="module" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Module *
              </label>
              <input
                type="text"
                id="module"
                name="module"
                value={formData.module}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                placeholder="Ex: USER"
                required
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Module ou ressource concernée par cette permission
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(`/superadmin/permissions/${id}`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Current Values Section */}
      <div className="mt-8 max-w-2xl">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Informations actuelles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">ID:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">{permission.id}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Créée le:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {new Date(permission.created_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Modifiée le:</span>
              <span className="ml-2 font-medium text-gray-900 dark:text-white">
                {new Date(permission.updated_at).toLocaleDateString("fr-FR")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
