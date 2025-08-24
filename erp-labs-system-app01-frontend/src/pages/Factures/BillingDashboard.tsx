import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { apiFetch } from "../../lib/apiClient";
import Chart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

type Metrics = {
  invoices: { total: number; paid: number; partial: number; pending: number; cancelled: number };
  payments: { sum_total: number; sum_today: number; sum_this_month: number };
  outstanding: number;
  revenue_months: Array<{ label: string; amount: number }>;
};

export default function BillingDashboard() {
  const [data, setData] = useState<Metrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true; setError(null);
    (async () => {
      try { const res = await apiFetch('/v1/billing/dashboard/metrics', { method: 'GET' }, 'company'); if (!mounted) return; setData(((res as unknown) as { data?: Metrics })?.data ?? (res as Metrics)); }
      catch (e: unknown) { if (!mounted) return; const msg = (e as { message?: string })?.message || 'Erreur'; setError(msg); }
    })();
    return () => { mounted = false; };
  }, []);

  const months = useMemo(() => data?.revenue_months ?? [], [data]);
  const currency = useMemo(() => new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'CDF', maximumFractionDigits: 0 }), []);
  const barOptions: ApexOptions = useMemo(() => ({
    colors: ["#16a34a"],
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 260, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "45%", borderRadius: 6, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    xaxis: { categories: months.map(m => m.label), axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (v: number) => currency.format(v) } },
    grid: { yaxis: { lines: { show: true } } },
    tooltip: { y: { formatter: (v: number) => currency.format(v) } },
  }), [months, currency]);
  const barSeries = useMemo(() => [{ name: 'Encaissements', data: months.map(m => m.amount) }], [months]);

  return (
    <>
      <Helmet><title>Dashboard Financier | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <h2 className="text-title-md2 font-semibold text-black dark:text-white mb-6">Dashboard Financier</h2>

        {error && (<div className="mb-6 rounded-2xl border border-error-500 bg-error-50 p-4 dark:border-error-500/30 dark:bg-error-500/15"><p className="text-error-600 dark:text-error-400">{error}</p></div>)}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card title="Total factures" value={data?.invoices.total ?? 0} />
          <Card title="Payées" value={data?.invoices.paid ?? 0} />
          <Card title="Partielles" value={data?.invoices.partial ?? 0} />
          <Card title="En attente" value={data?.invoices.pending ?? 0} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card title="Total encaissé" value={currency.format(data?.payments.sum_total ?? 0)} />
          <Card title="Aujourd'hui" value={currency.format(data?.payments.sum_today ?? 0)} />
          <Card title="Ce mois" value={currency.format(data?.payments.sum_this_month ?? 0)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Encaissements (6 derniers mois)</h3>
            <Chart options={barOptions} series={barSeries} type="bar" height={260} />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Restant dû global</h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{currency.format(data?.outstanding ?? 0)}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Somme des montants facturés (hors annulées) moins encaissements.</p>
          </div>
        </div>
      </div>
    </>
  );
}

function Card({ title, value, prefix }: { title: string; value: number | string; prefix?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{title}</p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">{prefix ? `${prefix} ${value}` : value}</p>
    </div>
  );
}


