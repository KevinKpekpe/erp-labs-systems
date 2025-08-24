import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignInSuperAdmin from "./pages/AuthPages/SignInSuperAdmin";
import NotFound from "./pages/OtherPage/NotFound";
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
import { CategoryArticleCreate, CategoryArticleEdit, LaboratoryCategoryList } from "./pages/Stocks/categoryArticle";
import { ArticleList, ArticleCreate, ArticleEdit } from "./pages/Stocks/articles";
import { StockList, StockCreate, StockEdit, LaboratoryStockCreate } from "./pages/Stocks/stocks";
import { StockLotsList, StockLotCreate, StockConsume, FifoDashboard, StockLotsTrashed, ExpiredLotsManagement } from "./pages/Stocks/lots";
import { MovementList } from "./pages/Stocks/movements";
import { AlertsManagement } from "./pages/Stocks/alerts";
import LaboratoryStockDashboard from "./pages/Stocks/LaboratoryStockDashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import SuperAdminHome from "./pages/SuperAdmin/Home";
import MustChangePassword from "./pages/AuthPages/MustChangePassword";
import UserProfiles from "./pages/UserProfiles";
import Forbidden from "./pages/OtherPage/Forbidden";
import ServerError from "./pages/OtherPage/ServerError";
import { ExamList, ExamCreate, ExamEdit, ExamDetails } from "./pages/Examens";
import { DemandeList, DemandeCreate, DemandeDetails, DemandeEdit } from "./pages/Demandes";
import { InvoicesList, InvoiceDetails, PaymentsList, BillingDashboard } from "./pages";


function CompanyGuard({ children }: { children: React.ReactElement }) {
  const { state } = useAuth();
  if (state.loading) return null;
  if (state.kind !== "company" || !state.token) return <Navigate to="/signin" replace />;
  if (state.user?.must_change_password) return <Navigate to="/must-change-password" replace />;
  return children;
}

