import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router";
import Input from "../../components/form/input/InputField";
import Alert from "../../components/ui/alert/Alert";
import { formatCDF } from "../../lib/currency";
import { apiFetch } from "../../lib/apiClient";

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }

interface PaymentRow { id: number; code: string; facture_code: string; facture_id: number; montant_paye: number; methode: string; date: string; }

function mapPayment(r: unknown): PaymentRow | null {
  if (!isRecord(r)) return null;
  const id = r["id"]; const code = r["code"]; const montant = r["montant_paye"]; const date = r["date_paiement"]; const methode = r["methode_paiement"]; const invoice = r["invoice"];
  let facture_code = '';
  let facture_id = 0;
  if (isRecord(invoice)) { const c = invoice["code"]; if (typeof c === 'string') facture_code = c; const fid = invoice["id"]; if (typeof fid === 'number' || typeof fid === 'string') facture_id = Number(fid); }
  return { id: Number(id ?? 0), code: String(code ?? ''), facture_code, facture_id, montant_paye: Number(montant ?? 0), methode: String(methode ?? ''), date: String(date ?? '') };
}

function extractPayments(resp: unknown): PaymentRow[] {
  const root = (resp as { data?: unknown })?.data ?? resp; const data = isRecord(root) ? (root as Record<string, unknown>)["data"] : root; const arr = Array.isArray(data) ? (data as unknown[]) : []; return arr.map(mapPayment).filter((x): x is PaymentRow => x !== null);
}

export default function PaymentsList() {
  const [items, setItems] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const q = params.get('q') ?? '';
  const [dq, setDq] = useState(q);
  useEffect(() => { const t = setTimeout(() => { const p = new URLSearchParams(location.search); if (dq) p.set('q', dq); else p.delete('q'); navigate({ pathname: location.pathname, search: p.toString() }); }, 350); return () => clearTimeout(t); }, [dq, location.pathname, location.search, navigate]);

  const activeFilters = useMemo(() => { let c = 0; if (q) c++; return c; }, [q]);

  useEffect(() => {
    let mounted = true; setLoading(true); setError(null);
    (async () => {
      try { const p = new URLSearchParams(); p.set('per_page', '100'); if (q) p.set('q', q); const res = await apiFetch(`/v1/payments?${p.toString()}`, { method: 'GET' }, 'company'); if (!mounted) return; const list = extractPayments(res);
        // enrich invoice code via show endpoint for each payment (optional)
        setItems(list);
      } catch (e: any) { if (!mounted) return; setError(e?.message || 'Erreur'); } finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [q]);

  return (
    <>
      <Helmet><title>Paiements | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Paiements</h2>
        </div>

        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Filtres {activeFilters > 0 && (<span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-800 dark:bg-brand-900/20 dark:text-brand-400">{activeFilters}</span>)}
            </h3>
            {activeFilters > 0 && (<button onClick={() => navigate({ pathname: location.pathname })} className="text-sm text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">Effacer les filtres</button>)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recherche</label>
              <Input type="text" placeholder="Code, méthode..." value={dq} onChange={(e) => setDq(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Code</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Facture</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Montant</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Méthode</th>
                  <th className="py-4 px-4 text-start font-medium text-gray-500 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr><td className="py-8 px-4" colSpan={5}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>
                ) : items.map(p => (
                  <tr key={p.id}>
                    <td className="py-4 px-4 font-medium text-gray-800 dark:text-white/90">{p.code}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90"><Link className="text-brand-600 hover:underline" to={`/factures/${p.facture_id}`}>{p.facture_code || '-'}</Link></td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{formatCDF(p.montant_paye)}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{p.methode}</td>
                    <td className="py-4 px-4 text-gray-800 dark:text-white/90">{p.date ? new Date(p.date).toLocaleDateString() : '-'}</td>
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


