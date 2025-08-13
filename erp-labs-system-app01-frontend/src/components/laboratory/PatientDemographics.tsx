import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiClient";

export default function PatientDemographics() {
  const ageOptions: ApexOptions = {
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 200, toolbar: { show: false } },
    plotOptions: { bar: { horizontal: false, columnWidth: "60%", borderRadius: 4, borderRadiusApplication: "end" } },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: { categories: ["0-18", "19-30", "31-50", "51-70", "70+"], axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { title: { text: "Nombre de patients" } },
    fill: { opacity: 1 },
    tooltip: { y: { formatter: function (val) { return val + " patients"; } } },
  };

  const genderOptions: ApexOptions = {
    colors: ["#EC4899", "#3B82F6"],
    chart: { fontFamily: "Outfit, sans-serif", type: "donut", height: 200 },
    plotOptions: { pie: { donut: { size: "70%", labels: { show: true, name: { show: true, fontSize: "12px", fontFamily: "Outfit", color: "#6B7280" }, value: { show: true, fontSize: "16px", fontFamily: "Outfit", color: "#111827", formatter: function (val) { return val + "%"; } } } } } },
    labels: ["Femmes", "Hommes"],
    legend: { show: false },
    dataLabels: { enabled: false },
  };

  const [ageSeries, setAgeSeries] = useState<any[]>([{ name: "Patients", data: [0,0,0,0,0] }]);
  const [genderSeries, setGenderSeries] = useState<number[]>([0,0]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch<any>("/v1/dashboard/demographics", { method: "GET" }, "company");
        if (!mounted) return;
        const ages = res.data.ages as Array<{label:string;count:number}>;
        const byBucket = ["0-18","19-30","31-50","51-70","70+"].map(label => (ages.find(a => a.label===label)?.count ?? 0));
        setAgeSeries([{ name: "Patients", data: byBucket }]);
        const gender = res.data.gender || {F:0, M:0};
        const total = (gender.F || 0) + (gender.M || 0) || 1;
        setGenderSeries([Math.round((gender.F||0)*100/total), Math.round((gender.M||0)*100/total)]);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Démographie des patients</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Répartition par âge et genre</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Répartition par âge</h4>
          <Chart options={ageOptions} series={ageSeries} type="bar" height={200} />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Répartition par genre</h4>
          <Chart options={genderOptions} series={genderSeries} type="donut" height={200} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white/90">{(ageSeries[0]?.data || []).reduce((a:number,b:number)=>a+b,0)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total patients</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white/90">{ageSeries[0]?.data?.length ? Math.round((0*100+1*0)/1) : 0}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Âge moyen (approx)</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white/90">{genderSeries[0]}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Femmes</div>
        </div>
      </div>
    </div>
  );
} 