import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignInSuperAdmin from "./pages/AuthPages/SignInSuperAdmin";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Permissions from "./pages/Permissions";
import CompanyInfo from "./pages/CompanyInfo";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PatientList from "./pages/Patients/PatientList";
import AddPatient from "./pages/Patients/AddPatient";
import EditPatient from "./pages/Patients/EditPatient";
import PatientDetails from "./pages/Patients/PatientDetails";
import TypePatientList from "./pages/Patients/TypePatientList";
import AddTypePatient from "./pages/Patients/AddTypePatient";
import EditTypePatient from "./pages/Patients/EditTypePatient";
import TypePatientDetails from "./pages/Patients/TypePatientDetails";
import MedecinList from "./pages/Medecins/MedecinList";
import AddMedecin from "./pages/Medecins/AddMedecin";
import EditMedecin from "./pages/Medecins/EditMedecin";
import MedecinDetails from "./pages/Medecins/MedecinDetails";
import StocksDashboard from "./pages/Stocks/StocksDashboard";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Layout Principal - Laboratoire */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Gestion des Types de Patients */}
            <Route path="/types-patients" element={<TypePatientList />} />
            <Route path="/types-patients/nouveau" element={<AddTypePatient />} />
            <Route path="/types-patients/:id" element={<TypePatientDetails />} />
            <Route path="/types-patients/:id/modifier" element={<EditTypePatient />} />

            {/* Gestion des Patients */}
            <Route path="/patients" element={<PatientList />} />
            <Route path="/patients/nouveau" element={<AddPatient />} />
            <Route path="/patients/:id" element={<PatientDetails />} />
            <Route path="/patients/:id/modifier" element={<EditPatient />} />

            {/* Gestion des Médecins */}
            <Route path="/medecins" element={<MedecinList />} />
            <Route path="/medecins/nouveau" element={<AddMedecin />} />
            <Route path="/medecins/:id" element={<MedecinDetails />} />
            <Route path="/medecins/:id/modifier" element={<EditMedecin />} />

            {/* Gestion des Stocks */}
            <Route path="/stocks" element={<StocksDashboard />} />

            {/* Profile & Administration */}
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/permissions" element={<Permissions />} />
            <Route path="/company-info" element={<CompanyInfo />} />

            {/* Others Page */}
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/superadmin" element={<SignInSuperAdmin />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
