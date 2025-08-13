import { Table, TableBody, TableCell, TableHeader, TableRow } from "../ui/table";
import Badge from "../ui/badge/Badge";
import { useEffect, useState } from "react";
import { apiFetch } from "../../lib/apiClient";

interface DemandeExamen {
  id: number;
  patientName: string;
  patientCode: string;
  typeExamen: string;
  medecin: string;
  dateDemande: string;
  statut: "En attente" | "En cours" | "Terminée" | "Annulée";
}

type BadgeColor = "success" | "warning" | "info" | "error" | "light";

export default function RecentDemandes() {
  const [rows, setRows] = useState<DemandeExamen[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch<{ data: DemandeExamen[] }>("/v1/dashboard/recent-requests?limit=10", { method: "GET" }, "company");
        if (mounted) setRows(res.data as unknown as DemandeExamen[]);
      } catch {
        // noop
      }
    })();
    return () => { mounted = false; };
  }, []);

  const getStatutColor = (statut: string): BadgeColor => {
    switch (statut) {
      case "Terminée": return "success";
      case "En cours": return "warning";
      case "En attente": return "info";
      case "Annulée": return "error";
      default: return "light";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Demandes d'examens récentes</h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Filtrer
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Voir tout
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Patient</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Examen</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Médecin</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Statut</TableCell>
              <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Date</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {rows.map((demande) => (
              <TableRow key={demande.id}>
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[40px] w-[40px] overflow-hidden rounded-md bg-blue-100 flex items-center justify-center">
                      <svg className="text-blue-600 size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{demande.patientName}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{demande.patientCode}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{demande.typeExamen}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{demande.medecin}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"><Badge size="sm" color={getStatutColor(demande.statut)}>{demande.statut}</Badge></TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{new Date(demande.dateDemande).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 