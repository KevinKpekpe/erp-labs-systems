import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon, PlusIcon, TrashBinIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import { Link, useNavigate } from "react-router";
import { apiFetch } from "../../lib/apiClient";
import Alert from "../../components/ui/alert/Alert";

interface Article { id: number; nom_article: string }
function isObject(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function extractArticles(resp: unknown): Article[] { const root = (resp as { data?: unknown })?.data ?? resp; const arr = isObject(root) && Array.isArray((root as any).data) ? (root as any).data as unknown[] : Array.isArray(root) ? root as unknown[] : []; return arr.filter(isObject).map(r => ({ id: Number((r as any).id ?? 0), nom_article: String((r as any).nom_article ?? '') })); }
function getErrorMessage(err: unknown): string { if (isObject(err) && 'message' in err) return String((err as any).message || ''); return 'Une erreur est survenue.'; }

export default function ExamCreate() {
  const navigate = useNavigate();
  const [articles, setArticles] = useState<Article[]>([]);
  const [form, setForm] = useState({ nom_examen: "", description: "", prix: "", delai_rendu_estime: "", unites_mesure: "", valeurs_reference: "", type_echantillon: "", conditions_pre_analytiques: "", equipement_reactifs_necessaires: "" });
  const [lignes, setLignes] = useState<Array<{ article_id: string; quantite_utilisee: string }>>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { (async () => { try { const res = await apiFetch<unknown>("/v1/stock/articles?per_page=100", { method: 'GET' }, 'company'); setArticles(extractArticles(res)); } catch { /* noop */ } })(); }, []);

  const onChange = (field: string, value: string) => { setForm(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" })); };
  const addLigne = () => setLignes(prev => [...prev, { article_id: "", quantite_utilisee: "" }]);
  const removeLigne = (idx: number) => setLignes(prev => prev.filter((_, i) => i !== idx));
  const setLigne = (idx: number, field: 'article_id' | 'quantite_utilisee', value: string) => setLignes(prev => prev.map((l, i) => i === idx ? { ...l, [field]: value } : l));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.nom_examen.trim()) e.nom_examen = "Le nom est requis";
    if (!form.prix) e.prix = "Le prix est requis";
    if (!form.delai_rendu_estime) e.delai_rendu_estime = "Le délai est requis";
    if (!form.unites_mesure) e.unites_mesure = "L'unité est requise";
    if (!form.type_echantillon) e.type_echantillon = "Le type d'échantillon est requis";
    lignes.forEach((l, i) => {
      if ((l.article_id && !l.quantite_utilisee) || (!l.article_id && l.quantite_utilisee)) {
        e[`ligne_${i}`] = "Sélectionnez l'article et la quantité";
      }
    });
    setErrors(e); return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setApiError(null); if (!validate()) return; setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        nom_examen: form.nom_examen,
        description: form.description || undefined,
        prix: Number(form.prix),
        delai_rendu_estime: Number(form.delai_rendu_estime),
        unites_mesure: form.unites_mesure,
        valeurs_reference: form.valeurs_reference || undefined,
        type_echantillon: form.type_echantillon,
        conditions_pre_analytiques: form.conditions_pre_analytiques || undefined,
        equipement_reactifs_necessaires: form.equipement_reactifs_necessaires || undefined,
      };
      const lignesNettoyees = lignes.filter(l => l.article_id && l.quantite_utilisee).map(l => ({ article_id: Number(l.article_id), quantite_utilisee: Number(l.quantite_utilisee) }));
      if (lignesNettoyees.length > 0) (payload as any).articles = lignesNettoyees;
      await apiFetch("/v1/exams", { method: 'POST', body: JSON.stringify(payload) }, 'company');
      navigate('/examens', { state: { success: 'Examen créé avec succès.' } });
    } catch (err: unknown) { setApiError(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Nouvel examen | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/examens" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouvel examen</h2>
          </div>
        </div>

        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Nom de l'examen <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: Glycémie" value={form.nom_examen} onChange={(e) => onChange('nom_examen', e.target.value)} className={errors.nom_examen ? 'border-red-500' : ''} />
                {errors.nom_examen && <p className="mt-1 text-sm text-red-500">{errors.nom_examen}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Prix (CDF) <span className="text-red-500">*</span></label>
                <Input type="number" step="0.01" placeholder="0" value={form.prix} onChange={(e) => onChange('prix', e.target.value)} className={errors.prix ? 'border-red-500' : ''} />
                {errors.prix && <p className="mt-1 text-sm text-red-500">{errors.prix}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Délai rendu estimé (heures) <span className="text-red-500">*</span></label>
                <Input type="number" step="1" placeholder="0" value={form.delai_rendu_estime} onChange={(e) => onChange('delai_rendu_estime', e.target.value)} className={errors.delai_rendu_estime ? 'border-red-500' : ''} />
                {errors.delai_rendu_estime && <p className="mt-1 text-sm text-red-500">{errors.delai_rendu_estime}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Unité(s) de mesure <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: mg/dL" value={form.unites_mesure} onChange={(e) => onChange('unites_mesure', e.target.value)} className={errors.unites_mesure ? 'border-red-500' : ''} />
                {errors.unites_mesure && <p className="mt-1 text-sm text-red-500">{errors.unites_mesure}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Type d'échantillon <span className="text-red-500">*</span></label>
                <Input type="text" placeholder="Ex: Sang" value={form.type_echantillon} onChange={(e) => onChange('type_echantillon', e.target.value)} className={errors.type_echantillon ? 'border-red-500' : ''} />
                {errors.type_echantillon && <p className="mt-1 text-sm text-red-500">{errors.type_echantillon}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Valeurs de référence</label>
                <Input type="text" placeholder="Ex: 70-100" value={form.valeurs_reference} onChange={(e) => onChange('valeurs_reference', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <Input type="text" placeholder="Description courte" value={form.description} onChange={(e) => onChange('description', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Conditions pré-analytiques</label>
                <Input type="text" placeholder="Ex: 8h de jeûne" value={form.conditions_pre_analytiques} onChange={(e) => onChange('conditions_pre_analytiques', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Équipements / Réactifs nécessaires</label>
                <Input type="text" placeholder="Liste libre" value={form.equipement_reactifs_necessaires} onChange={(e) => onChange('equipement_reactifs_necessaires', e.target.value)} />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-gray-800 dark:text-white/90">Réactifs (articles) utilisés</h3>
                <button type="button" onClick={addLigne} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90"><PlusIcon className="mr-2 h-4 w-4" />Ajouter</button>
              </div>
              <div className="space-y-3">
                {lignes.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">Aucun réactif ajouté. (Optionnel)</p>
                )}
                {lignes.map((l, i) => (
                  <div key={i} className="grid grid-cols-1 gap-3 md:grid-cols-3 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Article</label>
                      <Select options={articles.map(c => ({ value: String(c.id), label: c.nom_article }))} placeholder="Sélectionner" defaultValue={l.article_id} onChange={(v) => setLigne(i, 'article_id', v)} />
                      {errors[`ligne_${i}`] && <p className="mt-1 text-sm text-red-500">{errors[`ligne_${i}`]}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantité utilisée</label>
                      <Input type="number" step="0.0001" placeholder="0" value={l.quantite_utilisee} onChange={(e) => setLigne(i, 'quantite_utilisee', e.target.value)} />
                    </div>
                    <div>
                      <button type="button" onClick={() => removeLigne(i)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><TrashBinIcon className="h-4 w-4 mr-2" />Retirer</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Link to="/examens" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Création...</>) : (<><CheckLineIcon className="mr-2 h-4 w-4" />Créer</>)}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
