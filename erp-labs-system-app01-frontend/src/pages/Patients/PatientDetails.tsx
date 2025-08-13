import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, UserIcon, PencilIcon, CalenderIcon, UserCircleIcon, MailIcon, TimeIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import { Link, useParams } from "react-router";
import { apiFetch } from "../../lib/apiClient";

type DemandeExamen = { id: number; code: string; date_demande?: string; statut_demande?: string; medecin?: { nom?: string } | null; examens?: Array<{ nom_examen?: string }>; montant_total?: number };
type Patient = { id: number; code: string; nom: string; postnom?: string | null; prenom: string; email?: string | null; date_naissance?: string; sexe?: 'M' | 'F' | string; adresse?: string; contact?: string; type?: { nom_type?: string; id?: number } | null; type_patient?: string | null };

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null; }
function extractPatient(resp: unknown): Patient | null { const root = (resp as { data?: unknown })?.data ?? resp; return isObject(root) ? (root as Patient) : null; }
function extractDemandes(resp: unknown): DemandeExamen[] { const root = (resp as { data?: unknown })?.data ?? resp; return Array.isArray(root) ? (root as DemandeExamen[]) : []; }

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [demandes, setDemandes] = useState<DemandeExamen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [pRes, dRes] = await Promise.all([
          apiFetch<unknown>(`/v1/patients/${id}`, { method: "GET" }, "company"),
          apiFetch<unknown>(`/v1/patients/${id}/exam-requests`, { method: "GET" }, "company"),
        ]);
        if (mounted) setPatient(extractPatient(pRes));
        if (mounted) setDemandes(extractDemandes(dRes));
      } catch {
        // noop
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const calculateAge = (dateString: string) => {
    if (!dateString) return "-" as unknown as number;
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const formatDate = (dateString?: string) => (dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '-');

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'Terminée':
        return <Badge color="success">Terminée</Badge>;
      case 'En cours':
        return <Badge color="warning">En cours</Badge>;
      case 'En attente':
        return <Badge color="info">En attente</Badge>;
      case 'Annulée':
        return <Badge color="error">Annulée</Badge>;
      default:
        return <Badge color="info">{status || 'N/A'}</Badge>;
    }
  };

  const getPatientTypeBadge = (p: Patient) => {
    const display = p.type?.nom_type || p.type_patient || '';
    return display === "Résident" ? <Badge color="success">Résident</Badge> : <Badge color="warning">{display || 'Ambulant'}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du patient...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Patient non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails Patient | ClinLab ERP</title>
        <meta name="description" content="Détails du patient et historique des examens - ClinLab ERP" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/patients" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Détails du Patient</h2>
          </div>
          <Link to={`/patients/${patient.id}/modifier`} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"><PencilIcon className="mr-2 h-4 w-4" />Modifier</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20"><UserCircleIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" /></div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{patient.nom} {patient.postnom || ''} {patient.prenom}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.code}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3"><UserIcon className="h-5 w-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{patient.nom} {patient.postnom || ''} {patient.prenom}</p><p className="text-xs text-gray-500 dark:text-gray-400">Nom complet</p></div></div>
                <div className="flex items-center gap-3"><CalenderIcon className="h-5 w-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{patient.date_naissance ? `${formatDate(patient.date_naissance)} (${calculateAge(patient.date_naissance)} ans)` : '-'}</p><p className="text-xs text-gray-500 dark:text-gray-400">Date de naissance</p></div></div>
                <div className="flex items-center gap-3"><UserCircleIcon className="h-5 w-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{patient.sexe === 'M' ? 'Masculin' : 'Féminin'}</p><p className="text-xs text-gray-500 dark:text-gray-400">Sexe</p></div></div>
                {patient.email && (<div className="flex items-center gap-3"><MailIcon className="h-5 w-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{patient.email}</p><p className="text-xs text-gray-500 dark:text-gray-400">Email</p></div></div>)}
                <div className="flex items-center gap-3"><TimeIcon className="h-5 w-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{patient.contact}</p><p className="text-xs text-gray-500 dark:text-gray-400">Contact</p></div></div>
                <div><p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Adresse</p><p className="text-sm text-gray-600 dark:text-gray-400">{patient.adresse}</p></div>
                <div className="flex items-center gap-3"><UserIcon className="h-5 w-5 text-gray-400" /><div><p className="text-sm font-medium text-gray-900 dark:text-white">{getPatientTypeBadge(patient)}</p><p className="text-xs text-gray-500 dark:text-gray-400">Type de patient</p></div></div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Historique des Demandes d'Examen</h3><p className="text-sm text-gray-500 dark:text-gray-400">{demandes.length} demande(s) trouvée(s)</p></div>
              <div className="p-6">
                {demandes.length === 0 ? (
                  <div className="text-center py-8"><UserIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune demande d'examen</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Ce patient n'a pas encore de demandes d'examen.</p></div>
                ) : (
                  <div className="space-y-4">
                    {demandes.map((demande) => (
                      <div key={demande.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2"><h4 className="font-medium text-gray-900 dark:text-white">{demande.code}</h4>{getStatusBadge(demande.statut_demande)}</div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div><p className="text-gray-500 dark:text-gray-400">Date de demande</p><p className="font-medium text-gray-900 dark:text-white">{demande.date_demande ? formatDate(demande.date_demande) : '-'}</p></div>
                              <div><p className="text-gray-500 dark:text-gray-400">Médecin prescripteur</p><p className="font-medium text-gray-900 dark:text-white">{demande.medecin?.nom || '-'}</p></div>
                              <div><p className="text-gray-500 dark:text-gray-400">Examens demandés</p><p className="font-medium text-gray-900 dark:text-white">{(demande.examens?.length || 0)} examen(s)</p><ul className="mt-1 text-xs text-gray-600 dark:text-gray-400">{(demande.examens || []).map((ex, index) => (<li key={index}>• {ex.nom_examen || 'Examen'}</li>))}</ul></div>
                              <div><p className="text-gray-500 dark:text-gray-400">Montant total</p><p className="font-medium text-gray-900 dark:text-white">{typeof demande.montant_total === 'number' ? demande.montant_total.toLocaleString('fr-FR') + ' FC' : '-'}</p></div>
                            </div>
                          </div>
                          <Link to={`/demandes/${demande.id}`} className="ml-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90">Voir détails</Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 