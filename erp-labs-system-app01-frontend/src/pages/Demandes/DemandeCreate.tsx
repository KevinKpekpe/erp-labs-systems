import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import { ChevronLeftIcon, PlusIcon } from '../../icons';
import { apiFetch } from '../../lib/apiClient';

type Option = { id: number; label: string };

export default function DemandeCreate() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Option[]>([]);
  const [medecins, setMedecins] = useState<Option[]>([]);
  const [examens, setExamens] = useState<Option[]>([]);
  const [form, setForm] = useState<{ patient_id: string; medecin_prescripteur_id: string; medecin_prescripteur_externe_nom: string; medecin_prescripteur_externe_prenom: string; examens: string[]; note: string; date_demande?: string }>({ patient_id: '', medecin_prescripteur_id: '', medecin_prescripteur_externe_nom: '', medecin_prescripteur_externe_prenom: '', examens: [], note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, m, e] = await Promise.all([
          apiFetch<{ data: { data: Array<{ id: number; nom: string; postnom?: string | null; prenom: string }> } }>(`/v1/patients`),
          apiFetch<{ data: { data: Array<{ id: number; nom: string; prenom: string }> } }>(`/v1/doctors`),
          apiFetch<{ data: { data: Array<{ id: number; nom_examen: string }> } }>(`/v1/exams`),
        ]);
        setPatients((p.data.data || []).map((x) => ({ id: x.id, label: `${x.nom} ${x.postnom || ''} ${x.prenom}`.trim() })));
        setMedecins((m.data.data || []).map((x) => ({ id: x.id, label: `${x.nom} ${x.prenom}` })));
        setExamens((e.data.data || []).map((x) => ({ id: x.id, label: x.nom_examen })));
      } catch { /* noop */ }
    })();
  }, []);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        patient_id: Number(form.patient_id),
        medecin_prescripteur_id: form.medecin_prescripteur_id ? Number(form.medecin_prescripteur_id) : undefined,
        medecin_prescripteur_externe_nom: form.medecin_prescripteur_externe_nom || undefined,
        medecin_prescripteur_externe_prenom: form.medecin_prescripteur_externe_prenom || undefined,
        examens: form.examens.map(Number),
        note: form.note || undefined,
        date_demande: form.date_demande || undefined,
      };
      const res = await apiFetch<{ data: { id: number } }>(`/v1/exam-requests`, { method: 'POST', body: JSON.stringify(payload) });
      navigate(`/demandes/${res.data?.id ?? ''}`);
    } catch (e) {
      const err = e as { message?: string };
      setError(err?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Nouvelle demande | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/demandes" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Nouvelle demande</h2>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8 max-w-4xl">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Informations patient</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="patient">Patient <span className="text-red-500">*</span></Label>
                  <select id="patient" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })} required>
                    <option value="">Sélectionner</option>
                    {patients.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="date_demande">Date de demande</Label>
                  <Input id="date_demande" type="date" value={form.date_demande || ''} onChange={(e) => setForm({ ...form, date_demande: e.target.value })} />
                </div>
              </div>
            </div>

            <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Prescription</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="medecin_interne">Médecin interne</Label>
                  <select id="medecin_interne" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.medecin_prescripteur_id} onChange={(e) => {
                    const val = e.target.value;
                    setForm({ ...form, medecin_prescripteur_id: val, medecin_prescripteur_externe_nom: val ? '' : form.medecin_prescripteur_externe_nom, medecin_prescripteur_externe_prenom: val ? '' : form.medecin_prescripteur_externe_prenom });
                  }}>
                    <option value="">—</option>
                    {medecins.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
                  </select>
                </div>
                <div>
                  <Label htmlFor="medecin_ext_nom">Médecin externe - Nom</Label>
                  <Input id="medecin_ext_nom" type="text" value={form.medecin_prescripteur_externe_nom} onChange={(e) => setForm({ ...form, medecin_prescripteur_externe_nom: e.target.value, medecin_prescripteur_id: e.target.value ? '' : form.medecin_prescripteur_id })} disabled={!!form.medecin_prescripteur_id} />
                </div>
                <div>
                  <Label htmlFor="medecin_ext_prenom">Médecin externe - Prénom</Label>
                  <Input id="medecin_ext_prenom" type="text" value={form.medecin_prescripteur_externe_prenom} onChange={(e) => setForm({ ...form, medecin_prescripteur_externe_prenom: e.target.value, medecin_prescripteur_id: e.target.value ? '' : form.medecin_prescripteur_id })} disabled={!!form.medecin_prescripteur_id} />
                </div>
              </div>
            </div>

            <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Examens</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {examens.map((ex) => {
                  const checked = form.examens.includes(String(ex.id));
                  return (
                    <label key={ex.id} className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
                      <input type="checkbox" checked={checked} onChange={(e) => {
                        setForm((f) => ({ ...f, examens: e.target.checked ? [...f.examens, String(ex.id)] : f.examens.filter((x) => x !== String(ex.id)) }));
                      }} />
                      <span>{ex.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Note</h3>
              <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>

            <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link to="/demandes" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50" disabled={loading} type="submit"><PlusIcon className="mr-2 h-4 w-4" />Créer la demande</button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}


