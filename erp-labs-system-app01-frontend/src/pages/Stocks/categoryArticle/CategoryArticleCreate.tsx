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

interface CategoryFormData {
  nom_categorie: string;
  type_laboratoire: string;
  conditions_stockage_requises: string;
  temperature_stockage_min: string;
  temperature_stockage_max: string;
  humidite_max: string;
  sensible_lumiere: boolean;
  chaine_froid_critique: boolean;
  delai_alerte_expiration: string;
}

export default function CategoryArticleCreate() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CategoryFormData>({
    nom_categorie: "",
    type_laboratoire: "",
    conditions_stockage_requises: "",
    temperature_stockage_min: "",
    temperature_stockage_max: "",
    humidite_max: "",
    sensible_lumiere: false,
    chaine_froid_critique: false,
    delai_alerte_expiration: "30",
  });
  const [error, setError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); setApiError(null);
    if (!formData.nom_categorie.trim()) { setError("Le nom de la catégorie est requis"); return; }
    
    setSubmitting(true);
    try {
      const payload = {
        nom_categorie: formData.nom_categorie,
        ...(formData.type_laboratoire && { type_laboratoire: formData.type_laboratoire }),
        ...(formData.conditions_stockage_requises && { conditions_stockage_requises: formData.conditions_stockage_requises }),
        ...(formData.temperature_stockage_min && { temperature_stockage_min: parseFloat(formData.temperature_stockage_min) }),
        ...(formData.temperature_stockage_max && { temperature_stockage_max: parseFloat(formData.temperature_stockage_max) }),
        ...(formData.humidite_max && { humidite_max: parseFloat(formData.humidite_max) }),
        sensible_lumiere: formData.sensible_lumiere,
        chaine_froid_critique: formData.chaine_froid_critique,
        delai_alerte_expiration: parseInt(formData.delai_alerte_expiration),
      };

      await apiFetch("/v1/stock/categories", { method: "POST", body: JSON.stringify(payload) }, "company");
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
              <label htmlFor="nom_categorie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de la catégorie <span className="text-red-500">*</span></label>
              <Input id="nom_categorie" type="text" placeholder="Ex: Réactifs" value={formData.nom_categorie} onChange={(e) => handleInputChange('nom_categorie', e.target.value)} className={error ? "border-red-500" : ""} />
              {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
            </div>

            {/* Type laboratoire (optionnel) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type</label>
              <select
                value={formData.type_laboratoire}
                onChange={(e) => handleInputChange('type_laboratoire', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">-- Sélectionner --</option>
                <option value="Réactifs">Réactifs</option>
                <option value="Consommables">Consommables</option>
                <option value="Équipements">Équipements</option>
                <option value="Contrôles">Contrôles</option>
                <option value="Références">Références</option>
                <option value="Kits">Kits</option>
              </select>
            </div>

            {/* Conditions de stockage (optionnel) */}
            <div>
              <label htmlFor="conditions" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions de stockage</label>
              <textarea
                id="conditions"
                rows={3}
                placeholder="Ex: À l'abri de la lumière, éviter l'humidité"
                value={formData.conditions_stockage_requises}
                onChange={(e) => handleInputChange('conditions_stockage_requises', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Températures & humidité */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Température min (°C)</label>
                <Input type="number" placeholder="Ex: 2" value={formData.temperature_stockage_min} onChange={(e) => handleInputChange('temperature_stockage_min', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Température max (°C)</label>
                <Input type="number" placeholder="Ex: 8" value={formData.temperature_stockage_max} onChange={(e) => handleInputChange('temperature_stockage_max', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Humidité max (%)</label>
                <Input type="number" placeholder="Ex: 65" value={formData.humidite_max} onChange={(e) => handleInputChange('humidite_max', e.target.value)} />
              </div>
            </div>

            {/* Sensibilités */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={formData.sensible_lumiere} onChange={(e) => handleInputChange('sensible_lumiere', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                Sensible à la lumière
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={formData.chaine_froid_critique} onChange={(e) => handleInputChange('chaine_froid_critique', e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800" />
                Chaîne du froid critique
              </label>
            </div>

            {/* Délai d'alerte */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Délai d’alerte avant expiration (jours)</label>
              <Input type="number" placeholder="Ex: 30" value={formData.delai_alerte_expiration} onChange={(e) => handleInputChange('delai_alerte_expiration', e.target.value)} />
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


