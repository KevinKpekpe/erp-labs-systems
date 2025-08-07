import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, UserIcon, PencilIcon, CalenderIcon, UserCircleIcon, MailIcon, TimeIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import { Link, useParams } from "react-router";

// Interface pour une demande d'examen
interface DemandeExamen {
  demande_id: number;
  code: string;
  date_demande: string;
  statut: 'En attente' | 'En cours' | 'Terminée' | 'Annulée';
  medecin_prescripteur: string;
  examens: string[];
  montant_total: number;
}

// Interface pour un patient
interface Patient {
  patient_id: number;
  code: string;
  nom: string;
  postnom?: string;
  prenom: string;
  email?: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  adresse: string;
  contact: string;
  type_patient: string;
  medecin_resident?: string;
}

// Données de test pour un patient
const mockPatient: Patient = {
  patient_id: 1,
  code: "PAT001",
  nom: "Mukendi",
  postnom: "Kazadi",
  prenom: "Jean",
  email: "jean.mukendi@email.com",
  date_naissance: "1985-03-15",
  sexe: "M",
  adresse: "123 Avenue de la Paix, Kinshasa",
  contact: "+243 123 456 789",
  type_patient: "Résident",
  medecin_resident: "Dr. Mwamba Pierre"
};

// Données de test pour les demandes d'examen
const mockDemandes: DemandeExamen[] = [
  {
    demande_id: 1,
    code: "DEM001",
    date_demande: "2024-01-15",
    statut: "Terminée",
    medecin_prescripteur: "Dr. Mwamba Pierre",
    examens: ["Numération formule sanguine", "Glycémie à jeun"],
    montant_total: 25000
  },
  {
    demande_id: 2,
    code: "DEM002",
    date_demande: "2024-01-20",
    statut: "En cours",
    medecin_prescripteur: "Dr. Tshisekedi Antoine",
    examens: ["Test de grossesse", "Groupe sanguin"],
    montant_total: 18000
  },
  {
    demande_id: 3,
    code: "DEM003",
    date_demande: "2024-01-25",
    statut: "En attente",
    medecin_prescripteur: "Dr. Kasa-Vubu Joseph",
    examens: ["Culture bactérienne", "Antibiogramme"],
    montant_total: 35000
  }
];

export default function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [demandes, setDemandes] = useState<DemandeExamen[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données du patient
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      setPatient(mockPatient);
      setDemandes(mockDemandes);
      setIsLoading(false);
    }, 500);
  }, [id]);

  // Fonction pour calculer l'âge
  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Fonction pour obtenir le badge de statut
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Terminée':
        return <Badge color="success">{status}</Badge>;
      case 'En cours':
        return <Badge color="warning">{status}</Badge>;
      case 'En attente':
        return <Badge color="info">{status}</Badge>;
      case 'Annulée':
        return <Badge color="error">{status}</Badge>;
      default:
        return <Badge color="info">{status}</Badge>;
    }
  };

  // Fonction pour obtenir le badge de type de patient
  const getPatientTypeBadge = (type: string) => {
    return type === "Résident" ? (
      <Badge color="success">Résident</Badge>
    ) : (
      <Badge color="warning">Ambulant</Badge>
    );
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
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/patients" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Détails du Patient
            </h2>
          </div>
          
          <Link
            to={`/patients/${patient.patient_id}/modifier`}
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Informations du patient */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
                  <UserCircleIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {patient.nom} {patient.postnom && patient.postnom} {patient.prenom}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{patient.code}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.nom} {patient.postnom && patient.postnom} {patient.prenom}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nom complet</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalenderIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(patient.date_naissance)} ({calculateAge(patient.date_naissance)} ans)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Date de naissance</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <UserCircleIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.sexe === 'M' ? 'Masculin' : 'Féminin'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Sexe</p>
                  </div>
                </div>

                {patient.email && (
                  <div className="flex items-center gap-3">
                    <MailIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {patient.email}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <TimeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {patient.contact}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Contact</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Adresse
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {patient.adresse}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getPatientTypeBadge(patient.type_patient)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Type de patient</p>
                  </div>
                </div>

                {patient.medecin_resident && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Médecin résident
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {patient.medecin_resident}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Historique des demandes d'examen */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Historique des Demandes d'Examen
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {demandes.length} demande(s) trouvée(s)
                </p>
              </div>

              <div className="p-6">
                {demandes.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      Aucune demande d'examen
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Ce patient n'a pas encore de demandes d'examen.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {demandes.map((demande) => (
                      <div
                        key={demande.demande_id}
                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {demande.code}
                              </h4>
                              {getStatusBadge(demande.statut)}
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Date de demande</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {formatDate(demande.date_demande)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Médecin prescripteur</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {demande.medecin_prescripteur}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Examens demandés</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {demande.examens.length} examen(s)
                                </p>
                                <ul className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                  {demande.examens.map((examen, index) => (
                                    <li key={index}>• {examen}</li>
                                  ))}
                                </ul>
                              </div>
                              
                              <div>
                                <p className="text-gray-500 dark:text-gray-400">Montant total</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {demande.montant_total.toLocaleString('fr-FR')} FC
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to={`/demandes/${demande.demande_id}`}
                            className="ml-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-3 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                          >
                            Voir détails
                          </Link>
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