import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { CheckLineIcon } from "../../../icons";

interface Stock {
  id: number;
  code: string;
  article?: { id: number; nom_article: string };
}

interface FormData {
  quantite_initiale: string;
  date_entree: string;
  date_expiration: string;
  prix_unitaire_achat: string;
  numero_lot: string;
  fournisseur_lot: string;
  commentaire: string;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getErrorMessage(err: unknown): string {
  if (isObject(err) && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

function getCurrentDate(): string {
  return new Date().toISOString().slice(0, 16);
}

function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export default function StockLotCreate() {
  const { stockId } = useParams<{ stockId: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<FormData>({
    quantite_initiale: '',
    date_entree: getCurrentDate(),
    date_expiration: '',
    prix_unitaire_achat: '',
    numero_lot: '',
    fournisseur_lot: '',
    commentaire: '',
  });

  const loadStock = async () => {
    if (!stockId || isNaN(Number(stockId))) {
      setApiError('ID de stock invalide');
      return;
    }
    try {
      const resp = await apiFetch<any>(`/v1/stock/stocks/${stockId}`, { method: 'GET' }, 'company');
      const data = resp?.data || resp;
      setStock({
        id: Number(data.id),
        code: String(data.code),
        article: data.article ? {
          id: Number(data.article.id),
          nom_article: String(data.article.nom_article)
        } : undefined
      });
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    loadStock();
  }, [stockId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    if (!formData.quantite_initiale || Number(formData.quantite_initiale) <= 0) {
      errors.quantite_initiale = ['La quantité initiale est obligatoire et doit être supérieure à 0'];
    }

    if (!formData.date_entree) {
      errors.date_entree = ['La date d\'entrée est obligatoire'];
    }

    if (formData.date_expiration && new Date(formData.date_expiration) <= new Date()) {
      errors.date_expiration = ['La date d\'expiration doit être postérieure à aujourd\'hui'];
    }

    if (formData.prix_unitaire_achat && Number(formData.prix_unitaire_achat) < 0) {
      errors.prix_unitaire_achat = ['Le prix unitaire doit être positif'];
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !stockId || !stock) return;

    setLoading(true);
    setApiError(null);

    try {
      const payload = {
        article_id: stock.article?.id,
        quantite_initiale: Number(formData.quantite_initiale),
        date_entree: formData.date_entree,
        date_expiration: formData.date_expiration || null,
        prix_unitaire_achat: formData.prix_unitaire_achat ? Number(formData.prix_unitaire_achat) : null,
        numero_lot: formData.numero_lot || null,
        fournisseur_lot: formData.fournisseur_lot || null,
        commentaire: formData.commentaire || null,
      };

      await apiFetch(
        `/v1/stock/stocks/${stockId}/lots`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        'company'
      );

      navigate(`/stocks/stocks/${stockId}/lots`, {
        state: { success: 'Lot créé avec succès' }
      });
    } catch (e: any) {
      if (e.status === 422 && e.errors) {
        setValidationErrors(e.errors);
      } else {
        setApiError(getErrorMessage(e));
      }
    } finally {
      setLoading(false);
    }
  };

  if (!stockId || isNaN(Number(stockId))) {
    return <div>ID de stock manquant ou invalide</div>;
  }

  return (
    <>
      <Helmet><title>Nouveau Lot - {stock?.article?.nom_article || 'Chargement...'} | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Nouveau Lot
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Article: {stock?.article?.nom_article || 'Chargement...'} - Code stock: {stock?.code}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link 
              to={`/stocks/stocks/${stockId}/lots`} 
              className="inline-flex items-center justify-center rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
            >
              Annuler
            </Link>
          </div>
        </div>

        {apiError && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={apiError} />
          </div>
        )}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Quantité initiale */}
              <div>
                <label htmlFor="quantite_initiale" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantité initiale *
                </label>
                <input
                  type="number"
                  id="quantite_initiale"
                  min="1"
                  value={formData.quantite_initiale}
                  onChange={(e) => handleInputChange('quantite_initiale', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    validationErrors.quantite_initiale 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
                  } dark:border-gray-700 dark:bg-gray-800`}
                />
                {validationErrors.quantite_initiale && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.quantite_initiale[0]}</p>
                )}
              </div>

              {/* Prix unitaire d'achat */}
              <div>
                <label htmlFor="prix_unitaire_achat" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Prix unitaire d'achat (€)
                </label>
                <input
                  type="number"
                  id="prix_unitaire_achat"
                  step="0.01"
                  min="0"
                  value={formData.prix_unitaire_achat}
                  onChange={(e) => handleInputChange('prix_unitaire_achat', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    validationErrors.prix_unitaire_achat 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
                  } dark:border-gray-700 dark:bg-gray-800`}
                />
                {validationErrors.prix_unitaire_achat && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.prix_unitaire_achat[0]}</p>
                )}
              </div>

              {/* Date d'entrée */}
              <div>
                <label htmlFor="date_entree" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'entrée *
                </label>
                <input
                  type="datetime-local"
                  id="date_entree"
                  value={formData.date_entree}
                  onChange={(e) => handleInputChange('date_entree', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    validationErrors.date_entree 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
                  } dark:border-gray-700 dark:bg-gray-800`}
                />
                {validationErrors.date_entree && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date_entree[0]}</p>
                )}
              </div>

              {/* Date d'expiration */}
              <div>
                <label htmlFor="date_expiration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  id="date_expiration"
                  min={getTomorrowDate()}
                  value={formData.date_expiration}
                  onChange={(e) => handleInputChange('date_expiration', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    validationErrors.date_expiration 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
                  } dark:border-gray-700 dark:bg-gray-800`}
                />
                {validationErrors.date_expiration && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date_expiration[0]}</p>
                )}
              </div>

              {/* Numéro de lot */}
              <div>
                <label htmlFor="numero_lot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Numéro de lot
                </label>
                <input
                  type="text"
                  id="numero_lot"
                  maxLength={100}
                  value={formData.numero_lot}
                  onChange={(e) => handleInputChange('numero_lot', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Fournisseur */}
              <div>
                <label htmlFor="fournisseur_lot" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fournisseur
                </label>
                <input
                  type="text"
                  id="fournisseur_lot"
                  maxLength={255}
                  value={formData.fournisseur_lot}
                  onChange={(e) => handleInputChange('fournisseur_lot', e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            {/* Commentaire */}
            <div>
              <label htmlFor="commentaire" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commentaire
              </label>
              <textarea
                id="commentaire"
                rows={3}
                maxLength={1000}
                value={formData.commentaire}
                onChange={(e) => handleInputChange('commentaire', e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                placeholder="Informations supplémentaires sur ce lot..."
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Link
                to={`/stocks/stocks/${stockId}/lots`}
                className="inline-flex items-center justify-center rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center rounded-md bg-emerald-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <CheckLineIcon className="mr-2 h-4 w-4" />
                {loading ? 'Création...' : 'Créer le lot'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
