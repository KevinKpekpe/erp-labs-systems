import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { PlusIcon, AlertIcon, BoltIcon as ThermometerIcon, InfoIcon as DropletIcon } from "../../../icons";

interface LaboratoryCategory {
  id: number;
  code: string;
  nom_categorie: string;
  type_laboratoire?: string;
  conditions_stockage_requises?: string;
  temperature_stockage_min?: number;
  temperature_stockage_max?: number;
  humidite_max?: number;
  sensible_lumiere: boolean;
  chaine_froid_critique: boolean;
  delai_alerte_expiration: number;
  articles_count?: number;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as { message?: string }).message || '');
  return 'Une erreur est survenue.';
}

export default function LaboratoryCategoryList() {
  const location = useLocation();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<LaboratoryCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const resp = await apiFetch<{ data?: { data?: unknown[] } } | unknown[]>('/v1/stock/categories?per_page=100', { method: 'GET' }, 'company');
      const data = (resp as { data?: { data?: unknown[] } })?.data?.data ?? (Array.isArray(resp) ? resp : []);
      const mapped: LaboratoryCategory[] = (data as Record<string, unknown>[]).map((r) => ({
        id: Number(r.id),
        code: String(r.code),
        nom_categorie: String(r.nom_categorie),
        type_laboratoire: r.type_laboratoire ? String(r.type_laboratoire) : undefined,
        conditions_stockage_requises: r.conditions_stockage_requises ? String(r.conditions_stockage_requises) : undefined,
        temperature_stockage_min: r.temperature_stockage_min ? Number(r.temperature_stockage_min) : undefined,
        temperature_stockage_max: r.temperature_stockage_max ? Number(r.temperature_stockage_max) : undefined,
        humidite_max: r.humidite_max ? Number(r.humidite_max) : undefined,
        sensible_lumiere: Boolean(r.sensible_lumiere),
        chaine_froid_critique: Boolean(r.chaine_froid_critique),
        delai_alerte_expiration: Number(r.delai_alerte_expiration || 30),
        articles_count: r.articles_count ? Number(r.articles_count) : 0,
      }));
      setCategories(mapped);
    } catch (e) {
      setApiError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const state = (location.state as { success?: string } | null) || null;
    if (state?.success) {
      setSuccessMessage(state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    loadCategories();
  }, []);

  const getTemperatureDisplay = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `${min}°C à ${max}°C`;
    if (min) return `> ${min}°C`;
    if (max) return `< ${max}°C`;
    return null;
  };

  const getTypeColor = (type?: string) => {
    switch (type) {
      case 'Réactifs': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Consommables': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Équipements': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'Contrôles': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Références': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'Kits': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  return (
    <>
      <Helmet><title>Catégories d'articles | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Catégories d'articles</h2>
          <div className="flex items-center gap-3">
            <Link 
              to="/stocks/categories/nouveau" 
              className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Nouvelle catégorie
            </Link>
          </div>
        </div>

        {successMessage && (
          <div className="mb-6">
            <Alert variant="success" title="Succès" message={successMessage} />
          </div>
        )}

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {categories.map(category => (
            <div key={category.id} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              {/* En-tête */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{category.nom_categorie}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{category.code}</p>
                </div>
                {category.type_laboratoire && (
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(category.type_laboratoire)}`}>
                    {category.type_laboratoire}
                  </span>
                )}
              </div>

              {/* Conditions de stockage */}
              {category.conditions_stockage_requises && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-300">{category.conditions_stockage_requises}</p>
                </div>
              )}

              {/* Informations techniques */}
              <div className="space-y-3">
                {/* Température */}
                {getTemperatureDisplay(category.temperature_stockage_min, category.temperature_stockage_max) && (
                  <div className="flex items-center gap-2">
                    <ThermometerIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getTemperatureDisplay(category.temperature_stockage_min, category.temperature_stockage_max)}
                    </span>
                  </div>
                )}

                {/* Humidité */}
                {category.humidite_max && (
                  <div className="flex items-center gap-2">
                    <DropletIcon className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Humidité max: {category.humidite_max}%
                    </span>
                  </div>
                )}

                {/* Alertes et sensibilités */}
                <div className="flex flex-wrap gap-2">
                  {category.sensible_lumiere && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                      Sensible lumière
                    </span>
                  )}
                  {category.chaine_froid_critique && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                      <AlertIcon className="w-3 h-3 mr-1" />
                      Chaîne froid critique
                    </span>
                  )}
                </div>

                {/* Délai d'alerte */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Alerte: {category.delai_alerte_expiration} jours
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {category.articles_count || 0} articles
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/stocks/categories/${category.id}/modifier`}
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Modifier
                </Link>
                <Link
                  to={`/stocks/articles?categorie_id=${category.id}`}
                  className="flex-1 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  Voir articles
                </Link>
              </div>
            </div>
          ))}

          {categories.length === 0 && !loading && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Aucune catégorie de laboratoire trouvée</p>
              <Link 
                to="/stocks/categories/nouveau" 
                className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Créer la première catégorie
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
