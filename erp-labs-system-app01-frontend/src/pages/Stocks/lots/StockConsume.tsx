import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import { CheckLineIcon, CloseIcon } from "../../../icons";

interface Stock {
  id: number;
  code: string;
  article?: { id: number; nom_article: string };
}

interface AvailableLot {
  id: number;
  code: string;
  numero_lot?: string;
  quantite_restante: number;
  date_entree: string;
  date_expiration?: string;
  prix_unitaire_achat?: number;
  is_expired?: boolean;
  is_near_expiration?: boolean;
}

interface ManualLot {
  lot_id: number;
  quantite: number;
}

interface FormData {
  quantite: string;
  date_mouvement: string;
  motif: string;
  methode_sortie: 'fifo' | 'fefo' | 'manual';
  lots_manuels: ManualLot[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null;
}

function getErrorMessage(err: unknown): string {
  if (isObject(err) && 'message' in err) return String((err as any).message || '');
  return 'Une erreur est survenue.';
}

function getCurrentDateTime(): string {
  return new Date().toISOString().slice(0, 16);
}

export default function StockConsume() {
  const { stockId } = useParams<{ stockId: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<Stock | null>(null);
  const [availableLots, setAvailableLots] = useState<AvailableLot[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  const [formData, setFormData] = useState<FormData>({
    quantite: '',
    date_mouvement: getCurrentDateTime(),
    motif: '',
    methode_sortie: 'fifo',
    lots_manuels: [],
  });

  const loadStock = async () => {
    if (!stockId) return;
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

  const loadAvailableLots = async () => {
    if (!stockId) return;
    try {
      const resp = await apiFetch<any>(`/v1/stock/stocks/${stockId}/available-lots`, { method: 'GET' }, 'company');
      const data = resp?.data || resp;
      if (data.lots) {
        const mapped: AvailableLot[] = (data.lots as any[]).map((r: any) => ({
          id: Number(r.id),
          code: String(r.code),
          numero_lot: r.numero_lot ? String(r.numero_lot) : undefined,
          quantite_restante: Number(r.quantite_restante),
          date_entree: String(r.date_entree),
          date_expiration: r.date_expiration ? String(r.date_expiration) : undefined,
          prix_unitaire_achat: r.prix_unitaire_achat ? Number(r.prix_unitaire_achat) : undefined,
          is_expired: Boolean(r.is_expired),
          is_near_expiration: Boolean(r.is_near_expiration),
        }));
        setAvailableLots(mapped);
      }
    } catch (e) {
      setApiError(getErrorMessage(e));
    }
  };

  useEffect(() => {
    loadStock();
    loadAvailableLots();
  }, [stockId]);

  const handleInputChange = (field: keyof FormData, value: any) => {
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

  const addManualLot = (lotId: number) => {
    const existingIndex = formData.lots_manuels.findIndex(l => l.lot_id === lotId);
    if (existingIndex === -1) {
      setFormData(prev => ({
        ...prev,
        lots_manuels: [...prev.lots_manuels, { lot_id: lotId, quantite: 1 }]
      }));
    }
  };

  const updateManualLotQuantity = (lotId: number, quantite: number) => {
    setFormData(prev => ({
      ...prev,
      lots_manuels: prev.lots_manuels.map(l => 
        l.lot_id === lotId ? { ...l, quantite } : l
      )
    }));
  };

  const removeManualLot = (lotId: number) => {
    setFormData(prev => ({
      ...prev,
      lots_manuels: prev.lots_manuels.filter(l => l.lot_id !== lotId)
    }));
  };

  const getTotalQuantitySelected = (): number => {
    return formData.lots_manuels.reduce((total, lot) => total + lot.quantite, 0);
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};

    if (!formData.quantite || Number(formData.quantite) <= 0) {
      errors.quantite = ['La quantité à consommer est obligatoire et doit être supérieure à 0'];
    }

    if (!formData.date_mouvement) {
      errors.date_mouvement = ['La date de mouvement est obligatoire'];
    }

    if (formData.methode_sortie === 'manual') {
      if (formData.lots_manuels.length === 0) {
        errors.lots_manuels = ['Vous devez sélectionner au moins un lot pour la sortie manuelle'];
      } else {
        const totalSelected = getTotalQuantitySelected();
        const requestedQuantity = Number(formData.quantite);
        if (totalSelected !== requestedQuantity) {
          errors.lots_manuels = [`La quantité totale sélectionnée (${totalSelected}) doit correspondre à la quantité demandée (${requestedQuantity})`];
        }
      }
    }

    const totalAvailable = availableLots.reduce((total, lot) => total + lot.quantite_restante, 0);
    if (Number(formData.quantite) > totalAvailable) {
      errors.quantite = [`Quantité demandée (${formData.quantite}) supérieure au stock disponible (${totalAvailable})`];
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
      const payload: any = {
        quantite: Number(formData.quantite),
        date_mouvement: formData.date_mouvement,
        motif: formData.motif || 'Consommation de stock',
        methode_sortie: formData.methode_sortie,
      };

      if (formData.methode_sortie === 'manual') {
        payload.lots_manuels = formData.lots_manuels;
      }

      const resp = await apiFetch(
        `/v1/stock/stocks/${stockId}/consume`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        'company'
      );

      navigate(`/stocks/stocks/${stockId}/lots`, {
        state: { 
          success: `Stock consommé avec succès (${formData.methode_sortie.toUpperCase()}) - ${resp?.data?.total_consumed || formData.quantite} unités` 
        }
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

  if (!stockId) {
    return <div>ID de stock manquant</div>;
  }

  const totalAvailable = availableLots.reduce((total, lot) => total + lot.quantite_restante, 0);

  return (
    <>
      <Helmet><title>Consommer Stock - {stock?.article?.nom_article || 'Chargement...'} | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Consommer Stock FIFO
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Article: {stock?.article?.nom_article || 'Chargement...'} - Disponible: {totalAvailable} unités
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulaire de consommation */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold mb-4">Paramètres de consommation</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Quantité à consommer */}
              <div>
                <label htmlFor="quantite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantité à consommer *
                </label>
                <input
                  type="number"
                  id="quantite"
                  min="1"
                  max={totalAvailable}
                  value={formData.quantite}
                  onChange={(e) => handleInputChange('quantite', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    validationErrors.quantite 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
                  } dark:border-gray-700 dark:bg-gray-800`}
                />
                {validationErrors.quantite && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.quantite[0]}</p>
                )}
              </div>

              {/* Date de mouvement */}
              <div>
                <label htmlFor="date_mouvement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date de mouvement *
                </label>
                <input
                  type="datetime-local"
                  id="date_mouvement"
                  value={formData.date_mouvement}
                  onChange={(e) => handleInputChange('date_mouvement', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 text-sm ${
                    validationErrors.date_mouvement 
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
                      : 'border-gray-300 focus:border-brand-500 focus:ring-brand-500'
                  } dark:border-gray-700 dark:bg-gray-800`}
                />
                {validationErrors.date_mouvement && (
                  <p className="mt-1 text-sm text-red-600">{validationErrors.date_mouvement[0]}</p>
                )}
              </div>

              {/* Méthode de sortie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Méthode de sortie *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="methode_sortie"
                      value="fifo"
                      checked={formData.methode_sortie === 'fifo'}
                      onChange={(e) => handleInputChange('methode_sortie', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">FIFO (First In, First Out) - Les plus anciens d'abord</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="methode_sortie"
                      value="fefo"
                      checked={formData.methode_sortie === 'fefo'}
                      onChange={(e) => handleInputChange('methode_sortie', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">FEFO (First Expired, First Out) - Les plus proches expiration d'abord</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="methode_sortie"
                      value="manual"
                      checked={formData.methode_sortie === 'manual'}
                      onChange={(e) => handleInputChange('methode_sortie', e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Manuel - Sélection manuelle des lots</span>
                  </label>
                </div>
              </div>

              {/* Motif */}
              <div>
                <label htmlFor="motif" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Motif
                </label>
                <input
                  type="text"
                  id="motif"
                  value={formData.motif}
                  onChange={(e) => handleInputChange('motif', e.target.value)}
                  placeholder="Raison de la consommation..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                />
              </div>

              {/* Validation errors pour sélection manuelle */}
              {validationErrors.lots_manuels && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{validationErrors.lots_manuels[0]}</p>
                </div>
              )}

              {/* Bouton de soumission */}
              <button
                type="submit"
                disabled={loading || totalAvailable === 0}
                className="w-full inline-flex items-center justify-center rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50"
              >
                <CloseIcon className="mr-2 h-4 w-4" />
                {loading ? 'Consommation...' : 'Consommer le stock'}
              </button>
            </form>
          </div>

          {/* Liste des lots disponibles */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Lots disponibles {formData.methode_sortie === 'manual' && '(cliquez pour sélectionner)'}
            </h3>
            
            {formData.methode_sortie === 'manual' && formData.lots_manuels.length > 0 && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Quantité sélectionnée: {getTotalQuantitySelected()} / {formData.quantite || 0}
                </p>
              </div>
            )}

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableLots.map(lot => {
                const isSelected = formData.lots_manuels.some(l => l.lot_id === lot.id);
                const selectedLot = formData.lots_manuels.find(l => l.lot_id === lot.id);

                return (
                  <div 
                    key={lot.id} 
                    className={`p-3 border rounded-md ${
                      lot.is_expired ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' : 
                      lot.is_near_expiration ? 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800' : 
                      'bg-gray-50 border-gray-200 dark:bg-gray-800/50 dark:border-gray-700'
                    } ${
                      formData.methode_sortie === 'manual' ? 'cursor-pointer hover:bg-opacity-80' : ''
                    } ${
                      isSelected ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
                    }`}
                    onClick={() => {
                      if (formData.methode_sortie === 'manual') {
                        if (!isSelected) {
                          addManualLot(lot.id);
                        }
                      }
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{lot.code}</span>
                          {lot.numero_lot && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">N°: {lot.numero_lot}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">
                          Quantité: {lot.quantite_restante} | 
                          Entrée: {new Date(lot.date_entree).toLocaleDateString()}
                          {lot.date_expiration && (
                            <> | Exp: {new Date(lot.date_expiration).toLocaleDateString()}</>
                          )}
                        </div>
                        {lot.prix_unitaire_achat && (
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Prix: {lot.prix_unitaire_achat.toFixed(2)} €
                          </div>
                        )}
                      </div>
                      
                      {formData.methode_sortie === 'manual' && isSelected && (
                        <div className="flex items-center gap-2 ml-2">
                          <input
                            type="number"
                            min="1"
                            max={lot.quantite_restante}
                            value={selectedLot?.quantite || 1}
                            onChange={(e) => updateManualLotQuantity(lot.id, Number(e.target.value))}
                            className="w-16 text-xs rounded border border-gray-300 px-2 py-1 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeManualLot(lot.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {availableLots.length === 0 && (
                <p className="text-center text-sm text-gray-500 py-4">
                  Aucun lot disponible
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
