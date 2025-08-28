import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { apiFetch } from '../../lib/apiClient';
import { 
  BoxIcon, 
  DownloadIcon, 
  FilterIcon, 
  CalendarIcon,
  ExamIcon,
  DoctorIcon,
  PatientIcon,
  DemandeIcon
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

export default function ExamsReportPage() {
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
  const [activeView, setActiveView] = useState<'summary' | 'exams' | 'by_status' | 'by_doctor' | 'by_patient'>('summary');

  useEffect(() => {
    generateReport();
  }, [filters]);

  const generateReport = async () => {
    setLoading(true);
    
    try {
      const response = await apiFetch('/v1/reports/exams', {
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
      const response = await apiFetch(`/v1/reports/download/exams`, {
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Génération du rapport...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Rapport des Examens
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Suivez vos examens par statut, médecin et patient
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
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center justify-center"
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
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Résumé
        </button>
        <button
          onClick={() => setActiveView('exams')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'exams'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Examens
        </button>
        <button
          onClick={() => setActiveView('by_status')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'by_status'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Par Statut
        </button>
        <button
          onClick={() => setActiveView('by_doctor')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'by_doctor'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Par Médecin
        </button>
        <button
          onClick={() => setActiveView('by_patient')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            activeView === 'by_patient'
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          Par Patient
        </button>
      </div>

      {/* Contenu des vues */}
      {activeView === 'summary' && reportData?.summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BoxIcon className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.total_exams || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Examens</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BoxIcon className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.completed_exams || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Terminés</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BoxIcon className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.pending_exams || 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">En Attente</div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center">
              <BoxIcon className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {reportData.summary.completion_rate || 0}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Taux de Réussite</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'exams' && reportData?.exams && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
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
                {reportData.exams.map((exam: any, index: number) => (
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

      {activeView === 'by_status' && reportData?.exams_by_status && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Examens par Statut</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pourcentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.exams_by_status.map((status: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {status.statut_demande}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {status.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((status.count / reportData.summary.total_exams) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'by_doctor' && reportData?.exams_by_doctor && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Examens par Médecin</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Médecin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre d'Examens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pourcentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.exams_by_doctor.map((doctor: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      Dr. {doctor.nom} {doctor.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {doctor.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((doctor.count / reportData.summary.total_exams) * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeView === 'by_patient' && reportData?.exams_by_patient && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Examens par Patient</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre d'Examens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Pourcentage
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {reportData.exams_by_patient.map((patient: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {patient.nom} {patient.postnom} {patient.prenom}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {patient.count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {((patient.count / reportData.summary.total_exams) * 100).toFixed(1)}%
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
