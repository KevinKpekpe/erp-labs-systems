import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import { formatCDF } from "../../lib/currency";
import Badge from "../../components/ui/badge/Badge";
import { apiFetch } from "../../lib/apiClient";
import { EyeIcon } from "../../icons";

type BadgeColor = "success" | "warning" | "info" | "error" | "light";

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

interface InvoiceRow {
  id: number;
  code: string;
  patient: string;
  montant_total: number;
  statut: string;
  date_facture: string;
}

function mapInvoice(r: unknown): InvoiceRow | null {
  if (!isRecord(r)) return null;
  const id = r["id"]; const code = r["code"]; const montant = r["montant_total"]; const statut = r["statut_facture"]; const date = r["date_facture"]; const p = r["patient"];
  let patient = "";
  if (isRecord(p)) {
    const nom = p["nom"]; const postnom = p["postnom"]; const prenom = p["prenom"]; 
    patient = `${String(nom ?? "")} ${String(postnom ?? "")} ${String(prenom ?? "")}`.trim();
  }
  return {
    id: typeof id === 'number' || typeof id === 'string' ? Number(id) : 0,
    code: typeof code === 'string' ? code : String(code ?? ''),
    patient,
    montant_total: typeof montant === 'number' || typeof montant === 'string' ? Number(montant) : 0,
    statut: typeof statut === 'string' ? statut : String(statut ?? ''),
    date_facture: typeof date === 'string' ? date : String(date ?? ''),
  };
}

function extractInvoices(resp: unknown): InvoiceRow[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  const data = isRecord(root) ? (root as Record<string, unknown>)["data"] : root;
  const arr = Array.isArray(data) ? (data as unknown[]) : [];
  return arr.map(mapInvoice).filter((x): x is InvoiceRow => x !== null);
}

function statutColor(statut: string): BadgeColor {
  switch (statut) {
    case 'Payée': return 'success';
    case 'Partiellement payée': return 'warning';
    case 'Annulée': return 'error';
    default: return 'info';
  }
}

export default function InvoicesList() {
  const [items, setItems] = useState<InvoiceRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => { const state = (location.state as { success?: string } | null) || null; if (state?.success) { setSuccessMessage(state.success); navigate(location.pathname, { replace: true, state: {} }); } }, [location.state, location.pathname, navigate]);
  useEffect(() => { if (!successMessage) return; const t = setTimeout(() => setSuccessMessage(null), 5000); return () => clearTimeout(t); }, [successMessage]);

  const params = new URLSearchParams(location.search);
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? '';
  const code = params.get('code') ?? '';
  const dateFrom = params.get('date_from') ?? '';
  const dateTo = params.get('date_to') ?? '';

  // Debounce
  const [dq, setDq] = useState(q);
  const [dcode, setDcode] = useState(code);
  useEffect(() => { const t = setTimeout(() => {
    const p = new URLSearchParams(location.search);
    if (dq) p.set('q', dq); else p.delete('q');
    if (dcode) p.set('code', dcode); else p.delete('code');
    navigate({ pathname: location.pathname, search: p.toString() });
  }, 350); return () => clearTimeout(t); }, [dq, dcode, location.pathname, location.search, navigate]);

  const activeFilters = useMemo(() => {
    let c = 0; if (q) c++; if (status) c++; if (code) c++; if (dateFrom) c++; if (dateTo) c++; return c;
  }, [q, status, code, dateFrom, dateTo]);

  useEffect(() => {
    let mounted = true; setLoading(true); setError(null);
    (async () => {
      try {
        const p = new URLSearchParams(); p.set('per_page', '100');
        if (q) p.set('q', q); if (status) p.set('status', status); if (code) p.set('code', code);
        if (dateFrom) p.set('date_from', dateFrom); if (dateTo) p.set('date_to', dateTo);
        const res = await apiFetch(`/v1/invoices?${p.toString()}`, { method: 'GET' }, 'company');
        if (!mounted) return; setItems(extractInvoices(res));
      } catch (e: any) {
        if (!mounted) return; setError(e?.message || 'Erreur');
      } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [q, status, code, dateFrom, dateTo]);

  return (
    <>
      <Helmet><title>Factures | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Factures</h2>
        </div>

        {successMessage && (<div className="mb-6"><Alert variant="success" title="Succès" message={successMessage} /></div>)}
        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtres {activeFilters > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400">{activeFilters}</span>
              )}
            </h3>
            {activeFilters > 0 && (
              <button
                onClick={() => navigate({ pathname: location.pathname })}
                className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
              >Effacer les filtres</button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche</label>
              <Input type="text" placeholder="Code, statut..." value={dq} onChange={(e) => setDq(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Statut</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={status}
                onChange={(e) => { const p = new URLSearchParams(location.search); if (e.target.value) p.set('status', e.target.value); else p.delete('status'); navigate({ pathname: location.pathname, search: p.toString() }); }}
              >
                <option value="">Tous</option>
                <option>En attente de paiement</option>
                <option>Partiellement payée</option>
                <option>Payée</option>
                <option>Annulée</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Code</label>
              <Input type="text" placeholder="INV-..." value={dcode} onChange={(e) => setDcode(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date début</label>
              <Input type="date" value={dateFrom} onChange={(e) => { const p = new URLSearchParams(location.search); if (e.target.value) p.set('date_from', e.target.value); else p.delete('date_from'); navigate({ pathname: location.pathname, search: p.toString() }); }} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date fin</label>
              <Input type="date" value={dateTo} onChange={(e) => { const p = new URLSearchParams(location.search); if (e.target.value) p.set('date_to', e.target.value); else p.delete('date_to'); navigate({ pathname: location.pathname, search: p.toString() }); }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Code</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Patient</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Montant</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Statut</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Date</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr><td className="py-8 px-4" colSpan={6}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>
                ) : items.map(inv => (
                  <tr key={inv.id}>
                    <td className="py-4 px-4 font-medium text-gray-800 dark:text-white/90">{inv.code}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{inv.patient || '-'}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{formatCDF(inv.montant_total)}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90"><Badge size="sm" color={statutColor(inv.statut)}>{inv.statut}</Badge></td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{new Date(inv.date_facture).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <Link className="text-brand-600 hover:text-brand-700" to={`/factures/${inv.id}`} title="Voir">
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}


