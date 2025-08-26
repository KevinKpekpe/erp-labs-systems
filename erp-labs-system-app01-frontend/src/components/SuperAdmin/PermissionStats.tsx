import { useEffect, useState } from "react";
import { LockIcon, LockIcon as KeyIcon, PlugInIcon } from "../../icons";
import { apiFetch } from "../../lib/apiClient";

interface PermissionStats {
  total: number;
  modules: { [key: string]: number };
  actions: { [key: string]: number };
}

export default function PermissionStats() {
  const [data, setData] = useState<PermissionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await apiFetch<any>("/v1/superadmin/permissions", { method: "GET" }, "superadmin");
        if (mounted) {
          const permissions = res.data || [];
          
          // Compter par module
          const modules: { [key: string]: number } = {};
          const actions: { [key: string]: number } = {};
          
          permissions.forEach((perm: any) => {
            modules[perm.module] = (modules[perm.module] || 0) + 1;
            actions[perm.action] = (actions[perm.action] || 0) + 1;
          });
          
          setData({
            total: permissions.length,
            modules,
            actions
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des permissions:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getTopModules = () => {
    if (!data) return [];
    return Object.entries(data.modules)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  const getTopActions = () => {
    if (!data) return [];
    return Object.entries(data.actions)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Statistiques des Permissions</h3>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-32 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-24 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
          <div className="h-4 w-28 bg-gray-200 rounded dark:bg-gray-700 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Statistiques des Permissions</h3>
        <div className="flex items-center space-x-2">
          <LockIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {data?.total || 0}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <KeyIcon className="w-4 h-4 mr-2" />
            Top Modules
          </h4>
          <div className="space-y-2">
            {getTopModules().map(([module, count]) => (
              <div key={module} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {module.toLowerCase().replace('_', ' ')}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
            <PlugInIcon className="w-4 h-4 mr-2" />
            Top Actions
          </h4>
          <div className="space-y-2">
            {getTopActions().map(([action, count]) => (
              <div key={action} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                  {action.toLowerCase()}
                </span>
                <span className="text-sm font-medium text-gray-800 dark:text-white">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total des permissions système configurées
          </p>
        </div>
      </div>
    </div>
  );
}
