import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { apiFetch } from '../../lib/apiClient';

type Option = { id: number; label: string };

export default function DemandeEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<Option[]>([]);
  const [medecins, setMedecins] = useState<Option[]>([]);
  const [examens, setExamens] = useState<Option[]>([]);
  const [form, setForm] = useState({ patient_id: '', medecin_prescripteur_id: '', medecin_prescripteur_externe_nom: '', medecin_prescripteur_externe_prenom: '', examens: [] as string[], note: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [p, m, e] = await Promise.all([
          apiFetch<{ data: any }>(`/v1/patients`),
          apiFetch<{ data: any }>(`/v1/doctors`),
          apiFetch<{ data: any }>(`/v1/exams`),
        ]);
        setPatients((p.data.data || []).map((x: any) => ({ id: x.id, label: `${x.nom} ${x.postnom || ''} ${x.prenom}`.trim() })));
        setMedecins((m.data.data || []).map((x: any) => ({ id: x.id, label: `${x.nom} ${x.prenom}` })));
        setExamens((e.data.data || []).map((x: any) => ({ id: x.id, label: x.nom_examen })));
      } catch (e: any) { /* noop */ }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;
      const res = await apiFetch<{ data: any }>(`/v1/exam-requests/${id}`);
      const d = res.data;
      setForm({
        patient_id: String(d.patient_id || ''),
        medecin_prescripteur_id: String(d.medecin_prescripteur_id || ''),
        medecin_prescripteur_externe_nom: d.medecin_prescripteur_externe_nom || '',
        medecin_prescripteur_externe_prenom: d.medecin_prescripteur_externe_prenom || '',
        examens: (d.details || []).map((x: any) => String(x.examen_id)),
        note: d.note || '',
      });
    })();
  }, [id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const payload = {
        patient_id: form.patient_id ? Number(form.patient_id) : undefined,
        medecin_prescripteur_id: form.medecin_prescripteur_id ? Number(form.medecin_prescripteur_id) : undefined,
        medecin_prescripteur_externe_nom: form.medecin_prescripteur_externe_nom || undefined,
        medecin_prescripteur_externe_prenom: form.medecin_prescripteur_externe_prenom || undefined,
        examens: form.examens.map(Number),
        note: form.note || undefined,
      };
      await apiFetch(`/v1/exam-requests/${id}/full-update`, { method: 'POST', body: JSON.stringify(payload) });
      navigate(`/demandes/${id}`);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet><title>Modifier la demande | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Modifier la demande</h2>
        </div>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/30 dark:bg-red-900/10 dark:text-red-300">{error}</div>
        )}
        <form onSubmit={submit} className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Patient</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
                <option value="">—</option>
                {patients.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Médecin interne</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.medecin_prescripteur_id} onChange={(e) => setForm({ ...form, medecin_prescripteur_id: e.target.value })}>
                <option value="">—</option>
                {medecins.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Médecin externe - Nom</label>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.medecin_prescripteur_externe_nom} onChange={(e) => setForm({ ...form, medecin_prescripteur_externe_nom: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Médecin externe - Prénom</label>
              <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.medecin_prescripteur_externe_prenom} onChange={(e) => setForm({ ...form, medecin_prescripteur_externe_prenom: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Examens</label>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Note</label>
              <textarea className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </div>
          </div>
          <div className="flex items-center gap-2 mt-6">
            <button className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50" disabled={loading} type="submit">Enregistrer</button>
          </div>
        </form>
      </div>
    </>
  );
}


