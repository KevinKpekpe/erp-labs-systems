import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/apiClient';
import { formatCDF } from '../../lib/currency';
import { 
  BoxIcon, 
  DownloadIcon, 
  FilterIcon, 
  CalendarIcon,
  StockIcon,
  StockAlertIcon,
  StockValueIcon,
  StockWarningIcon
} from '../../icons';

interface ReportFilters {
  period: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
  sort_by?: string;
  sort_direction?: string;
  limit?: number;
}

export default function InventoryReportPage() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'month',
    group_by: 'day',
    sort_by: 'date',
    sort_direction: 'desc',
    limit: 100
  });
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [activeView, setActiveView] = useState<'summary' | 'articles' | 'critical' | 'movements'>('summary');

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const response = await apiFetch('/v1/reports/inventory', {
        method: 'POST',
        body: JSON.stringify(filters)
      });

      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la génération du rapport:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await apiFetch(`/v1/reports/download/inventory`, {
        method: 'GET',
        body: JSON.stringify(filters)
      });

      if (response.success) {
        // TODO: Implémenter l'export Excel/CSV
        console.log('Données du rapport:', response.data);
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Génération du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Rapport d'Inventaire
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Analysez vos stocks, articles critiques et mouvements
        </p>
      </div>

      {/* Filtres */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filtres</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Période
            </label>
            <select
              value={filters.period}
              onChange={(e) => setFilters({ ...filters, period: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="month">Ce mois</option>
              <option value="last_30_days">30 derniers jours</option>
              <option value="year">Cette année</option>
              <option value="last_year">Année précédente</option>
              <option value="custom">Période personnalisée</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Grouper par
            </label>
            <select
              value={filters.group_by}
              onChange={(e) => setFilters({ ...filters, group_by: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="day">Jour</option>
              <option value="week">Semaine</option>
              <option value="month">Mois</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={downloadReport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Exporter
            </button>
          </div>
        </div>
      </div>

      {/* Navigation des vues */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveView('summary')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'summary'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Résumé
        </button>
        <button
          onClick={() => setActiveView('articles')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'articles'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Articles
        </button>
        <button
          onClick={() => setActiveView('critical')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'critical'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Articles Critiques
        </button>
        <button
          onClick={() => setActiveView('movements')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'movements'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Mouvements
        </button>
      </div>

      {/* Contenu des vues */}
      {activeView === 'summary' && reportData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <StockIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.total_articles || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Articles</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <StockValueIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.total_value ? formatCDF(reportData.summary.total_value) : '0 CDF'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Valeur Totale</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <StockAlertIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.critical_articles_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Articles Critiques</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <StockWarningIcon className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.expired_items_count || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Articles Expirés</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'articles' && reportData?.articles && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Articles en Stock</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Prix Unitaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valeur
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.articles.map((article: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {article.nom_article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {article.nom_categorie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {article.quantite_actuelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCDF(article.prix_unitaire)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCDF(article.quantite_actuelle * article.prix_unitaire)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'critical' && reportData?.critical_articles && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Articles Critiques</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité Actuelle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seuil Critique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.critical_articles.map((article: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {article.nom_article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {article.quantite_actuelle}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {article.seuil_critique}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Critique
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'movements' && reportData?.recent_movements && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mouvements Récents</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.recent_movements.map((movement: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {movement.nom_article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        movement.type_mouvement === 'Entrée' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {movement.type_mouvement}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {movement.quantite}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(movement.date_mouvement).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
