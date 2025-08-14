import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon } from "../../../icons";
import Input from "../../../components/form/input/InputField";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function CategoryArticleCreate() {
  const navigate = useNavigate();
  const [nom, setNom] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setApiError(null);
    if (!nom.trim()) { setError("Le nom de la catégorie est requis"); return; }
    setSubmitting(true);
    try {
      await apiFetch("/v1/stock/categories", { method: "POST", body: JSON.stringify({ nom_categorie: nom }) }, "company");
      navigate("/stocks/categories", { state: { success: "Catégorie créée avec succès." } });
    } catch (err: unknown) {
      setApiError(getErrorMessage(err));
    } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Nouvelle catégorie | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/stocks/categories" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouvelle catégorie</h2>
          </div>
        </div>
        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            <div>
              <label htmlFor="nom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la catégorie <span className="text-red-500">*</span></label>
              <Input id="nom" type="text" placeholder="Ex: Réactifs" value={nom} onChange={(e) => setNom(e.target.value)} className={error ? "border-red-500" : ""} />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-6">
              <Link to="/stocks/categories" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Création...</>) : (<><CheckLineIcon className="mr-2 h-4 w-4" />Créer</>)}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


