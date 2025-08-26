import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { PlusIcon, SearchIcon, EyeIcon, PencilIcon, TrashIcon, RestoreIcon } from "../../../icons";
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
}

export default function CompanyList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrashed, setShowTrashed] = useState(false);

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
    fetchCompanies();
  }, [showTrashed]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = showTrashed ? "/v1/superadmin/companies-trashed" : "/v1/superadmin/companies";
      
      const res = await apiFetch<{ success: boolean; data: Company[] }>(endpoint, { method: "GET" }, "superadmin");
      
      if (res.success && res.data) {
        setCompanies(res.data);
      } else {
        setCompanies([]);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des compagnies:", error);
      setError("Erreur lors du chargement des compagnies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await apiFetch(`/v1/superadmin/companies/${id}/restore`, { method: "POST" }, "superadmin");
      setSuccessMessage("Compagnie restaurée avec succès");
      fetchCompanies();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      setError("Erreur lors de la restauration");
    }
  };

  const handleForceDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette compagnie ? Cette action est irréversible.")) {
      try {
        await apiFetch(`/v1/superadmin/companies/${id}/force`, { method: "DELETE" }, "superadmin");
        setSuccessMessage("Compagnie supprimée définitivement avec succès");
        fetchCompanies();
      } catch (error) {
        console.error("Erreur lors de la suppression définitive:", error);
        setError("Erreur lors de la suppression définitive");
      }
    }
  };

  const handleSoftDelete = async (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette compagnie ?")) {
      try {
        await apiFetch(`/v1/superadmin/companies/${id}`, { method: "DELETE" }, "superadmin");
        setSuccessMessage("Compagnie supprimée avec succès");
        fetchCompanies();
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        setError("Erreur lors de la suppression");
      }
    }
  };

  const filteredCompanies = companies.filter(company => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      company.nom_company.toLowerCase().includes(searchLower) ||
      company.code.toString().includes(searchLower) ||
      company.adresse.toLowerCase().includes(searchLower) ||
      (company.email && company.email.toLowerCase().includes(searchLower))
    );
  });

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
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
          Supprimée
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
        Active
      </span>
    );
  };

  // Fonction pour construire l'URL du logo (style identique aux autres pages)
  const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
  const buildLogoUrl = (logoPath: string | null): string | null => {
    if (!logoPath) return null;
    if (logoPath.startsWith("http")) return logoPath;
    if (logoPath.startsWith("/")) return `${backendBase}${logoPath}`;
    return `${backendBase}/storage/${logoPath}`;
  };

  if (error) {
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
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">{error}</p>
              <button
                onClick={fetchCompanies}
                className="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
          <div className="h-10 bg-gray-200 rounded w-full dark:bg-gray-700"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded dark:bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title="Gestion des Compagnies | SuperAdmin"
        description="Gestion complète des compagnies du système"
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Compagnies
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {showTrashed ? "Compagnies supprimées" : "Toutes les compagnies actives"}
            </p>
          </div>
          
          <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowTrashed(!showTrashed)}
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
                to="/superadmin/companies/new"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                Nouvelle Compagnie
              </Link>
            )}
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, code, adresse ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
            />
          </div>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm ? `${filteredCompanies.length} résultat(s) trouvé(s)` : `${companies.length} compagnie(s) au total`}
          </div>
        </div>

        {/* Liste des compagnies */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Compagnie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Secteur
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
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                          <SearchIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-medium">Aucune compagnie trouvée</p>
                        <p className="text-sm">
                          {searchTerm ? "Essayez de modifier vos critères de recherche" : 
                           showTrashed ? "Aucune compagnie supprimée" : "Commencez par créer votre première compagnie"}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {company.logo ? (
                              <img
                                src={buildLogoUrl(company.logo) || ""}
                                alt={`Logo ${company.nom_company}`}
                                className="h-12 w-12 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                            ) : null}
                            <div className={`h-12 w-12 rounded-full bg-blue-100 dark:bg-gray-700 flex items-center justify-center ${company.logo ? 'hidden' : ''}`}>
                              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {company.nom_company.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 min-w-0 flex-1">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {company.nom_company}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Code: {company.code}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {company.adresse}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 dark:text-white font-medium">
                          {company.contact}
                        </div>
                        {company.email && (
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                            {company.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {company.type_etablissement}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {company.secteur_activite ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                            {company.secteur_activite}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(company.deleted_at)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(company.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-3">
                          <Link
                            to={`/superadmin/companies/${company.id}`}
                            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title="Voir les détails"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </Link>
                          
                          {!company.deleted_at && (
                            <Link
                              to={`/superadmin/companies/${company.id}/edit`}
                              className="p-2 text-indigo-600 hover:text-indigo-900 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                              title="Modifier"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </Link>
                          )}
                          
                          {company.deleted_at ? (
                            <>
                              <button
                                onClick={() => handleRestore(company.id)}
                                className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                title="Restaurer"
                              >
                                <RestoreIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleForceDelete(company.id)}
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer définitivement"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleSoftDelete(company.id)}
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

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Total</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{companies.length}</div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Actives</div>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {companies.filter(c => !c.deleted_at).length}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Supprimées</div>
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              {companies.filter(c => c.deleted_at).length}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
