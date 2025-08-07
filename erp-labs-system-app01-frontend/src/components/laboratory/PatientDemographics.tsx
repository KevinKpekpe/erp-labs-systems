import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function PatientDemographics() {
  const ageOptions: ApexOptions = {
    colors: ["#3B82F6", "#10B981", "#F59E0B", "#EF4444"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 200,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "60%",
        borderRadius: 4,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ["transparent"],
    },
    xaxis: {
      categories: ["0-18", "19-30", "31-50", "51-70", "70+"],
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        text: "Nombre de patients",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " patients";
        },
      },
    },
  };

  const genderOptions: ApexOptions = {
    colors: ["#EC4899", "#3B82F6"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      height: 200,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              fontFamily: "Outfit",
              color: "#6B7280",
            },
            value: {
              show: true,
              fontSize: "16px",
              fontFamily: "Outfit",
              color: "#111827",
              formatter: function (val) {
                return val + "%";
              },
            },
          },
        },
      },
    },
    labels: ["Femmes", "Hommes"],
    legend: {
      show: false,
    },
    dataLabels: {
      enabled: false,
    },
  };

  const ageSeries = [
    {
      name: "Patients",
      data: [45, 78, 92, 67, 34],
    },
  ];

  const genderSeries = [58, 42];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Démographie des patients
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Répartition par âge et genre
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Répartition par âge */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Répartition par âge
          </h4>
          <Chart options={ageOptions} series={ageSeries} type="bar" height={200} />
        </div>

        {/* Répartition par genre */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Répartition par genre
          </h4>
          <Chart options={genderOptions} series={genderSeries} type="donut" height={200} />
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white/90">316</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Total patients</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white/90">42.3</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Âge moyen</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gray-800 dark:text-white/90">58%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Femmes</div>
        </div>
      </div>
    </div>
  );
} 