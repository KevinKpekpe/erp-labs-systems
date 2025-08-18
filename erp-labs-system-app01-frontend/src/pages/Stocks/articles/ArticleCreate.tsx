import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon } from "../../../icons";
import Input from "../../../components/form/input/InputField";
import Select from "../../../components/form/Select";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";

interface Category { 
  id: number; 
  nom_categorie: string;
  type_laboratoire?: string;
  conditions_stockage_requises?: string;
  temperature_stockage_min?: number;
  temperature_stockage_max?: number;
  sensible_lumiere?: boolean;
  chaine_froid_critique?: boolean;
  delai_alerte_expiration?: number;
}

function isObject(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

function extractCategories(resp: unknown): Category[] { 
  const root = (resp as { data?: unknown })?.data ?? resp; 
  const arr = isObject(root) && Array.isArray((root as any).data) ? (root as any).data as unknown[] : Array.isArray(root) ? root as unknown[] : []; 
  return arr.filter(isObject).map(r => ({ 
    id: Number((r as any).id ?? 0), 
    nom_categorie: String((r as any).nom_categorie ?? ''),
    type_laboratoire: (r as any).type_laboratoire ? String((r as any).type_laboratoire) : undefined,
    conditions_stockage_requises: (r as any).conditions_stockage_requises ? String((r as any).conditions_stockage_requises) : undefined,
    temperature_stockage_min: (r as any).temperature_stockage_min ? Number((r as any).temperature_stockage_min) : undefined,
    temperature_stockage_max: (r as any).temperature_stockage_max ? Number((r as any).temperature_stockage_max) : undefined,
    sensible_lumiere: Boolean((r as any).sensible_lumiere),
    chaine_froid_critique: Boolean((r as any).chaine_froid_critique),
    delai_alerte_expiration: Number((r as any).delai_alerte_expiration || 30),
  })); 
}
function getErrorMessage(err: unknown): string { if (isObject(err) && 'message' in err) return String((err as any).message || ''); return 'Une erreur est survenue.'; }

export default function ArticleCreate() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [form, setForm] = useState({ nom_article: "", categorie_id: "", prix_unitaire: "", unite_mesure: "", fournisseur: "", description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { (async () => { 
    try { 
      console.log('🔍 Chargement des catégories...');
      const res = await apiFetch<unknown>("/v1/stock/categories?per_page=100", { method: 'GET' }, 'company'); 
      console.log('📦 Réponse API catégories:', res);
      const extracted = extractCategories(res);
      console.log('✅ Catégories extraites:', extracted.length, extracted);
      setCategories(extracted); 
    } catch (err) { 
      console.error('❌ Erreur chargement catégories:', err);
    } 
  })(); }, []);

  const onChange = (field: string, value: string) => { 
    setForm(prev => ({ ...prev, [field]: value })); 
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
    
    // Si c'est la catégorie qui change, mettre à jour la catégorie sélectionnée
    if (field === 'categorie_id') {
      const category = categories.find(c => c.id === Number(value));
      setSelectedCategory(category || null);
    }
  };
  const validate = () => { const e: Record<string,string> = {}; if (!form.nom_article.trim()) e.nom_article = "Le nom est requis"; if (!form.categorie_id) e.categorie_id = "La catégorie est requise"; if (!form.prix_unitaire) e.prix_unitaire = "Le prix est requis"; if (!form.unite_mesure) e.unite_mesure = "L'unité est requise"; setErrors(e); return Object.keys(e).length === 0; };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setApiError(null); if (!validate()) return; setSubmitting(true);
    try {
      await apiFetch("/v1/stock/articles", { method: 'POST', body: JSON.stringify({ nom_article: form.nom_article, categorie_id: Number(form.categorie_id), prix_unitaire: Number(form.prix_unitaire), unite_mesure: form.unite_mesure, fournisseur: form.fournisseur || undefined, description: form.description || undefined }) }, 'company');
      navigate('/stocks/articles', { state: { success: 'Article créé avec succès.' } });
    } catch (err: unknown) { setApiError(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Nouvel article | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/stocks/articles" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouvel article</h2>
          </div>
        </div>

        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'article <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: Réactif A" value={form.nom_article} onChange={(e) => onChange('nom_article', e.target.value)} className={errors.nom_article ? 'border-red-500' : ''} />
                {errors.nom_article && <p className="mt-1 text-sm text-red-500">{errors.nom_article}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Catégorie <span className="text-red-500">*</span></label>
                <Select 
                  options={categories.map(c => ({ 
                    value: String(c.id), 
                    label: `${c.nom_categorie}${c.type_laboratoire ? ` (${c.type_laboratoire})` : ''}` 
                  }))} 
                  placeholder="Sélectionner" 
                  defaultValue={form.categorie_id} 
                  onChange={(v) => onChange('categorie_id', v)} 
                  className={errors.categorie_id ? 'border-red-500' : ''} 
                />
                {errors.categorie_id && <p className="mt-1 text-sm text-red-500">{errors.categorie_id}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix unitaire (CDF) <span className="text-red-500">*</span></label>
                <Input type="number" step="0.01" placeholder="0" value={form.prix_unitaire} onChange={(e) => onChange('prix_unitaire', e.target.value)} className={errors.prix_unitaire ? 'border-red-500' : ''} />
                {errors.prix_unitaire && <p className="mt-1 text-sm text-red-500">{errors.prix_unitaire}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unité de mesure <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: ml, mg, pièce" value={form.unite_mesure} onChange={(e) => onChange('unite_mesure', e.target.value)} className={errors.unite_mesure ? 'border-red-500' : ''} />
                {errors.unite_mesure && <p className="mt-1 text-sm text-red-500">{errors.unite_mesure}</p>}
              </div>
            </div>
            
            {/* Affichage des informations de laboratoire pour la catégorie sélectionnée */}
            {selectedCategory?.type_laboratoire && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md dark:bg-blue-900/20 dark:border-blue-800">
                <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-3">
                  📋 Informations de laboratoire
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-blue-700 dark:text-blue-300">
                      <strong>Type:</strong> {selectedCategory.type_laboratoire}
                    </p>
                    {selectedCategory.conditions_stockage_requises && (
                      <p className="text-blue-700 dark:text-blue-300 mt-1">
                        <strong>Conditions:</strong> {selectedCategory.conditions_stockage_requises}
                      </p>
                    )}
                  </div>
                  <div>
                    {(selectedCategory.temperature_stockage_min || selectedCategory.temperature_stockage_max) && (
                      <p className="text-blue-700 dark:text-blue-300">
                        <strong>Température:</strong> {
                          selectedCategory.temperature_stockage_min && selectedCategory.temperature_stockage_max
                            ? `${selectedCategory.temperature_stockage_min}°C à ${selectedCategory.temperature_stockage_max}°C`
                            : selectedCategory.temperature_stockage_min
                            ? `> ${selectedCategory.temperature_stockage_min}°C`
                            : `< ${selectedCategory.temperature_stockage_max}°C`
                        }
                      </p>
                    )}
                    <div className="flex gap-3 mt-2">
                      {selectedCategory.sensible_lumiere && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                          💡 Sensible lumière
                        </span>
                      )}
                      {selectedCategory.chaine_froid_critique && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          ❄️ Chaîne froid critique
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700">
                  <p className="text-blue-600 dark:text-blue-400 text-sm">
                    ⏰ <strong>Alerte d'expiration:</strong> {selectedCategory.delai_alerte_expiration} jours avant expiration
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Fournisseur</label>
                <Input type="text" placeholder="Ex: BioSupplies" value={form.fournisseur} onChange={(e) => onChange('fournisseur', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <Input type="text" placeholder="Description courte" value={form.description} onChange={(e) => onChange('description', e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6">
              <Link to="/stocks/articles" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Création...</>) : (<><CheckLineIcon className="mr-2 h-4 w-4" />Créer</>)}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}


