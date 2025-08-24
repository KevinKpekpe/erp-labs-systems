import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router";
import Modal from "../../components/ui/Modal";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import Badge from "../../components/ui/badge/Badge";
import { apiFetch } from "../../lib/apiClient";
import { formatCDF } from "../../lib/currency";

type BadgeColor = "success" | "warning" | "info" | "error" | "light";
function color(statut: string): BadgeColor { switch(statut){ case 'Payée': return 'success'; case 'Partiellement payée': return 'warning'; case 'Annulée': return 'error'; default: return 'info'; } }

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

type InvoiceDto = {
  id: number;
  code: string;
  date_facture: string;
  montant_total: number;
  statut_facture: string;
  patient?: { nom?: string; postnom?: string; prenom?: string } | null;
  details?: Array<{ id: number; prix_unitaire_facture?: number; exam?: { nom_examen?: string } | null }> | null;
  payments?: Array<{ id: number; date_paiement?: string; montant_paye?: number; methode_paiement?: string | null }> | null;
} | null;

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<InvoiceDto>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [modal, setModal] = useState<{ open: boolean } & { montant_paye?: string; methode_paiement?: string; reference_paiement?: string }>({ open: false });

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

  return (
    <>
      <Helmet><title>Détails Facture | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Facture {invoice?.code ? `#${invoice.code}` : ''}</h2>
          <div className="flex items-center gap-3">
            {remainingToPay > 0 && invoice?.statut_facture !== 'Annulée' && (
              <button onClick={() => setModal({ open: true, methode_paiement: 'Caisse' })} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Ajouter paiement</button>
            )}
            <button onClick={cancelInvoice} className="inline-flex items-center justify-center rounded-md border border-red-300 bg-white px-6 py-2.5 text-center font-medium text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={invoice?.statut_facture === 'Payée'}>Annuler</button>
          </div>
        </div>

        {success && (<div className="mb-6"><Alert variant="success" title="Succès" message={success} /></div>)}
        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informations</h3>
              <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">Patient: <span className="font-medium text-gray-900 dark:text-white">{patientName || '-'}</span></div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Date: <span className="font-medium text-gray-900 dark:text-white">{invoice?.date_facture ? new Date(invoice.date_facture).toLocaleDateString() : '-'}</span></div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Montant total: <span className="font-medium text-gray-900 dark:text-white">{formatCDF(invoice?.montant_total || 0)}</span></div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Reste à payer: <span className="font-medium text-gray-900 dark:text-white">{formatCDF(remainingToPay)}</span></div>
              <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">Statut: <span className="align-middle"><Badge size="sm" color={color(invoice?.statut_facture || '')}>{invoice?.statut_facture}</Badge></span></div>
            </div>

            <div className="mt-6">
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Examens facturés</h4>
              <div className="max-w-full overflow-x-auto">
                <table className="w-full table-auto">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                      <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Examen</th>
                      <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Prix</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                    {Array.isArray(invoice?.details) && invoice!.details!.map((d) => (
                      <tr key={d.id}>
                        <td className="py-3 px-3 text-gray-800 dark:text-white/90">{d?.exam?.nom_examen || '-'}</td>
                        <td className="py-3 px-3 text-gray-800 dark:text-white/90">{formatCDF(d?.prix_unitaire_facture || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-2">Paiements</h4>
            <div className="max-w-full overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                    <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Date</th>
                    <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Montant</th>
                    <th className="py-3 px-3 text-left text-gray-500 dark:text-gray-400">Méthode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {Array.isArray(invoice?.payments) && invoice!.payments!.map((p) => (
                    <tr key={p.id}>
                      <td className="py-3 px-3 text-gray-800 dark:text-white/90">{p?.date_paiement ? new Date(p.date_paiement).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-3 text-gray-800 dark:text-white/90">{formatCDF(p?.montant_paye || 0)}</td>
                      <td className="py-3 px-3 text-gray-800 dark:text-white/90">{p?.methode_paiement || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

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


