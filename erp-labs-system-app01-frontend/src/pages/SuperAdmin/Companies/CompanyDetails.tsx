import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { PencilIcon, ArrowLeftIcon, TrashIcon, RestoreIcon } from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import PageMeta from "../../../components/common/PageMeta";
import Alert from "../../../components/ui/alert/Alert";
import { ENV } from "../../../config/env";

interface Company {
  id: number;
  code: number;
  nom_company: string;
  adresse: string;
  email: string;
  contact: string;
  logo: string | null;
  secteur_activite: string | null;
  type_etablissement: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  admin_user?: {
    id: number;
    username: string;
    email: string;
    nom: string;
    postnom: string;
  };
}

export default function CompanyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const state = (location.state as { success?: string } | null) || null;
    if (state?.success) {
      setSuccessMessage(state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<{ success: boolean; data: Company }>(
        `/v1/superadmin/companies/${id}`,
        { method: "GET" },
        "superadmin"
      );
      
      if (res.success && res.data) {
        setCompany(res.data);
      } else {
        setError("Compagnie non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la compagnie:", error);
      setError("Erreur lors du chargement de la compagnie");
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!company) return;
    
    try {
      await apiFetch(`/v1/superadmin/companies/${company.id}/restore`, { method: "POST" }, "superadmin");
      setSuccessMessage("Compagnie restaurée avec succès");
      fetchCompany(); // Recharger les données
    } catch (error) {
      setError("Erreur lors de la restauration de la compagnie");
    }
  };

  const handleForceDelete = async () => {
    if (!company) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette compagnie ? Cette action est irréversible.")) {
      try {
        await apiFetch(`/v1/superadmin/companies/${company.id}/force`, { method: "DELETE" }, "superadmin");
        setSuccessMessage("Compagnie supprimée définitivement");
        navigate("/superadmin/companies");
      } catch (error) {
        setError("Erreur lors de la suppression définitive");
      }
    }
  };

  const handleSoftDelete = async () => {
    if (!company) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette compagnie ?")) {
      try {
        await apiFetch(`/v1/superadmin/companies/${company.id}`, { method: "DELETE" }, "superadmin");
        setSuccessMessage("Compagnie supprimée avec succès");
        fetchCompany(); // Recharger les données
      } catch (error) {
        setError("Erreur lors de la suppression");
      }
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Date invalide";
    }
  };

  const getStatusBadge = (deletedAt: string | null) => {
    if (deletedAt) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Supprimée
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Active
      </span>
    );
  };

  // Fonction pour construire l'URL du logo
  const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
  const buildLogoUrl = (logoPath: string | null): string | null => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    if (logoPath.startsWith("/")) return `${backendBase}${logoPath}`;
    return `${backendBase}/storage/${logoPath}`;
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

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error || "Compagnie non trouvée"}
              </p>
              <Link
                to="/superadmin/companies"
                className="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Détails de ${company.nom_company} | SuperAdmin`}
        description={`Informations détaillées de la compagnie ${company.nom_company}`}
      />
      
      <div className="p-6">
        {/* Messages flash */}
        {successMessage && (
          <div className="mb-6">
            <Alert variant="success" title="Succès" message={successMessage} />
          </div>
        )}
        
        {error && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={error} />
          </div>
        )}

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/superadmin/companies"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.nom_company}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Code: {company.code}
              </p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            {!company.deleted_at && (
              <Link
                to={`/superadmin/companies/${company.id}/edit`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <PencilIcon className="w-4 h-4 mr-2" />
                Modifier
              </Link>
            )}
            
            {company.deleted_at ? (
              <>
                <button
                  onClick={handleRestore}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-600 dark:hover:bg-green-700"
                >
                  <RestoreIcon className="w-4 h-4 mr-2" />
                  Restaurer
                </button>
                <button
                  onClick={handleForceDelete}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
                >
                  <TrashIcon className="w-4 h-4 mr-2" />
                  Supprimer définitivement
                </button>
              </>
            ) : (
              <button
                onClick={handleSoftDelete}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
              >
                <TrashIcon className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            )}
          </div>
        </div>

        {/* Informations principales */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logo et informations de base */}
              <div className="lg:col-span-1">
                <div className="flex flex-col items-center lg:items-start">
                  <div className="mb-6">
                    {company.logo ? (
                      <img
                        src={buildLogoUrl(company.logo) || ""}
                        alt={`Logo ${company.nom_company}`}
                        className="h-32 w-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`h-32 w-32 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center ${company.logo ? 'hidden' : ''}`}>
                      <span className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                        {company.nom_company.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-center lg:text-left">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {company.nom_company}
                    </h2>
                    <div className="mb-4">
                      {getStatusBadge(company.deleted_at)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Créée le {formatDate(company.created_at)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails de la compagnie */}
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informations générales</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Code
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {company.code}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Type d'établissement
                        </label>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {company.type_etablissement}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Secteur d'activité
                        </label>
                        {company.secteur_activite ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {company.secteur_activite}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">Non défini</span>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Description
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {company.description || "Aucune description"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Contact</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Contact
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {company.contact}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Email
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {company.email}
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Adresse
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {company.adresse}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Informations sur l'administrateur */}
            {company.admin_user && (
              <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Administrateur de la compagnie</h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Nom complet
                      </label>
                                              <p className="text-sm text-gray-900 dark:text-white font-medium">
                          {company.admin_user.nom} {company.admin_user.postnom}
                        </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Nom d'utilisateur
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {company.admin_user.username}
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Email
                      </label>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {company.admin_user.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Métadonnées</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Créée le
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(company.created_at)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Dernière modification
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatDate(company.updated_at)}
                  </p>
                </div>
                
                {company.deleted_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Supprimée le
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {formatDate(company.deleted_at)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
