import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";

export default function NotFound() {
  return (
    <>
      <PageMeta
        title="Page Non Trouvée | ClinLab ERP - Gestion de laboratoire"
        description="Page non trouvée - ClinLab ERP - Solution de gestion complète pour laboratoires médicaux"
      />
      <div className="flex h-screen items-center justify-center bg-white dark:bg-boxdark">
        <div className="w-full max-w-[410px]">
          <div className="w-full">
            <div className="mb-8 flex justify-center">
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="ClinLab ERP"
                width={176}
                height={32}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="ClinLab ERP"
                width={176}
                height={32}
              />
            </div>

            <div className="mb-8 text-center">
              <h1 className="mb-3 text-2xl font-bold text-black dark:text-white sm:text-3xl">
                Erreur 404
              </h1>
              <p className="text-base font-medium text-body-color">
                Désolé, la page que vous recherchez n'existe pas.
              </p>
            </div>

            <div className="mb-8 text-center">
              <h2 className="mb-2 text-3xl font-bold text-black dark:text-white">
                404
              </h2>
              <h3 className="mb-2 text-xl font-semibold text-body-color">
                Page Non Trouvée
              </h3>
              <p className="text-base text-body-color">
                La page que vous recherchez n'existe pas ou a été déplacée.
              </p>
            </div>

            <div className="flex items-center justify-center">
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
