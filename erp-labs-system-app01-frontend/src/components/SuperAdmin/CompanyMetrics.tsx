import { useEffect, useState } from "react";
import { CompanyIcon, CheckCircleIcon, AlertIcon } from "../../icons";
import { apiFetch } from "../../lib/apiClient";

interface CompanyMetrics {
  total: number;
  active: number;
  inactive: number;
}

export default function CompanyMetrics() {
  const [data, setData] = useState<CompanyMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch<any>("/v1/superadmin/companies", { method: "GET" }, "superadmin");
        if (mounted) {
          const companies = res.data || [];
          const active = companies.filter((c: any) => c.deleted_at === null).length;
          const inactive = companies.filter((c: any) => c.deleted_at !== null).length;
          setData({
            total: companies.length,
            active,
            inactive
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des métriques:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const skeleton = (
    <div className="h-6 w-16 bg-gray-200 rounded dark:bg-gray-800 animate-pulse" />
  );

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
              <div className="w-6 h-6 bg-gray-300 rounded dark:bg-gray-600 animate-pulse" />
            </div>
            <div className="mt-5">
              <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-800 animate-pulse mb-2" />
              <div className="h-6 w-16 bg-gray-200 rounded dark:bg-gray-800 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-900/20">
          <CompanyIcon className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Total des Compagnies</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {data ? data.total : skeleton}
          </h4>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-900/20">
          <CheckCircleIcon className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Compagnies Actives</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {data ? data.active : skeleton}
          </h4>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl dark:bg-red-900/20">
          <AlertIcon className="text-red-600 size-6 dark:text-red-400" />
        </div>
        <div className="mt-5">
          <span className="text-sm text-gray-500 dark:text-gray-400">Compagnies Inactives</span>
          <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
            {data ? data.inactive : skeleton}
          </h4>
        </div>
      </div>
    </div>
  );
}
