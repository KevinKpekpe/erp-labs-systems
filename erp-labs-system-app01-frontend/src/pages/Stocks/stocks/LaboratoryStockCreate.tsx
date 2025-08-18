import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { ChevronLeftIcon, CheckLineIcon, AlertIcon } from "../../../icons";

interface Article {
  id: number;
  nom_article: string;
  categorie?: {
    id: number;
    nom_categorie: string;
    type_laboratoire?: string;
    conditions_stockage_requises?: string;
    temperature_stockage_min?: number;
    temperature_stockage_max?: number;
    sensible_lumiere: boolean;
    chaine_froid_critique: boolean;
    delai_alerte_expiration: number;
  };
}

interface StockFormData {
  article_id: string;
  seuil_critique: string;
  // Données du lot initial
  quantite_initiale: string;
  date_entree: string;
  date_expiration: string;
  prix_unitaire_achat: string;
  numero_lot: string;
  fournisseur_lot: string;
  commentaire: string;
}

function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

export default function LaboratoryStockCreate() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<StockFormData>({
    article_id: '',
    seuil_critique: '',
    quantite_initiale: '',
    date_entree: new Date().toISOString().split('T')[0],
    date_expiration: '',
    prix_unitaire_achat: '',
    numero_lot: '',
    fournisseur_lot: '',
    commentaire: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadArticles = async () => {
    try {
      const resp = await apiFetch<any>('/v1/stock/articles?per_page=100&with_categories=1', { method: 'GET' }, 'company');
      const data = resp?.data?.data ?? (Array.isArray(resp) ? resp : []);
      const mapped: Article[] = (data as any[]).map((r: any) => ({
        id: Number(r.id),
        nom_article: String(r.nom_article),
        categorie: r.categorie ? {
          id: Number(r.categorie.id),
          nom_categorie: String(r.categorie.nom_categorie),
          type_laboratoire: r.categorie.type_laboratoire ? String(r.categorie.type_laboratoire) : undefined,
          conditions_stockage_requises: r.categorie.conditions_stockage_requises ? String(r.categorie.conditions_stockage_requises) : undefined,
          temperature_stockage_min: r.categorie.temperature_stockage_min ? Number(r.categorie.temperature_stockage_min) : undefined,
          temperature_stockage_max: r.categorie.temperature_stockage_max ? Number(r.categorie.temperature_stockage_max) : undefined,
          sensible_lumiere: Boolean(r.categorie.sensible_lumiere),
          chaine_froid_critique: Boolean(r.categorie.chaine_froid_critique),
          delai_alerte_expiration: Number(r.categorie.delai_alerte_expiration || 30),
        } : undefined,
      }));
      setArticles(mapped);
    } catch (e) {
      console.error('Erreur chargement articles:', e);
    }
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleInputChange = (field: keyof StockFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Si on change l'article, mettre à jour l'article sélectionné
    if (field === 'article_id') {
      const article = articles.find(a => a.id === Number(value));
      setSelectedArticle(article || null);
      
      // Calculer la date d'expiration suggérée
      if (article?.categorie?.delai_alerte_expiration) {
        const suggestedExpiration = new Date();
        suggestedExpiration.setDate(suggestedExpiration.getDate() + article.categorie.delai_alerte_expiration + 90); // +3 mois par défaut
        setFormData(prev => ({ 
          ...prev, 
          date_expiration: suggestedExpiration.toISOString().split('T')[0] 
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.article_id) newErrors.article_id = 'Article requis';
    if (!formData.seuil_critique) newErrors.seuil_critique = 'Seuil critique requis';
    if (!formData.quantite_initiale) newErrors.quantite_initiale = 'Quantité initiale requise';
    if (!formData.numero_lot) newErrors.numero_lot = 'Numéro de lot requis';

    // Validation des conditions de laboratoire
    if (selectedArticle?.categorie?.chaine_froid_critique && !formData.date_expiration) {
      newErrors.date_expiration = 'Date d\'expiration obligatoire pour la chaîne du froid critique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      // 1. Créer le stock
      const stockPayload = {
        article_id: Number(formData.article_id),
        seuil_critique: Number(formData.seuil_critique),
      };

      const stockResp = await apiFetch('/v1/stock/stocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stockPayload),
      }, 'company');

      const stockId = (stockResp as any)?.data?.id || (stockResp as any)?.id;

      // 2. Créer le lot initial si quantité fournie
      if (formData.quantite_initiale && Number(formData.quantite_initiale) > 0) {
        const lotPayload = {
          article_id: Number(formData.article_id),
          quantite_initiale: Number(formData.quantite_initiale),
          date_entree: formData.date_entree,
          date_expiration: formData.date_expiration || null,
          prix_unitaire_achat: formData.prix_unitaire_achat ? Number(formData.prix_unitaire_achat) : null,
          numero_lot: formData.numero_lot,
          fournisseur_lot: formData.fournisseur_lot || null,
          commentaire: formData.commentaire || 'Lot initial créé lors de la création du stock',
        };

        await apiFetch(`/v1/stock/stocks/${stockId}/lots`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lotPayload),
        }, 'company');
      }

      navigate('/stocks/stocks', { 
        state: { success: 'Stock de laboratoire créé avec succès.' } 
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

  return (
    <>
      <Helmet><title>Nouveau stock laboratoire | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/stocks/stocks" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />Retour
            </Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouveau stock laboratoire</h2>
          </div>
        </div>

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            {/* Sélection d'article */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Article à stocker</h3>
              
              <div>
                <label htmlFor="article_id" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Article <span className="text-red-500">*</span>
                </label>
                <Select
                  id="article_id"
                  value={formData.article_id}
                  onChange={(e) => handleInputChange('article_id', e.target.value)}
                  className={errors.article_id ? "border-red-500" : ""}
                >
                  <option value="">Sélectionner un article</option>
                  {articles.map(article => (
                    <option key={article.id} value={article.id}>
                      {article.nom_article}
                      {article.categorie?.type_laboratoire && ` (${article.categorie.type_laboratoire})`}
                    </option>
                  ))}
                </Select>
                {errors.article_id && <p className="mt-1 text-sm text-red-500">{errors.article_id}</p>}
              </div>

              {/* Informations de la catégorie */}
              {selectedArticle?.categorie && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                  <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                    Conditions de laboratoire
                  </h4>
                  <div className="space-y-2 text-sm">
                    {selectedArticle.categorie.type_laboratoire && (
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Type:</strong> {selectedArticle.categorie.type_laboratoire}
                      </p>
                    )}
                    {selectedArticle.categorie.conditions_stockage_requises && (
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Conditions:</strong> {selectedArticle.categorie.conditions_stockage_requises}
                      </p>
                    )}
                    {getTemperatureDisplay(selectedArticle.categorie.temperature_stockage_min, selectedArticle.categorie.temperature_stockage_max) && (
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Température:</strong> {getTemperatureDisplay(selectedArticle.categorie.temperature_stockage_min, selectedArticle.categorie.temperature_stockage_max)}
                      </p>
                    )}
                    <div className="flex gap-4">
                      {selectedArticle.categorie.sensible_lumiere && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          Sensible lumière
                        </span>
                      )}
                      {selectedArticle.categorie.chaine_froid_critique && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          <AlertIcon className="w-3 h-3 mr-1" />
                          Chaîne froid critique
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="seuil_critique" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Seuil critique <span className="text-red-500">*</span>
                </label>
                <Input
                  id="seuil_critique"
                  type="number"
                  min="0"
                  placeholder="Ex: 10"
                  value={formData.seuil_critique}
                  onChange={(e) => handleInputChange('seuil_critique', e.target.value)}
                  className={errors.seuil_critique ? "border-red-500" : ""}
                />
                {errors.seuil_critique && <p className="mt-1 text-sm text-red-500">{errors.seuil_critique}</p>}
              </div>
            </div>

            {/* Lot initial */}
            <div className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Lot initial (optionnel)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quantite_initiale" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Quantité initiale
                  </label>
                  <Input
                    id="quantite_initiale"
                    type="number"
                    min="0"
                    placeholder="Ex: 100"
                    value={formData.quantite_initiale}
                    onChange={(e) => handleInputChange('quantite_initiale', e.target.value)}
                    className={errors.quantite_initiale ? "border-red-500" : ""}
                  />
                  {errors.quantite_initiale && <p className="mt-1 text-sm text-red-500">{errors.quantite_initiale}</p>}
                </div>

                <div>
                  <label htmlFor="numero_lot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de lot <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="numero_lot"
                    type="text"
                    placeholder="Ex: LOT-2024-001"
                    value={formData.numero_lot}
                    onChange={(e) => handleInputChange('numero_lot', e.target.value)}
                    className={errors.numero_lot ? "border-red-500" : ""}
                  />
                  {errors.numero_lot && <p className="mt-1 text-sm text-red-500">{errors.numero_lot}</p>}
                </div>

                <div>
                  <label htmlFor="date_entree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date d'entrée
                  </label>
                  <Input
                    id="date_entree"
                    type="date"
                    value={formData.date_entree}
                    onChange={(e) => handleInputChange('date_entree', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="date_expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date d'expiration
                    {selectedArticle?.categorie?.chaine_froid_critique && <span className="text-red-500"> *</span>}
                  </label>
                  <Input
                    id="date_expiration"
                    type="date"
                    value={formData.date_expiration}
                    onChange={(e) => handleInputChange('date_expiration', e.target.value)}
                    className={errors.date_expiration ? "border-red-500" : ""}
                  />
                  {errors.date_expiration && <p className="mt-1 text-sm text-red-500">{errors.date_expiration}</p>}
                </div>

                <div>
                  <label htmlFor="prix_unitaire_achat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix unitaire d'achat (€)
                  </label>
                  <Input
                    id="prix_unitaire_achat"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ex: 2.50"
                    value={formData.prix_unitaire_achat}
                    onChange={(e) => handleInputChange('prix_unitaire_achat', e.target.value)}
                  />
                </div>

                <div>
                  <label htmlFor="fournisseur_lot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Fournisseur
                  </label>
                  <Input
                    id="fournisseur_lot"
                    type="text"
                    placeholder="Ex: Siemens Healthcare"
                    value={formData.fournisseur_lot}
                    onChange={(e) => handleInputChange('fournisseur_lot', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Commentaire
                </label>
                <textarea
                  id="commentaire"
                  rows={3}
                  placeholder="Informations supplémentaires sur ce lot..."
                  value={formData.commentaire}
                  onChange={(e) => handleInputChange('commentaire', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
              <Link 
                to="/stocks/stocks" 
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </Link>
              <button 
                disabled={submitting} 
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckLineIcon className="mr-2 h-4 w-4" />
                {submitting ? "Création..." : "Créer le stock"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
