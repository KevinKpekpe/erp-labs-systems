import PageMeta from "../components/common/PageMeta";
import PermissionsTable from "../components/Permissions/PermissionsTable";
import RolePermissionsCard from "../components/Permissions/RolePermissionsCard";

export default function Permissions() {
  return (
    <>
      <PageMeta
        title="Gestion des Permissions | ClinLab ERP - Gestion de laboratoire"
        description="Gestion des permissions et rôles - ClinLab ERP - Solution de gestion complète pour laboratoires médicaux"
      />
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Gestion des Permissions
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2">
            <PermissionsTable />
          </div>
          <div>
            <RolePermissionsCard />
          </div>
        </div>
      </div>
    </>
  );
} 