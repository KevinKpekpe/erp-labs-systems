import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Connexion | ClinLab ERP - Gestion de laboratoire"
        description="Connexion utilisateur - Accès sécurisé à ClinLab ERP pour la gestion de laboratoire hospitalier"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
