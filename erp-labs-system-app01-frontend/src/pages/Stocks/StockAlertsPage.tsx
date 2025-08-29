import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/apiClient';
import { formatCDF } from '../../lib/currency';
import { 
  StockAlertIcon, 
  StockWarningIcon, 
  StockValueIcon, 
  StockIcon,
  AlertIcon,
  ClockIcon,
  AlertHexaIcon,
  CheckCircleIcon
} from '../../icons';

interface StockAlert {
  type: 'URGENT' | 'CRITIQUE' | 'ATTENTION' | 'MODÉRÉE';
  message: string;
  articles?: string[];
  valeur_perdue?: number;
}

interface StockAlertsData {
  resume: {
    total_alertes: number;
    stock_critique: number;
    expiration_proche: number;
    articles_expires: number;
    surstock: number;
  };
  alertes: {
    critical_stock: any[];
    expiring_soon: any[];
    expired_items: any[];
    low_stock_trends: any[];
    overstock_items: any[];
  };
  recommandations: StockAlert[];
}

const StockAlertsPage: React.FC = () => {
  const { user } = useAuth();
  const [alertsData, setAlertsData] = useState<StockAlertsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStockAlerts();
  }, []);

  const fetchStockAlerts = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/v1/stock/alerts-advanced', {
        method: 'GET'
      });

      if (response.success) {
        setAlertsData(response.data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (urgence: string) => {
    switch (urgence) {
      case 'CRITIQUE': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'ÉLEVÉE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'MODÉRÉE': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'URGENT': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'CRITIQUE': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'ATTENTION': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des alertes...</p>
        </div>
      </div>
    );
  }

  if (!alertsData) {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Aucune alerte de stock disponible
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Alertes de Stock - Laboratoire
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Surveillez et gérez vos alertes de stock en temps réel
        </p>
      </div>

      {/* Résumé des alertes */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <AlertIcon className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertsData.resume.total_alertes}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Alertes</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <StockWarningIcon className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertsData.resume.stock_critique}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Stock Critique</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <ClockIcon className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertsData.resume.expiration_proche}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Expiration Proche</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <ExclamationIcon className="w-8 h-8 text-red-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertsData.resume.articles_expires}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Articles Expirés</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <StockValueIcon className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {alertsData.resume.surstock}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Surstock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation des onglets */}
      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'overview'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Vue d'ensemble
        </button>
        <button
          onClick={() => setActiveTab('critical')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'critical'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Stock Critique
        </button>
        <button
          onClick={() => setActiveTab('expiring')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'expiring'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Expiration Proche
        </button>
        <button
          onClick={() => setActiveTab('expired')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'expired'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Articles Expirés
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeTab === 'recommendations'
              ? 'bg-purple-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Recommandations
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Recommandations principales */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Actions Prioritaires
            </h3>
            <div className="space-y-3">
              {alertsData.recommandations.slice(0, 3).map((rec, index) => (
                <div key={index} className={`p-3 rounded-lg ${getAlertTypeColor(rec.type)}`}>
                  <div className="font-medium">{rec.message}</div>
                  {rec.articles && (
                    <div className="text-sm mt-1">
                      Articles concernés: {rec.articles.join(', ')}
                    </div>
                  )}
                  {rec.valeur_perdue && (
                    <div className="text-sm mt-1">
                      Valeur perdue: {formatCDF(rec.valeur_perdue)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Graphique des alertes par type */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Répartition des Alertes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{alertsData.resume.stock_critique}</div>
                <div className="text-sm text-gray-600">Stock Critique</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{alertsData.resume.expiration_proche}</div>
                <div className="text-sm text-gray-600">Expiration Proche</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{alertsData.resume.articles_expires}</div>
                <div className="text-sm text-gray-600">Articles Expirés</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{alertsData.resume.surstock}</div>
                <div className="text-sm text-gray-600">Surstock</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'critical' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Articles en Stock Critique
          </h3>
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
                    Quantité Actuelle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Seuil Critique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jours Restants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Urgence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {alertsData.alertes.critical_stock.map((stock: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {stock.article?.nom_article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.article?.categorie?.nom_categorie}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.quantite_actuelle} {stock.article?.unite_mesure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.seuil_critique} {stock.article?.unite_mesure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {stock.jours_restants} jours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(stock.urgence)}`}>
                        {stock.urgence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expiring' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Articles Proches de l'Expiration
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Numéro de Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité Restante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date d'Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jours Restants
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Urgence
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {alertsData.alertes.expiring_soon.map((lot: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {lot.nom_article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lot.numero_lot || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lot.quantite_restante} {lot.unite_mesure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lot.jours_avant_expiration} jours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(lot.urgence)}`}>
                        {lot.urgence}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'expired' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Articles Expirés
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Article
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Numéro de Lot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quantité Expirée
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date d'Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Jours Expirés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Valeur Perdue
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {alertsData.alertes.expired_items.map((lot: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {lot.nom_article}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lot.numero_lot || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lot.quantite_restante} {lot.unite_mesure}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(lot.date_expiration).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {lot.jours_expires} jours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCDF(lot.valeur_perdue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recommandations d'Actions
          </h3>
          <div className="space-y-4">
            {alertsData.recommandations.map((rec, index) => (
              <div key={index} className={`p-4 rounded-lg border-l-4 ${getAlertTypeColor(rec.type)}`}>
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    {rec.type === 'URGENT' && <AlertHexaIcon className="w-5 h-5 text-red-600" />}
                    {rec.type === 'CRITIQUE' && <AlertIcon className="w-5 h-5 text-orange-600" />}
                    {rec.type === 'ATTENTION' && <ClockIcon className="w-5 h-5 text-yellow-600" />}
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {rec.type}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                      {rec.message}
                    </p>
                    {rec.articles && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">Articles concernés:</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {rec.articles.map((article, idx) => (
                            <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {article}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {rec.valeur_perdue && (
                      <div className="mt-2">
                        <span className="text-xs font-medium text-gray-500">Valeur perdue:</span>
                        <span className="ml-2 text-sm font-medium text-red-600">
                          {formatCDF(rec.valeur_perdue)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAlertsPage;
