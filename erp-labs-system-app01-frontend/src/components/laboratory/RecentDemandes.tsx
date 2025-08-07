import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";

// Define the TypeScript interface for the table rows
interface DemandeExamen {
  id: number;
  patientName: string;
  patientCode: string;
  typeExamen: string;
  medecin: string;
  dateDemande: string;
  statut: "En attente" | "En cours" | "Terminée" | "Annulée";
  priorite: "Normale" | "Urgente" | "Critique";
}

// Define the table data using the interface
const tableData: DemandeExamen[] = [
  {
    id: 1,
    patientName: "Jean Dupont",
    patientCode: "PAT-2024-001",
    typeExamen: "Numération formule sanguine",
    medecin: "Dr. Martin",
    dateDemande: "2024-01-15",
    statut: "Terminée",
    priorite: "Normale",
  },
  {
    id: 2,
    patientName: "Marie Dubois",
    patientCode: "PAT-2024-002",
    typeExamen: "Glycémie à jeun",
    medecin: "Dr. Bernard",
    dateDemande: "2024-01-15",
    statut: "En cours",
    priorite: "Urgente",
  },
  {
    id: 3,
    patientName: "Pierre Durand",
    patientCode: "PAT-2024-003",
    typeExamen: "Analyse d'urine complète",
    medecin: "Dr. Petit",
    dateDemande: "2024-01-15",
    statut: "En attente",
    priorite: "Normale",
  },
  {
    id: 4,
    patientName: "Sophie Moreau",
    patientCode: "PAT-2024-004",
    typeExamen: "Troponine cardiaque",
    medecin: "Dr. Roux",
    dateDemande: "2024-01-15",
    statut: "En cours",
    priorite: "Critique",
  },
  {
    id: 5,
    patientName: "Lucas Leroy",
    patientCode: "PAT-2024-005",
    typeExamen: "Bilan lipidique",
    medecin: "Dr. Simon",
    dateDemande: "2024-01-15",
    statut: "Terminée",
    priorite: "Normale",
  },
];

export default function RecentDemandes() {
  const getStatutColor = (statut: string) => {
    switch (statut) {
      case "Terminée":
        return "success";
      case "En cours":
        return "warning";
      case "En attente":
        return "info";
      case "Annulée":
        return "error";
      default:
        return "default";
    }
  };

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case "Critique":
        return "error";
      case "Urgente":
        return "warning";
      case "Normale":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Demandes d'examens récentes
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            <svg
              className="stroke-current fill-white dark:fill-gray-800"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2.29004 5.90393H17.7067"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M17.7075 14.0961H2.29085"
                stroke=""
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12.0826 3.33331C13.5024 3.33331 14.6534 4.48431 14.6534 5.90414C14.6534 7.32398 13.5024 8.47498 12.0826 8.47498C10.6627 8.47498 9.51172 7.32398 9.51172 5.90415C9.51172 4.48432 10.6627 3.33331 12.0826 3.33331Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
              <path
                d="M7.91745 11.525C6.49762 11.525 5.34662 12.676 5.34662 14.0959C5.34661 15.5157 6.49762 16.6667 7.91745 16.6667C9.33728 16.6667 10.4883 15.5157 10.4883 14.0959C10.4883 12.676 9.33728 11.525 7.91745 11.525Z"
                fill=""
                stroke=""
                strokeWidth="1.5"
              />
            </svg>
            Filtrer
          </button>
          <button className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200">
            Voir tout
          </button>
        </div>
      </div>
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
            <TableRow>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Patient
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Examen
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Médecin
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Statut
              </TableCell>
              <TableCell
                isHeader
                className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
              >
                Priorité
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
            {tableData.map((demande) => (
              <TableRow key={demande.id} className="">
                <TableCell className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-[50px] w-[50px] overflow-hidden rounded-md bg-blue-100 flex items-center justify-center">
                      <svg className="text-blue-600 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                        {demande.patientName}
                      </p>
                      <span className="text-gray-500 text-theme-xs dark:text-gray-400">
                        {demande.patientCode}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {demande.typeExamen}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  {demande.medecin}
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={getStatutColor(demande.statut) as any}
                  >
                    {demande.statut}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                  <Badge
                    size="sm"
                    color={getPrioriteColor(demande.priorite) as any}
                  >
                    {demande.priorite}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 