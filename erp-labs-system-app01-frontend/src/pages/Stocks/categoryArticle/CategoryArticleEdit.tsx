import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon, AlertIcon } from "../../../icons";
import Input from "../../../components/form/input/InputField";
import { Link, useNavigate, useParams } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";

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

interface Category extends CategoryFormData {
  id: number;
  code: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function CategoryArticleEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [category, setCategory] = useState<Category | null>(null);
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadCategory = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const resp = await apiFetch<{ data: Category }>(`/v1/stock/categories/${id}`, { method: 'GET' }, 'company');
      const cat = resp.data;
      setCategory(cat);
      setFormData({
        nom_categorie: cat.nom_categorie || "",
        type_laboratoire: cat.type_laboratoire || "",
        conditions_stockage_requises: cat.conditions_stockage_requises || "",
        temperature_stockage_min: cat.temperature_stockage_min?.toString() || "",
        temperature_stockage_max: cat.temperature_stockage_max?.toString() || "",
        humidite_max: cat.humidite_max?.toString() || "",
        sensible_lumiere: Boolean(cat.sensible_lumiere),
        chaine_froid_critique: Boolean(cat.chaine_froid_critique),
        delai_alerte_expiration: cat.delai_alerte_expiration?.toString() || "30",
      });
    } catch (err: unknown) {
      setApiError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategory();
  }, [id]);

  const handleInputChange = (field: keyof CategoryFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom_categorie.trim()) newErrors.nom_categorie = 'Le nom de la catégorie est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;
    if (!id) return;

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

      await apiFetch(`/v1/stock/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }, 'company');

      navigate('/stocks/categories', { 
        state: { success: 'Catégorie modifiée avec succès.' } 
      });
    } catch (err: unknown) {
      setApiError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const getTemperatureDisplay = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `${min}°C à ${max}°C`;
    if (min) return `> ${min}°C`;
    if (max) return `< ${max}°C`;
    return null;
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <Alert variant="error" title="Erreur" message="Catégorie non trouvée" />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Modifier catégorie | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/stocks/categories" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />Retour
            </Link>
            <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Modifier catégorie</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">{category.code} - {category.nom_categorie}</p>
            </div>
          </div>
        </div>

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informations générales</h3>
              
              <div>
                <label htmlFor="nom_categorie" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom de la catégorie <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nom_categorie"
                  type="text"
                  placeholder="Ex: Réactifs Biochimie"
                  value={formData.nom_categorie}
                  onChange={(e) => handleInputChange('nom_categorie', e.target.value)}
                  className={errors.nom_categorie ? "border-red-500" : ""}
                />
                {errors.nom_categorie && <p className="mt-1 text-sm text-red-500">{errors.nom_categorie}</p>}
              </div>

            <div>
                <label htmlFor="type_laboratoire" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type de laboratoire
                </label>
                <select
                  id="type_laboratoire"
                  value={formData.type_laboratoire}
                  onChange={(e) => handleInputChange('type_laboratoire', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Aucun (catégorie standard)</option>
                  <option value="Réactifs">Réactifs</option>
                  <option value="Consommables">Consommables</option>
                  <option value="Équipements">Équipements</option>
                  <option value="Contrôles">Contrôles</option>
                  <option value="Références">Références</option>
                  <option value="Kits">Kits</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
            </div>

            {/* Conditions de stockage - affiché seulement si type laboratoire sélectionné */}
            {formData.type_laboratoire && (
              <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Conditions de stockage</h3>
                
                <div>
                  <label htmlFor="conditions_stockage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description des conditions
                  </label>
                  <textarea
                    id="conditions_stockage"
                    rows={3}
                    placeholder="Ex: Réfrigération +2°C à +8°C, à l'abri de la lumière"
                    value={formData.conditions_stockage_requises}
                    onChange={(e) => handleInputChange('conditions_stockage_requises', e.target.value)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="temp_min" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Température min (°C)
                    </label>
                    <Input
                      id="temp_min"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 2"
                      value={formData.temperature_stockage_min}
                      onChange={(e) => handleInputChange('temperature_stockage_min', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="temp_max" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Température max (°C)
                    </label>
                    <Input
                      id="temp_max"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 8"
                      value={formData.temperature_stockage_max}
                      onChange={(e) => handleInputChange('temperature_stockage_max', e.target.value)}
                    />
                  </div>

                  <div>
                    <label htmlFor="humidite_max" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Humidité max (%)
                    </label>
                    <Input
                      id="humidite_max"
                      type="number"
                      step="0.1"
                      placeholder="Ex: 60"
                      value={formData.humidite_max}
                      onChange={(e) => handleInputChange('humidite_max', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center">
                    <input
                      id="sensible_lumiere"
                      type="checkbox"
                      checked={formData.sensible_lumiere}
                      onChange={(e) => handleInputChange('sensible_lumiere', e.target.checked)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="sensible_lumiere" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Sensible à la lumière
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="chaine_froid_critique"
                      type="checkbox"
                      checked={formData.chaine_froid_critique}
                      onChange={(e) => handleInputChange('chaine_froid_critique', e.target.checked)}
                      className="h-4 w-4 text-brand-600 focus:ring-brand-500 border-gray-300 rounded dark:border-gray-600 dark:bg-gray-700"
                    />
                    <label htmlFor="chaine_froid_critique" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                      Chaîne du froid critique
                    </label>
                  </div>
                </div>

                <div>
                  <label htmlFor="delai_alerte" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Délai d'alerte avant expiration (jours)
                  </label>
                  <Input
                    id="delai_alerte"
                    type="number"
                    min="1"
                    placeholder="30"
                    value={formData.delai_alerte_expiration}
                    onChange={(e) => handleInputChange('delai_alerte_expiration', e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Aperçu actuel */}
            {category && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Aperçu actuel</h3>
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-md dark:bg-gray-800/50 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100">{category.nom_categorie}</h4>
                    {category.type_laboratoire && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {category.type_laboratoire}
                      </span>
                    )}
                  </div>
                  
                  {category.type_laboratoire && (
                    <div className="space-y-2 text-sm">
                      {category.conditions_stockage_requises && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Conditions:</strong> {category.conditions_stockage_requises}
                        </p>
                      )}
                      {getTemperatureDisplay(category.temperature_stockage_min, category.temperature_stockage_max) && (
                        <p className="text-gray-600 dark:text-gray-300">
                          <strong>Température:</strong> {getTemperatureDisplay(category.temperature_stockage_min, category.temperature_stockage_max)}
                        </p>
                      )}
                      <div className="flex gap-2">
                        {category.sensible_lumiere && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                            💡 Sensible lumière
                          </span>
                        )}
                        {category.chaine_froid_critique && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                            <AlertIcon className="w-3 h-3 mr-1" />
                            Chaîne froid critique
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Link 
                to="/stocks/categories" 
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </Link>
              <button 
                disabled={submitting} 
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckLineIcon className="mr-2 h-4 w-4" />
                {submitting ? "Modification..." : "Modifier la catégorie"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}