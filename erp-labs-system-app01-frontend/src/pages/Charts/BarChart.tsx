import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";

export default function BarChart() {
  const options: ApexOptions = {
    colors: ["#3B82F6", "#10B981", "#F59E0B"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        endingShape: "rounded",
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
      categories: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
    },
    yaxis: {
      title: {
        text: "Nombre",
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " unités";
        },
      },
    },
  };

  const series = [
    {
      name: "Analyses sanguines",
      data: [44, 55, 57, 56, 61, 58, 63, 60, 66, 70, 75, 80],
    },
    {
      name: "Analyses d'urine",
      data: [76, 85, 101, 98, 87, 105, 91, 114, 94, 100, 110, 120],
    },
    {
      name: "Tests spécialisés",
      data: [35, 41, 36, 26, 45, 48, 52, 53, 41, 55, 60, 65],
    },
  ];

  return (
    <>
      <PageMeta
        title="Graphiques | ClinLab ERP - Gestion de laboratoire"
        description="Graphiques et statistiques - ClinLab ERP - Solution de gestion complète pour laboratoires médicaux"
      />
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">
            Graphique en barres
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <Chart options={options} series={series} type="bar" height={350} />
        </div>
      </div>
    </>
  );
}
