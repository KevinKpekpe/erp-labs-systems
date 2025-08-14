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
  statut: "En attente" | "En cours" | "Terminée" | "Annulée" | string;
}

type BadgeColor = "success" | "warning" | "info" | "error" | "light";

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }

function mapRow(raw: Record<string, unknown>): DemandeExamen {
  // Format 1: Dashboard recent-requests (déjà aplati par le backend)
  const directPatientName = (raw.patientName as string) ?? null;
  const directType = (raw.typeExamen as string) ?? null;
  const directMedecin = (raw.medecin as string) ?? null;
  const directDate = (raw.dateDemande as string) ?? null;
  const directStatut = (raw.statut as string) ?? null;

  if (directPatientName || directType || directMedecin || directDate || directStatut) {
    return {
      id: Number(raw.id ?? 0),
      patientName: String(directPatientName ?? ""),
      patientCode: String((raw.patientCode as string) ?? ""),
      typeExamen: String(directType ?? ""),
      medecin: String(directMedecin ?? ""),
      dateDemande: String(directDate ?? ""),
      statut: String(directStatut ?? ""),
    };
  }

  // Format 2: exam-requests (objet patient/medecin, snake_case)
  const patient = isObject(raw.patient) ? (raw.patient as Record<string, unknown>) : undefined;
  const medecin = isObject(raw.medecin) ? (raw.medecin as Record<string, unknown>) : undefined;
  const patientName = `${String(patient?.nom ?? "")} ${String(patient?.postnom ?? "")} ${String(patient?.prenom ?? "")}`.trim();
  const medecinName = `${String(medecin?.nom ?? "")} ${String(medecin?.prenom ?? "")}`.trim();

  return {
    id: Number(raw.id ?? 0),
    patientName,
    patientCode: String(patient?.code ?? ""),
    typeExamen: "", // non disponible dans ce listing sans charger les détails
    medecin: medecinName,
    dateDemande: String((raw.date_demande as string) ?? ""),
    statut: String((raw.statut_demande as string) ?? ""),
  };
}

function extractRows(resp: unknown): DemandeExamen[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  const arr = isObject(root) && Array.isArray((root as Record<string, unknown>).data) ? (root as Record<string, unknown>).data as unknown[] : Array.isArray(root) ? (root as unknown[]) : [];
  return arr.filter(isObject).map((raw) => mapRow(raw as Record<string, unknown>));
}

export default function RecentDemandes() {
  const [rows, setRows] = useState<DemandeExamen[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        // Endpoint privilégié: aplati et prêt à afficher
        const res = await apiFetch<unknown>("/v1/dashboard/recent-requests?limit=10", { method: "GET" }, "company");
        if (!mounted) return;
        const parsed = extractRows(res);
        if (parsed.length > 0) {
          setRows(parsed);
          return;
        }
        // Fallback vers listing exam-requests si besoin
        const res2 = await apiFetch<unknown>("/v1/exam-requests?per_page=10", { method: "GET" }, "company");
        if (!mounted) return;
        setRows(extractRows(res2));
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

  const safeDate = (d: string) => {
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? "-" : dt.toLocaleDateString();
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Demandes d'examens récentes</h3>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">Filtrer</button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">Voir tout</button>
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
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">{demande.patientName || "-"}</p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">{demande.patientCode || ""}</span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{demande.typeExamen || "-"}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{demande.medecin || "-"}</TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400"><Badge size="sm" color={getStatutColor(demande.statut)}>{demande.statut}</Badge></TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">{safeDate(demande.dateDemande)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 