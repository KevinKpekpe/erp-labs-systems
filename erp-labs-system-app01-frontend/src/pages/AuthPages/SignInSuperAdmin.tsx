import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInSuperAdminForm from "../../components/auth/SignInSuperAdminForm";

export default function SignInSuperAdmin() {
  return (
    <>
      <PageMeta
        title="Super Admin | ClinLab ERP - Gestion de laboratoire"
        description="Connexion Super Administrateur - Accès système pour la gestion multi-tenancy ClinLab ERP"
      />
      <AuthLayout>
        <SignInSuperAdminForm />
      </AuthLayout>
    </>
  );
} 