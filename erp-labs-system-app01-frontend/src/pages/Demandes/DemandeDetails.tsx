import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { Helmet } from 'react-helmet-async';
import { apiFetch } from '../../lib/apiClient';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/badge/Badge';
import { useAuth } from '../../context/AuthContext';

type Detail = { id: number; examen_id: number; resultat?: string | null; date_resultat?: string | null; examen?: { id: number; nom_examen: string; code?: string | null; code_examen?: string | null; unites_mesure?: string | null; unite?: string | null; unite_mesure?: string | null; unite_mesure_label?: string | null; valeurs_reference?: string | null; reference?: string | null; valeur_reference?: string | null; intervalle_reference?: string | null; reference_min?: string | number | null; reference_max?: string | number | null; type_echantillon?: string | null } };
type Demande = { id: number; code: string; statut_demande: string; note?: string | null; date_demande?: string | null; patient?: { id: number; nom: string; postnom?: string | null; prenom: string; sexe?: string | null; date_naissance?: string | null; contact?: string | null; adresse?: string | null } | null; medecin?: { id: number; nom: string; prenom: string; matricule?: string | null; code?: string | null; identifiant?: string | null } | null; details: Detail[] };

export default function DemandeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
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
    if (!id || !data) return;
    const status = (data.statut_demande || '').toLowerCase();
    if (status === 'en cours' || status === 'terminée' || status === 'annulée') {
      return;
    }
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

  const handlePrint = () => {
    const area = document.querySelector('.print-area') as HTMLElement | null;
    if (!area) { window.print(); return; }
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) { window.print(); document.body.removeChild(iframe); return; }
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><title>Impression</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <style>@page{size:A4;margin:14mm;}body{background:#fff}</style>
    </head><body>${area.outerHTML}</body></html>`;
    doc.open();
    doc.write(html);
    doc.close();
    const doPrint = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => { document.body.removeChild(iframe); }, 100);
    };
    setTimeout(doPrint, 400);
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Terminée':
        return <Badge color="success">Terminée</Badge>;
      case 'En cours':
        return <Badge color="warning">En cours</Badge>;
      case 'En attente':
        return <Badge color="info">En attente</Badge>;
      case 'Annulée':
        return <Badge color="error">Annulée</Badge>;
      default:
        return <Badge color="info">{status || 'N/A'}</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Détails demande | ClinLab ERP</title>
        <style>{`
          @media print {
            @page { size: A4; margin: 14mm; }
            body * { display: none !important; }
            .print-area, .print-area * { display: revert !important; visibility: visible !important; }
            .print-area { position: static !important; inset: auto !important; width: 100% !important; }
            .print-area table { display: table !important; }
            .print-area thead { display: table-header-group !important; }
            .print-area tbody { display: table-row-group !important; }
            .print-area tr { display: table-row !important; }
            .print-area th, .print-area td { display: table-cell !important; }
            .no-print { display: none !important; }
          }
        `}</style>
      </Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link to="/demandes" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Retour</Link>
          <div className="flex items-center gap-3">
            {data && data.statut_demande === 'En attente' && (
              <Link to={`/demandes/${id}/modifier`} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">
                Modifier
              </Link>
            )}
            <button onClick={start} disabled={!data || (data.statut_demande || '').toLowerCase() !== 'en attente'} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50">Démarrer</button>
            <button onClick={finish} disabled={!data || (data.statut_demande || '').toLowerCase() !== 'en cours' || (data && data.details.some(d => !d.resultat || d.resultat.trim() === ''))} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 disabled:opacity-50">Terminer</button>
            <button onClick={cancel} disabled={!data || ['en cours','terminée','annulée'].includes((data.statut_demande || '').toLowerCase())} className="inline-flex items-center justify-center rounded-md px-6 py-2.5 text-center text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 disabled:opacity-50">Annuler</button>
          </div>
        </div>
        {loading ? 'Chargement...' : error ? <div className="text-red-500">{error}</div> : !data ? null : (
          <div className="print-area">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* En-tête fiche de prescription */}
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-500">PRESCRIPTIONS MÉDICALES — RÉSULTATS</h1>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">DEMANDE N° <span className="font-semibold text-gray-800 dark:text-gray-100">{data.code}</span></p>

                {/* Bloc patient */}
                <div className="mt-4 text-sm">
                  <p className="font-semibold text-gray-700 dark:text-gray-200">PATIENT :</p>
                  <p className="mt-1 font-semibold text-gray-800 dark:text-gray-100">{data.patient ? `${data.patient.nom} ${data.patient.postnom || ''} ${data.patient.prenom}`.trim() : '-'}</p>
                  {(() => {
                    const sexe = data.patient?.sexe || '—';
                    let age = '—';
                    if (data.patient?.date_naissance) {
                      const dob = new Date(data.patient.date_naissance);
                      if (!isNaN(dob.getTime())) {
                        const now = new Date();
                        let years = now.getFullYear() - dob.getFullYear();
                        const m = now.getMonth() - dob.getMonth();
                        if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years--;
                        age = `${years} ans`;
                      }
                    }
                    const tel = data.patient?.contact || '—';
                    const addr = data.patient?.adresse || '—';
                    return (
                      <>
                        <p className="text-gray-600 dark:text-gray-400">Sexe: {sexe} • Âge: {age} • Tél: {tel}</p>
                        <p className="text-gray-600 dark:text-gray-400">Adresse: {addr}</p>
                      </>
                    );
                  })()}
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="h-12 w-12 rounded-lg border border-gray-300 p-1.5 text-gray-500 dark:border-gray-700 dark:text-gray-400 overflow-hidden">
                  {state?.company?.logo ? (
                    <img src={state.company.logo} alt="Logo compagnie" className="h-full w-full object-contain" />
                  ) : (
                    <img src="/images/logo/logo-icon.svg" alt="Logo" className="h-full w-full object-contain opacity-80 dark:opacity-70" />
                  )}
                </div>
                <div className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  DATE DEMANDE <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">{data.date_demande ? new Date(data.date_demande).toLocaleString() : '-'}</span>
                </div>
                <div className="text-right">{getStatusBadge(data.statut_demande)}</div>
                <button onClick={handlePrint} className="no-print inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Imprimer</button>
              </div>
            </div>

            {/* Infos prescripteur + établissement */}
            <section className="mt-6 grid gap-4 md:grid-cols-2 text-sm">
              <div className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Médecin prescripteur</p>
                <p className="text-gray-800 font-medium dark:text-gray-100">{data.medecin ? `Dr. ${data.medecin.nom} ${data.medecin.prenom}` : '-'}</p>
                <p className="text-gray-600 dark:text-gray-400">Service: —</p>
                <p className="text-gray-600 dark:text-gray-400">Matricule: <span className="font-medium text-gray-800 dark:text-gray-100">{data.medecin?.matricule || data.medecin?.code || data.medecin?.identifiant || '—'}</span></p>
              </div>
              <div className="rounded-md border border-gray-200 p-4 dark:border-gray-800">
                <p className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Établissement / Compagnie</p>
                <p className="text-gray-800 font-medium dark:text-gray-100">{state?.company?.nom_company || '—'}</p>
                <p className="text-gray-600 dark:text-gray-400">Code: <span className="font-medium text-gray-800 dark:text-gray-100">{state?.company?.code || '—'}</span></p>
                <p className="text-gray-600 dark:text-gray-400">{state?.company?.adresse || '—'}</p>
                <p className="text-gray-600 dark:text-gray-400">Tél: {state?.company?.contact || '—'}{state?.company?.email ? ` — ${state.company.email}` : ''}</p>
              </div>
            </section>

            {/* Tableau examens */}
            <div className="mt-8 overflow-hidden rounded-md border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-12 bg-gray-200/80 px-4 py-2 text-[11px] md:text-xs font-semibold text-gray-700 dark:bg-white/[0.06] dark:text-gray-300">
                <div className="col-span-1">ST.</div>
                <div className="col-span-2">CODE</div>
                <div className="col-span-4">EXAMEN</div>
                <div className="col-span-2 text-right">RÉSULTAT</div>
                <div className="col-span-1 text-center">UNITÉ</div>
                <div className="col-span-1 text-right">RÉF.</div>
                <div className="col-span-1 text-right">ACTIONS</div>
              </div>

              {data.details.map((d, idx) => {
                const canEdit = (data.statut_demande || '').toLowerCase() === 'en cours';
                const codeValue = d.examen?.code || d.examen?.code_examen || '—';
                const unitValue = d.examen?.unites_mesure || d.examen?.unite || d.examen?.unite_mesure || d.examen?.unite_mesure_label || '—';
                let refValue = '—';
                const refMin = d.examen?.reference_min;
                const refMax = d.examen?.reference_max;
                if (d.examen?.valeurs_reference) {
                  refValue = d.examen.valeurs_reference;
                } else if (d.examen?.reference) {
                  refValue = d.examen.reference;
                } else if (d.examen?.valeur_reference) {
                  refValue = d.examen.valeur_reference;
                } else if (refMin != null && refMax != null && refMin !== '' && refMax !== '') {
                  refValue = `${refMin} - ${refMax}`;
                } else if (d.examen?.intervalle_reference) {
                  refValue = d.examen.intervalle_reference;
                }
                return (
                  <div key={d.id} className="grid grid-cols-12 items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-100 last:border-0 dark:border-white/[0.05]">
                    <div className="col-span-1">{idx + 1}</div>
                    <div className="col-span-2">{codeValue}</div>
                    <div className="col-span-4">
                      {d.examen?.nom_examen || '—'}
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">Type échantillon: {d.examen?.type_echantillon || '—'}</div>
                    </div>
                    <div className="col-span-2 text-right">{d.resultat || '—'}</div>
                    <div className="col-span-1 text-center">{unitValue}</div>
                    <div className="col-span-1 text-right">{refValue}</div>
                    <div className="col-span-1 text-right">
                      <button
                        className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs ${canEdit ? 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800' : 'text-gray-400 cursor-not-allowed'}`}
                        disabled={!canEdit}
                        onClick={() => canEdit && openResultModal(d)}
                      >Saisir</button>
                      <button
                        className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs ml-2 ${canEdit ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20' : 'text-gray-400 cursor-not-allowed'}`}
                        disabled={!canEdit}
                        onClick={async () => { if (!canEdit) return; await apiFetch(`/v1/exam-requests/${id}/details/${d.id}`, { method: 'DELETE' }); fetchOne(); }}
                      >Suppr.</button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dates & méta */}
            <section className="mt-6 grid gap-4 md:grid-cols-2 text-sm">
              <div className="rounded-md bg-gray-100 px-4 py-3 dark:bg-white/[0.06]">
                <span className="text-gray-600 dark:text-gray-400">Date prélèvement :</span>
                <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">{data.date_demande ? new Date(data.date_demande).toLocaleString() : '-'}</span>
              </div>
              <div className="rounded-md bg-gray-100 px-4 py-3 dark:bg-white/[0.06]">
                <span className="text-gray-600 dark:text-gray-400">Date(s) résultat :</span>
                {(() => {
                  const dates = (data.details.map((x) => x.date_resultat).filter(Boolean) as string[]);
                  if (!dates.length) return <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">—</span>;
                  const sorted = dates.map((d) => new Date(d)).sort((a,b) => a.getTime() - b.getTime());
                  const first = sorted[0].toLocaleString();
                  const last = sorted[sorted.length - 1].toLocaleString();
                  return <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">{first}{first !== last ? ` — ${last}` : ''}</span>;
                })()}
              </div>
            </section>

            {/* Observations */}
            <section className="mt-6">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Observations</p>
              <p className="mt-2 rounded-md border border-gray-200 p-4 text-sm text-gray-700 leading-relaxed dark:border-gray-800 dark:text-gray-200 whitespace-pre-line">{data.note || '—'}</p>
            </section>
            </div>
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


