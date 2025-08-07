import LaboratoryMetrics from "../../components/laboratory/LaboratoryMetrics";
import ExamensChart from "../../components/laboratory/ExamensChart";
import StatisticsChart from "../../components/laboratory/StatisticsChart";
import StockAlerts from "../../components/laboratory/StockAlerts";
import RecentDemandes from "../../components/laboratory/RecentDemandes";
import PatientDemographics from "../../components/laboratory/PatientDemographics";
import PageMeta from "../../components/common/PageMeta";

export default function Home() {
  return (
    <>
      <PageMeta
        title="Tableau de bord | ClinLab ERP - Gestion de laboratoire"
        description="Tableau de bord principal de ClinLab ERP - Solution de gestion complète pour laboratoires médicaux"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-7">
          <LaboratoryMetrics />

          <ExamensChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <StockAlerts />
        </div>

        <div className="col-span-12">
          <StatisticsChart />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <PatientDemographics />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RecentDemandes />
        </div>
      </div>
    </>
  );
}
