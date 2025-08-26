import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeftIcon, PencilIcon, TrashIcon, RestoreIcon, EyeIcon } from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import PageMeta from "../../../components/common/PageMeta";

interface Company {
  id: number;
  code: string;
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

export default function CompanyDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      const res = await apiFetch<any>(`/v1/superadmin/companies/${id}`, { method: "GET" }, "superadmin");
      setCompany(res.data);
    } catch (error) {
      console.error("Erreur lors du chargement de la compagnie:", error);
      navigate("/superadmin/companies");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!company) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette compagnie ?")) {
      try {
        setDeleting(true);
        await apiFetch(`/v1/superadmin/companies/${company.id}`, { method: "DELETE" }, "superadmin");
        navigate("/superadmin/companies");
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        alert("Erreur lors de la suppression de la compagnie");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleRestore = async () => {
    if (!company) return;
    
    try {
      setDeleting(true);
      await apiFetch(`/v1/superadmin/companies/${company.id}/restore`, { method: "POST" }, "superadmin");
      fetchCompany();
    } catch (error) {
      console.error("Erreur lors de la restauration:", error);
      alert("Erreur lors de la restauration de la compagnie");
    } finally {
      setDeleting(false);
    }
  };

  const handleForceDelete = async () => {
    if (!company) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette compagnie ? Cette action est irréversible.")) {
      try {
        setDeleting(true);
        await apiFetch(`/v1/superadmin/companies/${company.id}/force`, { method: "DELETE" }, "superadmin");
        navigate("/superadmin/companies");
      } catch (error) {
        console.error("Erreur lors de la suppression définitive:", error);
        alert("Erreur lors de la suppression définitive de la compagnie");
      } finally {
        setDeleting(false);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (!company) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Compagnie non trouvée</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">La compagnie demandée n'existe pas ou a été supprimée.</p>
          <Link
            to="/superadmin/companies"
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-900/40"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${company.nom_company} | Détails Compagnie`}
        description={`Détails de la compagnie ${company.nom_company}`}
      />
      
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/superadmin/companies")}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour à la liste
            </button>
          </div>
          
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {company.nom_company}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Code: {company.code} • {getStatusBadge(company.deleted_at)}
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-3">
              {!company.deleted_at ? (
                <>
                  <Link
                    to={`/superadmin/companies/${company.id}/edit`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                  >
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Modifier
                  </Link>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    {deleting ? "Suppression..." : "Supprimer"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleRestore}
                    disabled={deleting}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-green-600 dark:hover:bg-green-700"
                  >
                    <RestoreIcon className="w-4 h-4 mr-2" />
                    {deleting ? "Restauration..." : "Restaurer"}
                  </button>
                  <button
                    onClick={handleForceDelete}
                    disabled={deleting}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-red-600 dark:hover:bg-red-700"
                  >
                    <TrashIcon className="w-4 h-4 mr-2" />
                    {deleting ? "Suppression..." : "Supprimer définitivement"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations principales */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations de base */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations de Base
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Nom de la compagnie
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {company.nom_company}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Code
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white font-mono">
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
                  <p className="text-sm text-gray-900 dark:text-white">
                    {company.secteur_activite || "Non spécifié"}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Adresse
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {company.adresse}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Contact
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {company.contact}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    Email
                  </label>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {company.email || "Non spécifié"}
                  </p>
                </div>

                {company.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Description
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {company.description}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Métadonnées */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Métadonnées
              </h2>
              
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

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Logo */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Logo
              </h3>
              
              {company.logo ? (
                <div className="text-center">
                  <img
                    src={company.logo}
                    alt={`Logo ${company.nom_company}`}
                    className="w-32 h-32 mx-auto rounded-lg object-cover border border-gray-200 dark:border-gray-700"
                  />
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-32 h-32 mx-auto rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <span className="text-4xl font-bold text-gray-400 dark:text-gray-600">
                      {company.nom_company.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    Aucun logo
                  </p>
                </div>
              )}
            </div>

            {/* Actions rapides */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Actions Rapides
              </h3>
              
              <div className="space-y-3">
                <Link
                  to={`/superadmin/companies/${company.id}/users`}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Voir les utilisateurs
                </Link>
                
                <Link
                  to={`/superadmin/companies/${company.id}/roles`}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Voir les rôles
                </Link>
                
                <Link
                  to={`/superadmin/companies/${company.id}/audit`}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <EyeIcon className="w-4 h-4 mr-2" />
                  Voir l'audit
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
