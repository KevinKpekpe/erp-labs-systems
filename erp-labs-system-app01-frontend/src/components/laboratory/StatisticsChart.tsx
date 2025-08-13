import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiClient";

export default function StatisticsChart() {
  const [labels, setLabels] = useState<string[]>([]);
  const [series, setSeries] = useState<number[]>([]);

  const options: ApexOptions = {
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
    chart: { fontFamily: "Outfit, sans-serif", type: "donut", height: 300 },
    plotOptions: { pie: { donut: { size: "65%", labels: { show: true, name: { show: true, fontSize: "14px", fontFamily: "Outfit", color: "#6B7280", offsetY: -10 }, value: { show: true, fontSize: "20px", fontFamily: "Outfit", color: "#111827", offsetY: 16, formatter: function (val) { return val + "%"; } }, total: { show: true, label: "Total", fontSize: "16px", fontFamily: "Outfit", color: "#6B7280", formatter: function (w) { return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0); } } } } } },
    labels,
    legend: { show: true, position: "bottom", horizontalAlign: "center", fontFamily: "Outfit", fontSize: "12px", markers: { size: 12 } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    tooltip: { y: { formatter: function (val) { return val + " examens"; } } },
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch<any>("/v1/dashboard/distribution?period=month", { method: "GET" }, "company");
        if (!mounted) return;
        setLabels(res.data.labels || []);
        setSeries((res.data.series || []).map((n: any) => Number(n)));
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Répartition des examens</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Statistiques des types d'examens effectués ce mois</p>
      </div>
      <div className="flex items-center justify-center">
        <Chart options={options} series={series} type="donut" height={300} />
      </div>
    </div>
  );
} 