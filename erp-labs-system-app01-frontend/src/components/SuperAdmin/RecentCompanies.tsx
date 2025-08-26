import { useEffect, useState } from "react";
import { CompanyIcon, CalenderIcon, InfoIcon } from "../../icons";
import { apiFetch } from "../../lib/apiClient";

interface Company {
  id: number;
  code: string;
  nom_company: string;
  adresse: string;
  email: string;
  contact: string;
  type_etablissement: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export default function RecentCompanies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch<any>("/v1/superadmin/companies", { method: "GET" }, "superadmin");
        if (mounted) {
          const allCompanies = res.data || [];
          // Trier par date de création et prendre les 5 plus récentes
          const recent = allCompanies
            .filter((c: Company) => c.deleted_at === null)
            .sort((a: Company, b: Company) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 5);
          setCompanies(recent);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des compagnies:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusColor = (deletedAt: string | null) => {
    return deletedAt ? 'text-red-500' : 'text-green-500';
  };

  const getStatusText = (deletedAt: string | null) => {
    return deletedAt ? 'Inactive' : 'Active';
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Compagnies Récentes</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700">
              <div className="w-10 h-10 bg-gray-200 rounded-lg dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
                <div className="h-3 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Compagnies Récentes</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {companies.length} compagnie{companies.length > 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="space-y-4">
        {companies.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <CompanyIcon className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p>Aucune compagnie trouvée</p>
          </div>
        ) : (
          companies.map((company) => (
            <div key={company.id} className="flex items-center space-x-4 p-3 border border-gray-200 rounded-lg dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                <CompanyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {company.nom_company}
                  </h4>
                  <span className={`text-xs font-medium ${getStatusColor(company.deleted_at)}`}>
                    {getStatusText(company.deleted_at)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <InfoIcon className="w-3 h-3" />
                    <span className="truncate">{company.adresse}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalenderIcon className="w-3 h-3" />
                    <span>Créée le {formatDate(company.created_at)}</span>
                  </div>
                </div>
                
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <span className="font-medium">Code:</span> {company.code} | 
                  <span className="font-medium ml-1">Type:</span> {company.type_etablissement}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {companies.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="w-full text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
            Voir toutes les compagnies →
          </button>
        </div>
      )}
    </div>
  );
}
