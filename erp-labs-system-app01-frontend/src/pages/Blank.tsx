import PageMeta from "../components/common/PageMeta";

export default function Blank() {
  return (
    <>
      <PageMeta
        title="Page Vide | ClinLab ERP - Gestion de laboratoire"
        description="Page vide - ClinLab ERP - Solution de gestion complète pour laboratoires médicaux"
      />
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Page Vide
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500 dark:text-gray-400">
              Cette page est vide. Ajoutez votre contenu ici.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
