import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/apiClient';
import { formatCDF } from '../../lib/currency';
import { PieChartIcon, DownloadIcon, BoxIcon } from '../../icons';

interface ReportFilters {
  period: string;
  start_date?: string;
  end_date?: string;
  group_by?: string;
  sort_by?: string;
  sort_direction?: string;
  limit?: number;
}

interface FilterOptions {
  periods: string[];
  group_by_options: string[];
  sort_options: string[];
}

interface ReportData {
  summary?: {
    total_articles?: number;
    total_value?: number;
    critical_items?: number;
    expired_items?: number;
    total_exams?: number;
    completed_exams?: number;
    pending_exams?: number;
    completion_rate?: number;
    total_invoices?: number;
    total_revenue?: number;
    pending_amount?: number;
    payment_rate?: number;
  };
  articles?: Array<{
    nom_article: string;
    nom_categorie: string;
    quantite_actuelle: number;
    prix_unitaire: number;
  }>;
  exams?: Array<{
    code: string;
    patient_nom: string;
    patient_postnom: string;
    patient_prenom: string;
    medecin_nom: string;
    medecin_prenom: string;
    date_demande: string;
    statut_demande: string;
  }>;
  invoices?: Array<{
    code: string;
    patient_nom: string;
    patient_postnom: string;
    montant_total: number;
    statut_facture: string;
    date_facture: string;
  }>;
  payments?: Array<{
    facture_code: string;
    montant: number;
    methode_paiement: string;
    date_paiement: string;
  }>;
}

