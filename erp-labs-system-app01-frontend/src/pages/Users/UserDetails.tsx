import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router";
import Alert from "../../components/ui/alert/Alert";
import { apiFetch } from "../../lib/apiClient";
import { ENV } from "../../config/env";

export default function UserDetails() {
  const { id } = useParams();
  const [user, setUser] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { const res = await apiFetch(`/v1/users/${id}`, { method: 'GET' }, 'company'); if (!mounted) return; setUser((res as any)?.data ?? res); }
      catch (e: any) { if (!mounted) return; setError(e?.message || 'Erreur'); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
  const buildPhotoUrl = (u: any): string | null => {
    const raw: string | undefined = u?.photo_url;
    if (raw && /^https?:\/\//i.test(raw)) return raw;
    if (raw && raw.startsWith("/")) return `${backendBase}${raw}`;
    if (u?.photo_de_profil) {
      // stocké sous public disk => accessible via /storage/<path>
      const path = String(u.photo_de_profil).replace(/^\/+/, "");
      return `${backendBase}/storage/${path}`;
    }
    return null;
  };

  return (
    <>
      <Helmet><title>Détails Utilisateur | ClinLab ERP</title></Helmet>
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Utilisateur {user?.code ? `#${user.code}` : ''}</h2>
          <div className="flex items-center gap-3">
            <Link to={`/users/${id}/modifier`} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">Modifier</Link>
            <Link to="/users" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Retour</Link>
          </div>
        </div>

        {error && (<div className="mb-6"><Alert variant="error" title="Erreur" message={error} /></div>)}

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Code</p>
              <p className="font-medium text-gray-900 dark:text-white">{user?.code || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Username</p>
              <p className="font-medium text-gray-900 dark:text-white">{user?.username || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
              <p className="font-medium text-gray-900 dark:text-white">{user?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Rôle</p>
              <p className="font-medium text-gray-900 dark:text-white">{(user?.roles || [])[0]?.nom_role || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Actif</p>
              <p className="font-medium text-gray-900 dark:text-white">{user?.is_active ? 'Oui' : 'Non'}</p>
            </div>
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Photo</p>
                {buildPhotoUrl(user) ? (
                  <img src={buildPhotoUrl(user) as string} alt="Photo" className="h-24 w-24 rounded-full object-cover border" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">N/A</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Permissions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {((user?.roles?.[0]?.permissions) || []).map((p: any) => (
                <div key={p.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-800 dark:text-gray-200">{p.module} — <span className="font-medium">{p.action}</span></div>
                  <div className="text-xs text-gray-500">{p.code}</div>
                </div>
              ))}
              {((user?.roles?.[0]?.permissions) || []).length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">Aucune permission</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}


