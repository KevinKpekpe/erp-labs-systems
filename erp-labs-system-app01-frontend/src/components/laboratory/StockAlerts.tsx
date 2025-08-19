import { useEffect, useMemo, useState } from "react";
import Badge from "../ui/badge/Badge";
import { apiFetch } from "../../lib/apiClient";

interface ApiStockAlert {
  id: number | string;
  stock?: { id: number; article?: { id: number; nom_article: string } };
  quantite_actuelle?: number | string | null;
  seuil_critique?: number | string | null;
  date_alerte?: string;
  message_alerte?: string;
}

export default function StockAlerts() {
  const [alerts, setAlerts] = useState<ApiStockAlert[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>("Tous");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Try computed alerts
        const res1 = await apiFetch<any>("/v1/stock/alerts?per_page=5&compute=1", { method: "GET" }, "company");
        const items1: ApiStockAlert[] = res1.data?.data || res1.data || [];
        if (mounted && items1.length > 0) { setAlerts(items1); return; }
        // Fallback to stored alerts
        const res2 = await apiFetch<any>("/v1/stock/alerts?per_page=5", { method: "GET" }, "company");
        const items2: ApiStockAlert[] = res2.data?.data || [];
        if (mounted) setAlerts(items2);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const mapped = useMemo(() => alerts.map(a => {
    const qRaw = Number(a.quantite_actuelle ?? 0);
    const seuilRaw = Number(a.seuil_critique ?? 0);
    const quantiteActuelle = Number.isFinite(qRaw) ? qRaw : 0;
    const seuilCritique = Number.isFinite(seuilRaw) ? seuilRaw : 0;
    let priorite: "Critique" | "Urgente" | "Normale" = "Normale";
    if (seuilCritique > 0) {
      priorite = quantiteActuelle <= seuilCritique / 2 ? "Critique" : (quantiteActuelle <= seuilCritique ? "Urgente" : "Normale");
    }
    return {
      id: a.id as any,
      articleName: a.stock?.article?.nom_article || a.message_alerte || "Article",
      quantiteActuelle,
      seuilCritique,
      unite: "",
      dateAlerte: a.date_alerte || "",
      priorite,
    };
  }), [alerts]);

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case "Critique": return "error";
      case "Urgente": return "warning";
      case "Normale": return "info";
      default: return "light";
    }
  };

  const getPrioriteIcon = (priorite: string) => {
    switch (priorite) {
      case "Critique": return (<svg className="text-red-600 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>);
      case "Urgente": return (<svg className="text-yellow-600 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>);
      case "Normale": return (<svg className="text-blue-600 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>);
      default: return null;
    }
  };

  const filteredAlerts = selectedFilter === "Tous" ? mapped : mapped.filter(a => a.priorite === selectedFilter);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Alertes de stock</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Articles nécessitant une commande</p>
        </div>
        <Badge color="error" size="sm">{mapped.length} alertes</Badge>
      </div>

      <div className="flex gap-2 mb-4">
        {["Tous", "Critique", "Urgente", "Normale"].map((filter) => (
          <button key={filter} onClick={() => setSelectedFilter(filter)} className={`px-3 py-1 text-xs rounded-full border transition-colors ${selectedFilter === filter ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800" : "bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"}`}>
            {filter}
          </button>
        ))}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {filteredAlerts.map((alert) => (
          <div key={alert.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex-shrink-0">{getPrioriteIcon(alert.priorite)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">{alert.articleName}</h4>
                <Badge color={getPrioriteColor(alert.priorite) as any} size="sm">{alert.priorite}</Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>Stock: {alert.quantiteActuelle}</span>
                <span>Seuil: {alert.seuilCritique}</span>
              </div>
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-gray-500 dark:text-gray-400">Niveau de stock</span>
                  <span className="text-gray-700 dark:text-gray-300">{Math.round((alert.quantiteActuelle / (alert.seuilCritique || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5 dark:bg-gray-700">
                  <div className={`h-1.5 rounded-full ${alert.priorite === "Critique" ? "bg-red-500" : alert.priorite === "Urgente" ? "bg-yellow-500" : "bg-blue-500"}`} style={{ width: `${Math.min((alert.quantiteActuelle / (alert.seuilCritique || 1)) * 100, 100)}%` }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
        <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 transition-colors">
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
          Commander les articles
        </button>
      </div>
    </div>
  );
} 