function AuthOnlyWhenLoggedOut({ children }: { children: React.ReactElement }) {
  const { state } = useAuth();
  if (state.loading) return null;
  if (state.token) {
    return state.kind === "superadmin" ? <Navigate to="/superadmin/home" replace /> : <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <AuthProvider>
          <Routes>
            {/* Layout Principal - Laboratoire (protégé Company) */}
            <Route element={
              <ProtectedRoute kind="company">
                <CompanyGuard>
                  <AppLayout />
                </CompanyGuard>
              </ProtectedRoute>
            }>
              <Route index path="/" element={<Home />} />

              {/* Gestion des Types de Patients */}
              <Route path="/types-patients" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "PATIENT" }}><TypePatientList /></ProtectedRoute>} />
              <Route path="/types-patients/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "PATIENT" }}><AddTypePatient /></ProtectedRoute>} />
              <Route path="/types-patients/:id" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "PATIENT" }}><TypePatientDetails /></ProtectedRoute>} />
              <Route path="/types-patients/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "PATIENT" }}><EditTypePatient /></ProtectedRoute>} />

              {/* Gestion des Patients */}
              <Route path="/patients" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "PATIENT" }}><PatientList /></ProtectedRoute>} />
              <Route path="/patients/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "PATIENT" }}><AddPatient /></ProtectedRoute>} />
              <Route path="/patients/:id" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "PATIENT" }}><PatientDetails /></ProtectedRoute>} />
              <Route path="/patients/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "PATIENT" }}><EditPatient /></ProtectedRoute>} />

              {/* Gestion des Médecins */}
              <Route path="/medecins" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "MEDECIN" }}><MedecinList /></ProtectedRoute>} />
              <Route path="/medecins/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "MEDECIN" }}><AddMedecin /></ProtectedRoute>} />
              <Route path="/medecins/:id" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "MEDECIN" }}><MedecinDetails /></ProtectedRoute>} />
              <Route path="/medecins/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "MEDECIN" }}><EditMedecin /></ProtectedRoute>} />

              {/* Gestion des Examens */}
              <Route path="/examens" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "EXAMEN" }}><ExamList /></ProtectedRoute>} />
              <Route path="/examens/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "EXAMEN" }}><ExamCreate /></ProtectedRoute>} />
              <Route path="/examens/:id" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "EXAMEN" }}><ExamDetails /></ProtectedRoute>} />
              <Route path="/examens/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "EXAMEN" }}><ExamEdit /></ProtectedRoute>} />

              {/* Gestion des Stocks */}
              {/* Demandes d'examens */}
              <Route path="/demandes" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "DEMANDE_EXAMEN" }}><DemandeList /></ProtectedRoute>} />
              <Route path="/demandes/nouvelle" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "DEMANDE_EXAMEN" }}><DemandeCreate /></ProtectedRoute>} />
              <Route path="/demandes/:id" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "DEMANDE_EXAMEN" }}><DemandeDetails /></ProtectedRoute>} />
              <Route path="/demandes/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "DEMANDE_EXAMEN" }}><DemandeEdit /></ProtectedRoute>} />
              <Route path="/stocks" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><StocksDashboard /></ProtectedRoute>} />
              <Route path="/stocks/laboratory" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><LaboratoryStockDashboard /></ProtectedRoute>} />
              <Route path="/stocks/categories" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><LaboratoryCategoryList /></ProtectedRoute>} />
              <Route path="/stocks/categories/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "STOCK" }}><CategoryArticleCreate /></ProtectedRoute>} />
              <Route path="/stocks/categories/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "STOCK" }}><CategoryArticleEdit /></ProtectedRoute>} />

              <Route path="/stocks/articles" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><ArticleList /></ProtectedRoute>} />
              <Route path="/stocks/articles/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "STOCK" }}><ArticleCreate /></ProtectedRoute>} />
              <Route path="/stocks/articles/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "STOCK" }}><ArticleEdit /></ProtectedRoute>} />

              <Route path="/stocks/stocks" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><StockList /></ProtectedRoute>} />
              <Route path="/stocks/stocks/nouveau" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "STOCK" }}><StockCreate /></ProtectedRoute>} />
              <Route path="/stocks/stocks/laboratory/new" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "STOCK" }}><LaboratoryStockCreate /></ProtectedRoute>} />
              <Route path="/stocks/stocks/:id/modifier" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "STOCK" }}><StockEdit /></ProtectedRoute>} />

              
              {/* Nouvelles routes FIFO */}
              <Route path="/stocks/lots/dashboard" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><FifoDashboard /></ProtectedRoute>} />
              <Route path="/stocks/lots-trashed" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><StockLotsTrashed /></ProtectedRoute>} />
              <Route path="/stocks/stocks/:stockId/lots" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><StockLotsList /></ProtectedRoute>} />
              <Route path="/stocks/stocks/:stockId/add-lot" element={<ProtectedRoute kind="company" requiredPermission={{ action: "CREATE", module: "STOCK" }}><StockLotCreate /></ProtectedRoute>} />
              <Route path="/stocks/stocks/:stockId/consume" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "STOCK" }}><StockConsume /></ProtectedRoute>} />
              
              {/* Nouvelles pages complètes */}
              <Route path="/stocks/mouvements" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><MovementList /></ProtectedRoute>} />
              <Route path="/stocks/alertes" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><AlertsManagement /></ProtectedRoute>} />
              <Route path="/stocks/lots/expired" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "STOCK" }}><ExpiredLotsManagement /></ProtectedRoute>} />

              {/* Facturation */}
              <Route path="/factures" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "FACTURE" }}><InvoicesList /></ProtectedRoute>} />
              <Route path="/factures/:id" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "FACTURE" }}><InvoiceDetails /></ProtectedRoute>} />
              <Route path="/factures/paiements" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "PAIEMENT" }}><PaymentsList /></ProtectedRoute>} />
              <Route path="/factures/dashboard" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "FACTURE" }}><BillingDashboard /></ProtectedRoute>} />

              {/* Profile & Administration */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/permissions" element={<ProtectedRoute kind="company" requiredPermission={{ action: "LIST", module: "ROLE" }}><Permissions /></ProtectedRoute>} />
              <Route path="/company-info" element={<ProtectedRoute kind="company" requiredPermission={{ action: "UPDATE", module: "COMPANY" }}><CompanyInfo /></ProtectedRoute>} />

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

            {/* Espace SuperAdmin (protégé SuperAdmin) */}
            <Route element={
              <ProtectedRoute kind="superadmin">
                <SuperAdminHome />
              </ProtectedRoute>
            }>
              <Route path="/superadmin/home" element={<SuperAdminHome />} />
            </Route>

            {/* Auth Layout protégées pour invités seulement */}
            <Route path="/signin" element={<AuthOnlyWhenLoggedOut><SignIn /></AuthOnlyWhenLoggedOut>} />
            <Route path="/superadmin" element={<AuthOnlyWhenLoggedOut><SignInSuperAdmin /></AuthOnlyWhenLoggedOut>} />
            <Route path="/must-change-password" element={<MustChangePassword />} />
            <Route path="/403" element={<Forbidden />} />
            <Route path="/500" element={<ServerError />} />

            {/* Fallback Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </Router>
    </>
  );
}
