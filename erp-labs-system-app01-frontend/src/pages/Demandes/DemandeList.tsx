import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { apiFetch } from '../../lib/apiClient';
import { EyeIcon, PencilIcon, TrashBinIcon, CheckLineIcon } from '../../icons';

type Demande = {
  id: number;
  code: string;
  date_demande: string;
  statut_demande: 'En attente' | 'En cours' | 'Terminée' | 'Annulée';
  patient?: { id: number; nom: string; postnom?: string | null; prenom: string };
  medecin?: { id: number; nom: string; prenom: string };
};

type Paginated<T> = {
  data: T[];
  current_page: number;
  per_page: number;
  total: number;
};

export default function DemandeList() {
  const [items, setItems] = useState<Demande[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{ total: number; page: number; perPage: number }>({ total: 0, page: 1, perPage: 15 });
  const [q, setQ] = useState('');
  const [patientName, setPatientName] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [statut, setStatut] = useState<string>('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [trashed, setTrashed] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const qp = searchParams.get('q') || '';
    const sp = searchParams.get('patient_name') || '';
    const sd = searchParams.get('doctor_name') || '';
    const st = searchParams.get('statut_demande') || '';
    const dd = searchParams.get('date_debut') || '';
    const df = searchParams.get('date_fin') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const trash = searchParams.get('trashed') === '1';
    setQ(qp);
    setPatientName(sp);
    setDoctorName(sd);
    setStatut(st);
    setDateDebut(dd);
    setDateFin(df);
    setMeta((m) => ({ ...m, page }));
    setTrashed(trash);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const qparams = new URLSearchParams({
        per_page: String(meta.perPage),
        page: String(meta.page),
      });
      if (q) qparams.set('q', q);
      if (patientName) qparams.set('patient_name', patientName);
      if (doctorName) qparams.set('doctor_name', doctorName);
      if (statut) qparams.set('statut_demande', statut);
      if (dateDebut) qparams.set('date_debut', dateDebut);
      if (dateFin) qparams.set('date_fin', dateFin);
      const url = (trashed ? '/exam-requests-trashed' : '/exam-requests') + `?${qparams.toString()}`;
      const res = await apiFetch<{ success: boolean; data: Paginated<Demande> }>(`/v1${url}`);
      setItems(res.data.data);
      setMeta({ total: res.data.total, page: res.data.current_page, perPage: res.data.per_page });
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [q, patientName, doctorName, statut, dateDebut, dateFin, meta.page, trashed]);

  // Filtres réactifs: MAJ de l'URL et reset page avec un léger debounce
  useEffect(() => {
    const t = setTimeout(() => {
      const params: Record<string, string> = { page: '1', trashed: trashed ? '1' : '0' };
      if (q) params.q = q;
      if (patientName) params.patient_name = patientName;
      if (doctorName) params.doctor_name = doctorName;
      if (statut) params.statut_demande = statut;
      if (dateDebut) params.date_debut = dateDebut;
      if (dateFin) params.date_fin = dateFin;
      setSearchParams(params);
      setMeta((m) => ({ ...m, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [q, patientName, doctorName, statut, dateDebut, dateFin, trashed, setSearchParams]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params: Record<string, string> = { page: '1', trashed: trashed ? '1' : '0' };
    if (q) params.q = q;
    if (patientName) params.patient_name = patientName;
    if (doctorName) params.doctor_name = doctorName;
    if (statut) params.statut_demande = statut;
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;
    setSearchParams(params);
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const toggleTrash = () => {
    const next = !trashed;
    setTrashed(next);
    const params: Record<string, string> = { page: '1', trashed: next ? '1' : '0' };
    if (q) params.q = q;
    if (patientName) params.patient_name = patientName;
    if (doctorName) params.doctor_name = doctorName;
    if (statut) params.statut_demande = statut;
    if (dateDebut) params.date_debut = dateDebut;
    if (dateFin) params.date_fin = dateFin;
    setSearchParams(params);
    setMeta((m) => ({ ...m, page: 1 }));
  };

  const restore = async (id: number) => {
    await apiFetch(`/v1/exam-requests/${id}/restore`, { method: 'POST' });
    fetchData();
  };

  const forceDelete = async (id: number) => {
    if (!confirm('Supprimer définitivement ?')) return;
    await apiFetch(`/v1/exam-requests/${id}/force`, { method: 'DELETE' });
    fetchData();
  };

  const hasAnyFilter = !!(q || patientName || doctorName || statut || dateDebut || dateFin);

  const clearFilters = () => {
    setQ(''); setPatientName(''); setDoctorName(''); setStatut(''); setDateDebut(''); setDateFin('');
    setSearchParams({ page: '1', trashed: trashed ? '1' : '0' });
    setMeta((m) => ({ ...m, page: 1 }));
  };

  return (
    <>
      <Helmet><title>Demandes d'examens | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Demandes d'examens</h2>
          <div className="flex items-center gap-3">
            <button onClick={toggleTrash} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">{trashed ? 'Voir actifs' : 'Corbeille'}</button>
            {!trashed && (
              <Link to="/demandes/nouvelle" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Nouvelle demande</Link>
            )}
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtres {hasAnyFilter && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400">
                  {[q, patientName, doctorName, statut, dateDebut, dateFin].filter(Boolean).length}
                </span>
              )}
            </h3>
            {hasAnyFilter && (
              <button onClick={clearFilters} className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">Effacer les filtres</button>
            )}
          </div>
          <form onSubmit={onSearch} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white md:col-span-2" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher (code, note)" />
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={patientName} onChange={(e) => setPatientName(e.target.value)} placeholder="Nom du patient" />
            <input className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={doctorName} onChange={(e) => setDoctorName(e.target.value)} placeholder="Nom du médecin" />
            <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={statut} onChange={(e) => setStatut(e.target.value)}>
              <option value="">Tous statuts</option>
              <option value="En attente">En attente</option>
              <option value="En cours">En cours</option>
              <option value="Terminée">Terminée</option>
              <option value="Annulée">Annulée</option>
            </select>
            <div className="flex items-center gap-2 md:col-span-2">
              <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} />
              <input type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={dateFin} onChange={(e) => setDateFin(e.target.value)} />
            </div>
            <div className="flex items-center gap-2 md:col-span-6">
              <button className="inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-2 text-center text-sm font-medium text-white hover:bg-opacity-90" type="submit">Appliquer</button>
              <span className="text-xs text-gray-500 dark:text-gray-400">Filtrage automatique activé</span>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Code</th>
                  <th className="min-w-[240px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Patient</th>
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Médecin</th>
                  <th className="min-w-[180px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Date</th>
                  <th className="min-w-[140px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Statut</th>
                  <th className="min-w-[140px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr><td className="py-8 px-4" colSpan={6}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>
                ) : error ? (
                  <tr><td className="py-8 px-4 text-red-500" colSpan={6}>{error}</td></tr>
                ) : items.length === 0 ? (
                  <tr><td className="py-8 px-4" colSpan={6}>Aucune demande</td></tr>
                ) : (
                  items.map((d) => (
                    <tr key={d.id}>
                      <td className="py-5 px-4 pl-9 xl:pl-11"><div className="flex flex-col"><h5 className="font-medium text-gray-800 dark:text-white/90">{d.code}</h5></div></td>
                      <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{d.patient ? `${d.patient.nom} ${d.patient.postnom || ''} ${d.patient.prenom}`.trim() : '—'}</p></td>
                      <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{d.medecin ? `${d.medecin.nom} ${d.medecin.prenom}` : '—'}</p></td>
                      <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{new Date(d.date_demande).toLocaleString()}</p></td>
                      <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{d.statut_demande}</p></td>
                      <td className="py-5 px-4">
                        <div className="flex items-center space-x-3.5 justify-end">
                          {!trashed ? (<>
                            <Link to={`/demandes/${d.id}`} className="text-brand-600 hover:text-brand-700" title="Détails"><EyeIcon className="h-5 w-5" /></Link>
                            {d.statut_demande === 'En attente' && (
                              <Link to={`/demandes/${d.id}/modifier`} className="text-brand-600 hover:text-brand-700" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
                            )}
                            {(() => { const cannotCancel = ['en cours','terminée','annulée'].includes(d.statut_demande.toLowerCase()); return (
                              <button disabled={cannotCancel} onClick={async () => { if (cannotCancel) return; await apiFetch(`/v1/exam-requests/${d.id}`, { method: 'DELETE' }); fetchData(); }} className="text-red-600 hover:text-red-700 disabled:opacity-50" title="Annuler"><TrashBinIcon className="h-5 w-5" /></button>
                            ); })()}
                          </>) : (<>
                            <button onClick={() => restore(d.id)} className="text-green-600 hover:text-green-700" title="Restaurer"><CheckLineIcon className="h-5 w-5" /></button>
                            <button onClick={() => forceDelete(d.id)} className="text-red-600 hover:text-red-700" title="Supprimer définitivement"><TrashBinIcon className="h-5 w-5" /></button>
                          </>)}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-4">
          <button className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" disabled={meta.page <= 1} onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}>Préc.</button>
          <span className="text-sm text-gray-600 dark:text-gray-400">{meta.page}</span>
          <button className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700" disabled={meta.page >= Math.ceil(meta.total / meta.perPage)} onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}>Suiv.</button>
        </div>
      </div>
    </>
  );
}


