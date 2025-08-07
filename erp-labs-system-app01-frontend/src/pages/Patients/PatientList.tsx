import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { UserIcon, PlusIcon, UserCircleIcon, PencilIcon, TrashBinIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/Modal";
import { Link } from "react-router";

// Interface pour un patient basée sur votre base de données
interface Patient {
  patient_id: number;
  code: string;
  nom: string;
  postnom?: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F';
  adresse: string;
  contact: string;
  type_patient: string;
  medecin_resident?: string;
}

// Données de test basées sur votre structure de base de données
const mockPatients: Patient[] = [
  {
    patient_id: 1,
    code: "PAT001",
    nom: "Mukendi",
    postnom: "Kazadi",
    prenom: "Jean",
    date_naissance: "1985-03-15",
    sexe: "M",
    adresse: "123 Avenue de la Paix, Kinshasa",
    contact: "+243 123 456 789",
    type_patient: "Résident",
    medecin_resident: "Dr. Mwamba Pierre"
  },
  {
    patient_id: 2,
    code: "PAT002",
    nom: "Lumumba",
    prenom: "Marie",
    date_naissance: "1992-07-22",
    sexe: "F",
    adresse: "456 Boulevard du 30 Juin, Kinshasa",
    contact: "+243 987 654 321",
    type_patient: "Ambulant"
  },
  {
    patient_id: 3,
    code: "PAT003",
    nom: "Kabila",
    postnom: "Mpongo",
    prenom: "Paul",
    date_naissance: "1978-11-08",
    sexe: "M",
    adresse: "789 Rue de la Liberté, Lubumbashi",
    contact: "+243 555 123 456",
    type_patient: "Résident",
    medecin_resident: "Dr. Tshisekedi Antoine"
  },
  {
    patient_id: 4,
    code: "PAT004",
    nom: "Mobutu",
    prenom: "Sophie",
    date_naissance: "1995-04-12",
    sexe: "F",
    adresse: "321 Avenue des Aviateurs, Kinshasa",
    contact: "+243 777 888 999",
    type_patient: "Ambulant"
  },
  {
    patient_id: 5,
    code: "PAT005",
    nom: "Tshombe",
    postnom: "Mukeba",
    prenom: "Joseph",
    date_naissance: "1980-09-30",
    sexe: "M",
    adresse: "654 Boulevard Lumumba, Kisangani",
    contact: "+243 444 555 666",
    type_patient: "Résident",
    medecin_resident: "Dr. Kasa-Vubu Joseph"
  }
];

export default function PatientList() {
  const [patients] = useState<Patient[]>(mockPatients);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>(mockPatients);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    patient: Patient | null;
  }>({
    isOpen: false,
    patient: null
  });

  // Fonction de recherche
  useEffect(() => {
    const filtered = patients.filter(patient => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${patient.nom} ${patient.postnom || ''} ${patient.prenom}`.toLowerCase();
      const code = patient.code.toLowerCase();
      
      return fullName.includes(searchLower) || code.includes(searchLower);
    });
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

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

  // Fonction pour obtenir le badge de type de patient
  const getPatientTypeBadge = (type: string) => {
    return type === "Résident" ? (
      <Badge color="success">Résident</Badge>
    ) : (
      <Badge color="warning">Ambulant</Badge>
    );
  };

  // Fonction pour ouvrir le modal de suppression
  const handleDeleteClick = (patient: Patient) => {
    setDeleteModal({
      isOpen: true,
      patient
    });
  };

  // Fonction pour fermer le modal
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      patient: null
    });
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = () => {
    if (deleteModal.patient) {
      console.log("Suppression du patient:", deleteModal.patient);
      // Ici vous ajouterez la logique pour supprimer le patient
      alert(`Patient ${deleteModal.patient.nom} ${deleteModal.patient.prenom} supprimé avec succès !`);
      handleCloseDeleteModal();
    }
  };

  return (
    <>
      <Helmet>
        <title>Liste des Patients | ClinLab ERP</title>
        <meta name="description" content="Gestion des patients - Liste complète des patients du laboratoire" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Gestion des Patients
          </h2>
          
          <Link 
            to="/patients/nouveau"
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouveau Patient
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, prénom, postnom ou code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </div>

        {/* Statistiques */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {filteredPatients.length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patients trouvés</p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {patients.filter(p => p.type_patient === "Résident").length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patients Résidents</p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {patients.filter(p => p.type_patient === "Ambulant").length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Patients Ambulants</p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {patients.filter(p => p.sexe === "F").length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Femmes</p>
            </div>
          </div>
        </div>

        {/* Tableau des patients */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">
                    Patient
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Code
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Âge/Sexe
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Type
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Contact
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {filteredPatients.map((patient) => (
                  <tr key={patient.patient_id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11">
                      <div className="flex flex-col">
                        <h5 className="font-medium text-gray-800 dark:text-white/90">
                          {patient.nom} {patient.postnom && patient.postnom} {patient.prenom}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{patient.adresse}</p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90 font-medium">{patient.code}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90">
                        {calculateAge(patient.date_naissance)} ans / {patient.sexe === 'M' ? 'M' : 'F'}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(patient.date_naissance)}</p>
                    </td>
                    <td className="py-5 px-4">
                      {getPatientTypeBadge(patient.type_patient)}
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90">{patient.contact}</p>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        <Link 
                          to={`/patients/${patient.patient_id}`}
                          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors"
                          title="Voir les détails"
                        >
                          <UserCircleIcon className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/patients/${patient.patient_id}/modifier`}
                          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(patient)}
                          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors"
                          title="Supprimer"
                        >
                          <TrashBinIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/[0.05] bg-white dark:bg-white/[0.03] px-4 py-3 sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              Précédent
            </button>
            <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredPatients.length}</span> sur{' '}
                <span className="font-medium">{patients.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-500 dark:ring-gray-600 dark:hover:bg-gray-700">
                  Précédent
                </button>
                <button className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-white dark:ring-gray-600 dark:hover:bg-gray-700">
                  1
                </button>
                <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 dark:text-gray-500 dark:ring-gray-600 dark:hover:bg-gray-700">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModal.isOpen}
        onClose={handleCloseDeleteModal}
        title="Confirmer la suppression"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <TrashBinIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
            Supprimer le patient
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer le patient{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {deleteModal.patient?.nom} {deleteModal.patient?.prenom}
            </span>
            ? Cette action est irréversible.
          </p>
          
          <div className="mt-6 flex justify-center space-x-3">
            <button
              onClick={handleCloseDeleteModal}
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDelete}
              className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:bg-red-600 dark:hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
} 