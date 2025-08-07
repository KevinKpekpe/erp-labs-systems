import { UsersIcon, TestTubeIcon, CompanyIcon, PieChartIcon } from "../../icons";

export default function CompanyStatsCard() {
  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
          <PieChartIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black dark:text-white">
            Statistiques
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Vue d'ensemble du laboratoire
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Employés
              </p>
              <p className="text-lg font-bold text-black dark:text-white">
                24
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600 dark:text-green-400">
              +12%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              vs mois dernier
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg dark:bg-green-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <TestTubeIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Examens/mois
              </p>
              <p className="text-lg font-bold text-black dark:text-white">
                1,247
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600 dark:text-green-400">
              +8%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              vs mois dernier
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg dark:bg-purple-900/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
              <CompanyIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Patients/mois
              </p>
              <p className="text-lg font-bold text-black dark:text-white">
                892
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-green-600 dark:text-green-400">
              +15%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              vs mois dernier
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-black dark:text-white mb-3">
          Répartition par Département
        </h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Réception
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              6 employés
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Laboratoire
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              12 employés
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Administration
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              4 employés
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Comptabilité
            </span>
            <span className="text-sm font-medium text-black dark:text-white">
              2 employés
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-medium text-black dark:text-white mb-3">
          Informations Système
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Version ERP
            </span>
            <span className="text-black dark:text-white">
              2.0.2
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Dernière mise à jour
            </span>
            <span className="text-black dark:text-white">
              15/01/2025
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-300">
              Statut
            </span>
            <span className="text-green-600 dark:text-green-400">
              Actif
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 