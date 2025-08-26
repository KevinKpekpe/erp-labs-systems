import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams, Link } from "react-router";
import Modal from "../../components/ui/Modal";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Badge from "../../components/ui/badge/Badge";
import { apiFetch } from "../../lib/apiClient";
import { formatCDF } from "../../lib/currency";
import { useAuth } from "../../context/AuthContext";
import { ENV } from "../../config/env";

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

type InvoiceDto = {
  id: number;
  code: string;
  date_facture: string;
  montant_total: number;
  statut_facture: string;
  patient?: { nom?: string; postnom?: string; prenom?: string; contact?: string; adresse?: string; date_naissance?: string; sexe?: string } | null;
  details?: Array<{ id: number; prix_unitaire_facture?: number; exam?: { nom_examen?: string; code?: string } | null }> | null;
  payments?: Array<{ id: number; date_paiement?: string; montant_paye?: number; methode_paiement?: string | null }> | null;
} | null;

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state } = useAuth();
  const [invoice, setInvoice] = useState<InvoiceDto>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modal, setModal] = useState<{ open: boolean } & { montant_paye?: string; methode_paiement?: string; reference_paiement?: string }>({ open: false });

  const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
  const logoUrl = useMemo(() => {
    const c = state.company;
    if (!c) return null;
    const logo = c.logo as string | undefined;
    if (!logo) return null;
    if (/^https?:\/\//i.test(logo)) return logo;
    const path = String(logo).replace(/^\/+/, '');
    return `${backendBase}/storage/${path}`;
  }, [state.company, backendBase]);

  useEffect(() => { if (!success) return; const t = setTimeout(() => setSuccess(null), 4000); return () => clearTimeout(t); }, [success]);
  useEffect(() => { if (!error) return; const t = setTimeout(() => setError(null), 4000); return () => clearTimeout(t); }, [error]);

  useEffect(() => {
    let mounted = true; setError(null);
    (async () => {
      try { const res = await apiFetch(`/v1/invoices/${id}`, { method: 'GET' }, 'company'); if (!mounted) return; setInvoice(((res as unknown) as { data?: InvoiceDto })?.data ?? (res as InvoiceDto)); }
      catch (e: unknown) { if (!mounted) return; const msg = (e as { message?: string })?.message || 'Erreur'; setError(msg); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const patientName = useMemo(() => {
    const p = invoice?.patient; if (!isRecord(p)) return '';
    return `${String(p.nom ?? '')} ${String(p.postnom ?? '')} ${String(p.prenom ?? '')}`.trim();
  }, [invoice]);

  const remainingToPay = useMemo(() => {
    const total = Number(invoice?.montant_total || 0);
    const paid = Array.isArray(invoice?.payments)
      ? invoice!.payments!.reduce((s: number, p) => s + Number(p?.montant_paye || 0), 0)
      : 0;
    return Math.max(0, total - paid);
  }, [invoice]);

  const addPayment = async () => {
    try {
      // Garde front: ne pas dépasser le reste à payer
      const remaining = remainingToPay;
      const toPay = Number(modal.montant_paye || 0);
      if (toPay > remaining + 1e-6) { setError(`Le montant saisi dépasse le reste à payer (${remaining.toLocaleString('fr-FR')}).`); setModal({ open: false }); return; }

      await apiFetch('/v1/payments', { method: 'POST', body: JSON.stringify({
        facture_id: Number(id),
        montant_paye: toPay,
        methode_paiement: modal.methode_paiement,
        reference_paiement: modal.reference_paiement || undefined,
      }) }, 'company');
      const res = await apiFetch(`/v1/invoices/${id}`, { method: 'GET' }, 'company');
      setInvoice(((res as unknown) as { data?: InvoiceDto })?.data ?? (res as InvoiceDto)); setModal({ open: false }); setSuccess('Paiement enregistré.');
    } catch (e: unknown) { setModal({ open: false }); const msg = (e as { message?: string })?.message || 'Erreur lors de l\'enregistrement.'; setError(msg); }
  };

  const cancelInvoice = async () => {
    try { await apiFetch(`/v1/invoices/${id}`, { method: 'DELETE' }, 'company'); navigate('/factures', { state: { success: 'Facture annulée.' } }); }
    catch (e: unknown) { const msg = (e as { message?: string })?.message || 'Impossible d\'annuler la facture.'; setError(msg); }
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
    const html = `<!doctype html><html lang="fr"><head><meta charset="utf-8"/><title>Facture</title>
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

  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case 'Payée':
        return <Badge size="sm" color="success">Payée</Badge>;
      case 'Partiellement payée':
        return <Badge size="sm" color="warning">Partiellement payée</Badge>;
      case 'Annulée':
        return <Badge size="sm" color="error">Annulée</Badge>;
      default:
        return <Badge size="sm" color="info">En attente</Badge>;
    }
  };

  return (
    <>
      <Helmet>
        <title>Détails Facture | ClinLab ERP</title>
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
          <Link to="/factures" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Retour</Link>
          <div className="flex items-center gap-3">
            {remainingToPay > 0 && invoice?.statut_facture !== 'Annulée' && (
              <button onClick={() => setModal({ open: true, methode_paiement: 'Caisse' })} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Ajouter paiement</button>
            )}
            <button onClick={cancelInvoice} className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-6 py-2.5 text-center font-medium text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={invoice?.statut_facture === 'Payée' || invoice?.statut_facture === 'Annulée'}>Annuler</button>
            <button onClick={handlePrint} className="no-print inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Imprimer</button>
          </div>
        </div>

        {success && (<div className="mb-6"><Alert variant="success" title="Succès" message={success} /></div>)}
        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        {invoice && (
          <div className="print-area">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              {/* En-tête de la facture */}
              <div className="flex items-start justify-between mb-8">
                <div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-brand-500">FACTURE MÉDICALE</h1>
                  <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">FACTURE N° <span className="font-semibold text-gray-800 dark:text-gray-100">{invoice.code}</span></p>
                  
                  {/* Informations de la company */}
                  <div className="mt-4 text-sm">
                    <p className="font-semibold text-gray-700 dark:text-gray-200">{state.company?.nom_company || 'LABORATOIRE'}</p>
                    <p className="text-gray-600 dark:text-gray-400">{state.company?.adresse || 'Adresse du laboratoire'}</p>
                    <p className="text-gray-600 dark:text-gray-400">Tél: {state.company?.contact || '-'} • Email: {state.company?.email || '-'}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3">
                  {/* Logo de la company */}
                  <div className="h-16 w-16 rounded-lg border border-gray-300 p-2 text-gray-500 dark:border-gray-700 dark:text-gray-400 overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo compagnie" className="h-full w-full object-contain" />
                    ) : (
                      <img src="/images/logo/logo-icon.svg" alt="Logo" className="h-full w-full object-contain opacity-80 dark:opacity-70" />
                    )}
                  </div>
                  
                  {/* Informations de la facture */}
                  <div className="text-right">
                    <div className="rounded bg-gray-100 px-3 py-1 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                      DATE FACTURE <span className="ml-2 font-semibold text-gray-800 dark:text-gray-100">{invoice.date_facture ? new Date(invoice.date_facture).toLocaleDateString() : '-'}</span>
                    </div>
                    <div className="mt-2">{getStatusBadge(invoice.statut_facture)}</div>
                  </div>
                </div>
              </div>

              {/* Informations du patient */}
              <div className="mb-8 p-4 bg-gray-50 rounded-lg dark:bg-gray-800">
                <h3 className="font-semibold text-gray-700 dark:text-gray-200 mb-2">INFORMATIONS DU PATIENT</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Nom complet:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{patientName || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Contact:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{invoice.patient?.contact || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 dark:text-gray-400">Adresse:</p>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{invoice.patient?.adresse || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Détails des examens */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">DÉTAIL DES EXAMENS</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                    <thead>
                      <tr className="bg-gray-100 dark:bg-gray-800">
                        <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">N°</th>
                        <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Examen</th>
                        <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Prix Unitaire</th>
                        <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(invoice.details) && invoice.details.map((detail, index) => (
                        <tr key={detail.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                          <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100 text-center">{index + 1}</td>
                          <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100">{detail?.exam?.nom_examen || '-'}</td>
                          <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100 text-right">{formatCDF(detail?.prix_unitaire_facture || 0)}</td>
                          <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100 text-right">{formatCDF(detail?.prix_unitaire_facture || 0)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Résumé financier */}
              <div className="mb-8 flex justify-end">
                <div className="w-80">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Sous-total:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{formatCDF(invoice.montant_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">TVA (0%):</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{formatCDF(0)}</span>
                    </div>
                    <hr className="border-gray-300 dark:border-gray-600" />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-gray-800 dark:text-gray-100">TOTAL:</span>
                      <span className="text-brand-500">{formatCDF(invoice.montant_total)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Déjà payé:</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{formatCDF(invoice.montant_total - remainingToPay)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold">
                      <span className="text-gray-800 dark:text-gray-100">Reste à payer:</span>
                      <span className={remainingToPay > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
                        {formatCDF(remainingToPay)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Historique des paiements */}
              {Array.isArray(invoice.payments) && invoice.payments.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">HISTORIQUE DES PAIEMENTS</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 dark:border-gray-600">
                      <thead>
                        <tr className="bg-gray-100 dark:bg-gray-800">
                          <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Date</th>
                          <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">Méthode</th>
                          <th className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-200">Montant</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.payments.map((payment, index) => (
                          <tr key={payment.id} className={index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-800'}>
                            <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100">
                              {payment?.date_paiement ? new Date(payment.date_paiement).toLocaleDateString() : '-'}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100">
                              {payment?.methode_paiement || '-'}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-600 py-3 px-4 text-sm text-gray-800 dark:text-gray-100 text-right">
                              {formatCDF(payment?.montant_paye || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pied de page */}
              <div className="mt-12 pt-6 border-t border-gray-300 dark:border-gray-600 text-center text-xs text-gray-500 dark:text-gray-400">
                <p>Cette facture a été générée automatiquement par le système ClinLab ERP</p>
                <p className="mt-1">Pour toute question, veuillez contacter notre service client</p>
              </div>
            </div>
          </div>
        )}

        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title="Ajouter un paiement" size="sm">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Montant payé</label>
              <Input type="number" step={0.01} value={modal.montant_paye || ''} onChange={(e) => setModal({ ...modal, montant_paye: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Méthode</label>
              <select className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white" value={modal.methode_paiement || 'Caisse'} onChange={(e) => setModal({ ...modal, methode_paiement: e.target.value })}>
                <option>Carte bancaire</option>
                <option>Caisse</option>
                <option>Assurance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Référence (optionnel)</label>
              <Input type="text" value={modal.reference_paiement || ''} onChange={(e) => setModal({ ...modal, reference_paiement: e.target.value })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setModal({ open: false })} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
              <button onClick={addPayment} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Enregistrer</button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
}


