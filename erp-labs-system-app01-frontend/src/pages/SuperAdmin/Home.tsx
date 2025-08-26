import PageMeta from "../../components/common/PageMeta";
import CompanyMetrics from "../../components/SuperAdmin/CompanyMetrics";
import RecentCompanies from "../../components/SuperAdmin/RecentCompanies";
import PermissionStats from "../../components/SuperAdmin/PermissionStats";
import QuickActions from "../../components/SuperAdmin/QuickActions";

export default function SuperAdminHome() {
  return (
    <>
      <PageMeta
        title="SuperAdmin Dashboard | ClinLab ERP"
        description="Espace SuperAdministrateur - Gestion globale du système et des compagnies"
      />
      
      <div className="p-6">
        {/* En-tête du dashboard */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Dashboard SuperAdmin
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Gestion globale du système et supervision des compagnies
          </p>
        </div>

        {/* Grille principale du dashboard */}
        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Métriques des compagnies - Pleine largeur */}
          <div className="col-span-12">
            <CompanyMetrics />
          </div>

          {/* Actions rapides - Gauche */}
          <div className="col-span-12 xl:col-span-4">
            <QuickActions />
          </div>

          {/* Compagnies récentes - Droite */}
          <div className="col-span-12 xl:col-span-8">
            <RecentCompanies />
          </div>

          {/* Statistiques des permissions - Pleine largeur */}
          <div className="col-span-12">
            <PermissionStats />
          </div>
        </div>
      </div>
    </>
  );
}
