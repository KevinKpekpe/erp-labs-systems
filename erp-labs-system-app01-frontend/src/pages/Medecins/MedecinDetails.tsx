import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";
import { ChevronLeftIcon, PencilIcon, UserIcon, CalenderIcon, UserCircleIcon } from "../../icons";
import { Link } from "react-router";
import { formatCDF } from "../../lib/currency";

// Interface pour un médecin
interface Medecin {
  medecin_id: number;
  code: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  contact: string;
  numero_identification: string;
}

// Interface pour une demande d'examen
interface DemandeExamen {
  demande_id: number;
  code: string;
  date_demande: string;
  statut: 'En attente' | 'En cours' | 'Terminée' | 'Annulée';
  patient_nom: string;
  patient_prenom: string;
  examens: string[];
  montant_total: number;
}

// Fonction pour calculer l'âge à partir de la date de naissance
const calculateAge = (dateNaissance: string): number => {
  const today = new Date();
  const birthDate = new Date(dateNaissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Fonction pour formater la date et l'heure
const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Données de test pour un médecin
const mockMedecin: Medecin = {
  medecin_id: 1,
  code: "MED001",
  nom: "Mwamba",
  prenom: "Pierre",
  date_naissance: "1979-05-15",
  sexe: "M",
  contact: "+243 123 456 789",
  numero_identification: "MED-2024-001"
};

// Données de test pour les demandes d'examens
const mockDemandes: DemandeExamen[] = [
  {
    demande_id: 1,
    code: "DEM001",
    date_demande: "2024-01-15T09:30:00",
    statut: "Terminée",
    patient_nom: "Kabila",
    patient_prenom: "Joseph",
    examens: ["Analyse de sang", "Test de glycémie"],
    montant_total: 25000
  },
  {
    demande_id: 2,
    code: "DEM002",
    date_demande: "2024-01-18T14:15:00",
    statut: "En cours",
    patient_nom: "Lumumba",
    patient_prenom: "Patrice",
    examens: ["Culture bactérienne", "Test COVID-19"],
    montant_total: 35000
  },
  {
    demande_id: 3,
    code: "DEM003",
    date_demande: "2024-01-20T11:00:00",
    statut: "En attente",
    patient_nom: "Mobutu",
    patient_prenom: "Marie",
    examens: ["Analyse d'urine", "Test de grossesse"],
    montant_total: 18000
  },
  {
    demande_id: 4,
    code: "DEM004",
    date_demande: "2024-01-22T16:45:00",
    statut: "Terminée",
    patient_nom: "Tshisekedi",
    patient_prenom: "Antoine",
    examens: ["Analyse de sang", "Test de cholestérol"],
    montant_total: 28000
  },
  {
    demande_id: 5,
    code: "DEM005",
    date_demande: "2024-01-25T08:30:00",
    statut: "Annulée",
    patient_nom: "Kasa-Vubu",
    patient_prenom: "Sophie",
    examens: ["Test de grossesse"],
    montant_total: 12000
  }
];

export default function MedecinDetails() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [medecin, setMedecin] = useState<Medecin | null>(null);
  const [demandes, setDemandes] = useState<DemandeExamen[]>([]);

  // Simuler le chargement des données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Charger les données du médecin et ses demandes
      setMedecin(mockMedecin);
      setDemandes(mockDemandes);
      
      setLoading(false);
    };

    loadData();
  }, [id]);

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case 'En attente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'En cours':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Terminée':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Annulée':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            <span className="text-gray-600 dark:text-gray-400">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!medecin) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Médecin non trouvé</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Le médecin demandé n'existe pas.</p>
          <Link 
            to="/medecins"
            className="mt-4 inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            Retour à la liste
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails du Médecin | ClinLab ERP</title>
        <meta name="description" content={`Détails du médecin Dr. ${medecin.nom} ${medecin.prenom} - ClinLab ERP`} />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/medecins" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Détails du Médecin
            </h2>
          </div>
          
          <Link 
            to={`/medecins/${medecin.medecin_id}/modifier`}
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Informations du médecin */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
                  <UserIcon className="h-10 w-10 text-brand-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Dr. {medecin.nom} {medecin.prenom}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {medecin.sexe === 'M' ? 'Homme' : 'Femme'} • {calculateAge(medecin.date_naissance)} ans
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserCircleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Code</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{medecin.code}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserCircleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Numéro d'Identification</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{medecin.numero_identification}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <CalenderIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Date de naissance</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(medecin.date_naissance)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                    <UserCircleIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Contact</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{medecin.contact}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Historique des demandes d'examens */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Demandes d'examens prescrites
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {demandes.length} demande{demandes.length > 1 ? 's' : ''} au total
                </p>
              </div>

              <div className="p-6">
                {demandes.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune demande</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Ce médecin n'a pas encore prescrit de demandes d'examens.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {demandes.map((demande) => (
                      <div 
                        key={demande.demande_id}
                        className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                Demande {demande.code}
                              </h4>
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(demande.statut)}`}>
                                {demande.statut}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Patient</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {demande.patient_nom} {demande.patient_prenom}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Date de demande</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatDateTime(demande.date_demande)}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Examens</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {demande.examens.join(', ')}
                                </p>
                              </div>
                              
                              <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Montant total</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                  {formatCDF(demande.montant_total)}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <Link
                            to={`/demandes/${demande.demande_id}`}
                            className="ml-4 inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
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