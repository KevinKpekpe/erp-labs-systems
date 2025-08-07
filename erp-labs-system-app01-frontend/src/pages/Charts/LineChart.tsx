import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import PageMeta from "../../components/common/PageMeta";

export default function LineChart() {
  const options: ApexOptions = {
    colors: ["#3B82F6", "#10B981"],
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "line",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
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
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
  };

  const series = [
    {
      name: "Examens",
      data: [31, 40, 28, 51, 42, 109, 100, 120, 80, 95, 110, 85],
    },
    {
      name: "Patients",
      data: [11, 32, 45, 32, 34, 52, 41, 80, 96, 54, 67, 45],
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
            Graphique en ligne
          </h2>
        </div>

        <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
          <Chart options={options} series={series} type="line" height={350} />
        </div>
      </div>
    </>
  );
}
