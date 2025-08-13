import { ReactNode } from "react";
import { useAuth } from "../../context/AuthContext";

type Props = { action: string; module: string; children: ReactNode };

export default function RequirePermission({ action, module, children }: Props) {
  const { state, hasPermission } = useAuth();
  if (state.kind === "superadmin") return <>{children}</>;
  return hasPermission(action, module) ? <>{children}</> : null;
}
