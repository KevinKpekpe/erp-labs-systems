import PageMeta from "../../components/common/PageMeta";

export default function SuperAdminHome() {
  return (
    <>
      <PageMeta
        title="SuperAdmin | ClinLab ERP"
        description="Espace SuperAdministrateur - Gestion globale du système"
      />
      <div className="p-6">
        <h1 className="text-xl font-semibold">Espace SuperAdministrateur</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Vous êtes connecté en tant que SuperAdmin.
        </p>
      </div>
    </>
  );
}
