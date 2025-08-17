import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate, useParams } from "react-router";
import { apiFetch } from "../../../lib/apiClient";
import Alert from "../../../components/ui/alert/Alert";
import Input from "../../../components/form/input/InputField";
import { ChevronLeftIcon, CheckLineIcon } from "../../../icons";

function isObject(v: unknown): v is Record<string, unknown> { return typeof v==='object' && v!==null }
function getErrorMessage(err:unknown):string { if (isObject(err) && 'message' in err) return String((err as any).message||''); return 'Une erreur est survenue.'; }

export default function StockAdd(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ quantite: '', date_mouvement: '', motif: '' });
  const [errors, setErrors] = useState<Record<string,string>>({});
  const [apiError, setApiError] = useState<string|null>(null);
  const [submitting, setSubmitting] = useState(false);

  const onChange = (field: string, value: string) => { setForm(prev => ({ ...prev, [field]: value })); if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' })); };
  const validate = () => { const e: Record<string,string> = {}; if (!form.quantite) e.quantite = 'Quantité requise'; setErrors(e); return Object.keys(e).length===0; };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault(); setApiError(null); if (!validate()) return; setSubmitting(true);
    try {
      await apiFetch(`/v1/stock/stocks/${id}/add`, { method:'POST', body: JSON.stringify({ quantite: Number(form.quantite), date_mouvement: form.date_mouvement || undefined, motif: form.motif || undefined }) }, 'company');
      navigate('/stocks/stocks', { state: { success: 'Stock ajouté avec succès.' } });
    } catch (err) { setApiError(getErrorMessage(err)); } finally { setSubmitting(false); }
  };

  return (
    <>
      <Helmet><title>Ajouter du stock | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex items-center gap-3">
          <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Ajouter du stock</h2>
        </div>

        {apiError && (<div className="mb-6"><Alert variant="error" title="Erreur" message={apiError} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={submit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quantité <span className="text-red-500">*</span></label>
                <Input type="number" placeholder="0" value={form.quantite} onChange={(e)=>onChange('quantite', e.target.value)} className={errors.quantite ? 'border-red-500':''} />
                {errors.quantite && <p className="mt-1 text-sm text-red-500">{errors.quantite}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date du mouvement</label>
                <Input type="datetime-local" value={form.date_mouvement} onChange={(e)=>onChange('date_mouvement', e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Motif</label>
                <Input type="text" placeholder="Réassort, livraison..." value={form.motif} onChange={(e)=>onChange('motif', e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <Link to="/stocks/stocks" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed">{submitting ? (<><div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>Ajout...</>) : (<><CheckLineIcon className="mr-2 h-4 w-4" />Ajouter</>)}</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