export default function ReportsPage() {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    period: 'month',
    group_by: 'day',
    sort_by: 'date',
    sort_direction: 'desc',
    limit: 100
  });
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState<string | null>(null);
  const [reportData, setReportData] = useState<ReportData | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      const response = await apiFetch('/v1/reports/filter-options');
      if (response.success) {
        setFilterOptions(response.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des options:', error);
    }
  };

  const generateReport = async (reportType: string) => {
    setLoading(true);
    setActiveReport(reportType);
    
    try {
      const response = await apiFetch(`/v1/reports/${reportType}`, {
        method: 'POST',
        body: JSON.stringify(filters)
      });

      if (response.success) {
        setReportData(response.data);
      }
    } catch (error) {
      console.error(`Erreur lors de la génération du rapport ${reportType}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/reports/download/${reportType}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `rapport_${reportType}_${filters.period}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error(`Erreur lors du téléchargement du rapport ${reportType}:`, error);
    }
  };

  const renderReportContent = () => {
    if (!activeReport || !reportData) return null;

    switch (activeReport) {
      case 'inventory':
        return <InventoryReportView data={reportData} />;
      case 'exams':
        return <ExamsReportView data={reportData} />;
      case 'financial':
        return <FinancialReportView data={reportData} />;
      default:
        return <div className="text-center text-gray-500">Type de rapport non supporté</div>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Rapports & Statistiques
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Générez et analysez des rapports détaillés sur votre activité
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
              {filterOptions?.periods.map((period) => (
                <option key={period} value={period}>
                  {period === 'this_month' ? 'Ce mois' : 
                   period === 'last_month' ? 'Mois dernier' :
                   period === 'this_year' ? 'Cette année' :
                   period === 'last_year' ? 'Année dernière' : period}
                </option>
              ))}
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
              {filterOptions?.group_by_options.map((option) => (
                <option key={option} value={option}>
                  {option === 'day' ? 'Jour' : 
                   option === 'week' ? 'Semaine' :
                   option === 'month' ? 'Mois' : option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trier par
            </label>
            <select
              value={filters.sort_by}
              onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {filterOptions?.sort_options.map((option) => (
                <option key={option} value={option}>
                  {option === 'date' ? 'Date' : 
                   option === 'amount' ? 'Montant' :
                   option === 'name' ? 'Nom' : option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Boutons des rapports */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BoxIcon className="w-8 h-8 text-blue-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Inventaire</h3>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Analysez vos stocks, articles critiques et mouvements
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => generateReport('inventory')}
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading && activeReport === 'inventory' ? 'Génération...' : 'Générer'}
            </button>
            <button
              onClick={() => downloadReport('inventory')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              title="Télécharger"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <BoxIcon className="w-8 h-8 text-green-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Examens</h3>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Suivez vos examens par statut, médecin et patient
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => generateReport('exams')}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading && activeReport === 'exams' ? 'Génération...' : 'Générer'}
            </button>
            <button
              onClick={() => downloadReport('exams')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              title="Télécharger"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <PieChartIcon className="w-8 h-8 text-purple-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Financier</h3>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Analysez vos revenus, factures et paiements
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => generateReport('financial')}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading && activeReport === 'financial' ? 'Génération...' : 'Générer'}
            </button>
            <button
              onClick={() => downloadReport('financial')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              title="Télécharger"
            >
              <DownloadIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu du rapport */}
      {renderReportContent()}
    </div>
  );
}

// Composants des rapports
function InventoryReportView({ data }: { data: ReportData }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rapport d'Inventaire</h2>
      
      {/* Résumé */}
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.summary.total_articles || 0}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Articles</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.summary.total_value ? formatCDF(data.summary.total_value) : '0 CDF'}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">Valeur Totale</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {data.summary.critical_items || 0}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">Articles Critiques</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {data.summary.expired_items || 0}
            </div>
            <div className="text-sm text-red-800 dark:text-red-200">Articles Expirés</div>
          </div>
        </div>
      )}

      {/* Articles */}
      {data.articles && data.articles.length > 0 && (
        <div className="mb-6">
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
                {data.articles.map((article, index) => (
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
    </div>
  );
}

function ExamsReportView({ data }: { data: ReportData }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rapport des Examens</h2>
      
      {/* Résumé */}
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.summary.total_exams || 0}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Examens</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.summary.completed_exams || 0}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">Terminés</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {data.summary.pending_exams || 0}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">En Attente</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.summary.completion_rate || 0}%
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200">Taux de Réussite</div>
          </div>
        </div>
      )}

      {/* Examens */}
      {data.exams && data.exams.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Liste des Examens</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.exams.map((exam, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {exam.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {exam.patient_nom} {exam.patient_postnom} {exam.patient_prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {exam.medecin_nom} {exam.medecin_prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(exam.date_demande).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        exam.statut_demande === 'Terminée' ? 'bg-green-100 text-green-800' :
                        exam.statut_demande === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {exam.statut_demande}
                      </span>
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

function FinancialReportView({ data }: { data: ReportData }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Rapport Financier</h2>
      
      {/* Résumé */}
      {data.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {data.summary.total_invoices || 0}
            </div>
            <div className="text-sm text-blue-800 dark:text-blue-200">Total Factures</div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {data.summary.total_revenue ? formatCDF(data.summary.total_revenue) : '0 CDF'}
            </div>
            <div className="text-sm text-green-800 dark:text-green-200">Revenus Totaux</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {data.summary.pending_amount ? formatCDF(data.summary.pending_amount) : '0 CDF'}
            </div>
            <div className="text-sm text-yellow-800 dark:text-yellow-200">Montants en Attente</div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {data.summary.payment_rate || 0}%
            </div>
            <div className="text-sm text-purple-800 dark:text-purple-200">Taux de Paiement</div>
          </div>
        </div>
      )}

      {/* Factures */}
      {data.invoices && data.invoices.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Factures Récentes</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {data.invoices.map((invoice, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {invoice.code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {invoice.patient_nom} {invoice.patient_postnom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {formatCDF(invoice.montant_total)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        invoice.statut_facture === 'Payée' ? 'bg-green-100 text-green-800' :
                        invoice.statut_facture === 'En attente' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.statut_facture}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(invoice.date_facture).toLocaleDateString('fr-FR')}
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
