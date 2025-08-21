import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { apiFetch } from '../../lib/apiClient';
import Modal from '../../components/ui/Modal';

type Detail = { id: number; examen_id: number; resultat?: string | null; date_resultat?: string | null; examen?: { id: number; nom_examen: string } };
type Demande = { id: number; code: string; statut_demande: string; note?: string | null; date_demande?: string | null; patient?: { id: number; nom: string; postnom?: string | null; prenom: string } | null; medecin?: { id: number; nom: string; prenom: string } | null; details: Detail[] };

export default function DemandeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Demande | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Pas de choix FIFO/FEFO ici (non pertinent sur cette page)
  const [resultModal, setResultModal] = useState<{ isOpen: boolean; detail: Detail | null; value: string }>({ isOpen: false, detail: null, value: '' });

  const fetchOne = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ data: Demande }>(`/v1/exam-requests/${id}`);
      setData(res.data);
    } catch (e) { const err = e as { message?: string }; setError(err?.message || 'Erreur'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchOne(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const start = async () => {
    if (!id) return;
    await apiFetch(`/v1/exam-requests/${id}`, { method: 'PUT', body: JSON.stringify({ statut_demande: 'En cours' }) });
    fetchOne();
  };
  const finish = async () => {
    if (!id) return;
    await apiFetch(`/v1/exam-requests/${id}`, { method: 'PUT', body: JSON.stringify({ statut_demande: 'Terminée' }) });
    fetchOne();
  };
  const cancel = async () => {
    if (!id) return;
    await apiFetch(`/v1/exam-requests/${id}`, { method: 'DELETE' });
    navigate('/demandes');
  };

  const updateDetail = async (detailId: number, resultat: string) => {
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const formatted = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    await apiFetch(`/v1/exam-requests/${id}/details/${detailId}`, { method: 'POST', body: JSON.stringify({ resultat, date_resultat: formatted }) });
    fetchOne();
  };

  const openResultModal = (detail: Detail) => {
    setResultModal({ isOpen: true, detail, value: detail.resultat || '' });
  };
  const closeResultModal = () => setResultModal({ isOpen: false, detail: null, value: '' });
  const submitResultModal = async () => {
    if (!resultModal.detail) return;
    await updateDetail(resultModal.detail.id, resultModal.value);
    closeResultModal();
  };

  return (
    <>
      <Helmet><title>Détails demande | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/demandes" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Retour</Link>
          <div className="flex items-center gap-3">
            {data && data.statut_demande === 'En attente' && (
              <Link to={`/demandes/${id}/modifier`} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">
                Modifier
              </Link>
            )}
            <button onClick={start} disabled={!data || data.statut_demande !== 'En attente'} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50">Démarrer</button>
            <button onClick={finish} disabled={!data || data.statut_demande !== 'En cours' || (data && data.details.some(d => !d.resultat || d.resultat.trim() === ''))} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50">Terminer</button>
            <button onClick={cancel} disabled={!data || data.statut_demande === 'Terminée'} className="inline-flex items-center justify-center rounded-md px-6 py-2.5 text-center text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">Annuler</button>
          </div>
        </div>
        {loading ? 'Chargement...' : error ? <div className="text-red-500">{error}</div> : !data ? null : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne infos patient / médecin */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Informations</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Patient</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.patient ? `${data.patient.nom} ${data.patient.postnom || ''} ${data.patient.prenom}`.trim() : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Médecin prescripteur</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.medecin ? `${data.medecin.nom} ${data.medecin.prenom}` : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Date de demande</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.date_demande ? new Date(data.date_demande).toLocaleString() : '-'}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Statut</p>
                  <p className="font-medium text-gray-900 dark:text-white">{data.statut_demande}</p>
                </div>
                {data.note && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Note</p>
                    <p className="font-medium text-gray-900 dark:text-white whitespace-pre-line">{data.note}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Colonne détails d'examens */}
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Demande {data.code}</h2>
              <div className="text-sm mb-4 text-gray-700 dark:text-gray-300">Statut: <b>{data.statut_demande}</b></div>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                      <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Examen</th>
                      <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Résultat</th>
                      <th className="py-3 px-3 text-right text-gray-500 dark:text-gray-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {data.details.map((d) => {
                      const canEdit = data.statut_demande === 'En cours';
                      return (
                      <tr key={d.id}>
                        <td className="py-3 px-3">{d.examen?.nom_examen || `#${d.examen_id}`}</td>
                        <td className="py-3 px-3">{d.resultat || '—'}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm ${canEdit ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!canEdit}
                            onClick={() => canEdit && openResultModal(d)}
                          >Saisir</button>
                          <button
                            className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm ml-2 ${canEdit ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' : 'text-gray-400 cursor-not-allowed'}`}
                            disabled={!canEdit}
                            onClick={async () => { if (!canEdit) return; await apiFetch(`/v1/exam-requests/${id}/details/${d.id}`, { method: 'DELETE' }); fetchOne(); }}
                          >Supprimer</button>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pas de panneau FIFO/FEFO ici */}
          </div>
        )}
      </div>

      {/* Modal de saisie du résultat */}
      <Modal isOpen={resultModal.isOpen} onClose={closeResultModal} title="Saisir le résultat">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Examen</label>
            <div className="text-sm text-gray-800 dark:text-gray-100">{resultModal.detail?.examen?.nom_examen || `#${resultModal.detail?.examen_id}`}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Résultat</label>
            <textarea
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              rows={4}
              value={resultModal.value}
              onChange={(e) => setResultModal((s) => ({ ...s, value: e.target.value }))}
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button onClick={closeResultModal} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={submitResultModal} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-5 py-2 text-center text-sm font-medium text-white hover:bg-opacity-90">Enregistrer</button>
          </div>
        </div>
      </Modal>
    </>
  );
}


