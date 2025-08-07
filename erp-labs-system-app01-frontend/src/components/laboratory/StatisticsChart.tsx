import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function StatisticsChart() {
  const options: ApexOptions = {
    colors: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 300,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
              fontFamily: "Outfit",
              color: "#6B7280",
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: "20px",
              fontFamily: "Outfit",
              color: "#111827",
              offsetY: 16,
              formatter: function (val) {
                return val + "%";
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "16px",
              fontFamily: "Outfit",
              color: "#6B7280",
              formatter: function (w) {
                return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0);
              },
            },
          },
        },
      },
    },
    labels: ["Analyses sanguines", "Analyses d'urine", "Tests spécialisés", "Autres"],
    legend: {
      show: true,
      position: "bottom",
      horizontalAlign: "center",
      fontFamily: "Outfit",
      fontSize: "12px",
      markers: {
        size: 12,
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 0,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " examens";
        },
      },
    },
  };

  const series = [45, 25, 20, 10];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Répartition des examens
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Statistiques des types d'examens effectués ce mois
        </p>
      </div>

      <div className="flex items-center justify-center">
        <Chart options={options} series={series} type="donut" height={300} />
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white/90">1,247</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total examens</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800 dark:text-white/90">98.5%</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Taux de réussite</div>
        </div>
      </div>
    </div>
  );
} 