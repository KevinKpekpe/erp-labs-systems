import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, SaveIcon } from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";

export default function PermissionCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    code: "",
    action: "",
    module: ""
  });

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
      setLoading(true);
      setError("");

      const res = await apiFetch("/v1/superadmin/permissions", {
        method: "POST",
        body: JSON.stringify(formData)
      }, "superadmin");

      setSuccessMessage("Permission créée avec succès");
      
      // Rediriger vers la liste après un délai
      setTimeout(() => {
        navigate("/superadmin/permissions", { 
          state: { success: "Permission créée avec succès" }
        });
      }, 1500);

    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      setError("Erreur lors de la création de la permission");
    } finally {
      setLoading(false);
    }
  };

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
              Créer une Permission
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Ajoutez une nouvelle permission système
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
                onClick={() => navigate("/superadmin/permissions")}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 bg-blue-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-blue-700 focus:bg-blue-700 active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition ease-in-out duration-150"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <SaveIcon className="w-4 h-4 mr-2" />
                    Créer la Permission
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Help Section */}
      <div className="mt-8 max-w-2xl">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
            💡 Conseils pour créer des permissions
          </h3>
          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <li>• <strong>Code:</strong> Utilisez des majuscules et des underscores (ex: CREATE_USER, LIST_EXAMEN)</li>
            <li>• <strong>Action:</strong> Actions standard : CREATE, READ, UPDATE, DELETE, LIST</li>
            <li>• <strong>Module:</strong> Ressources principales : USER, ROLE, EXAMEN, PATIENT, STOCK, etc.</li>
            <li>• Assurez-vous que le code est unique dans le système</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
