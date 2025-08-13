import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

type Props = {
  children: React.ReactElement;
  kind: "company" | "superadmin";
  requiredPermission?: { action: string; module: string };
};

export default function ProtectedRoute({ children, kind, requiredPermission }: Props) {
  const { state, hasPermission } = useAuth();

  if (state.loading) return null;

  if (state.kind !== kind || !state.token) {
    return <Navigate to={kind === "superadmin" ? "/superadmin" : "/signin"} replace />;
  }

  if (requiredPermission) {
    if (state.kind !== "superadmin") {
      if ((state.permissions?.length ?? 0) === 0) return <Navigate to={"/403"} replace />;
      if (!hasPermission(requiredPermission.action, requiredPermission.module)) {
        return <Navigate to={"/403"} replace />;
      }
    }
  }

  return children;
}
