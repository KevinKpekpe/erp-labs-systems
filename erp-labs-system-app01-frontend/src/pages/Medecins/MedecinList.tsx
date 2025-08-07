import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { UserIcon, PlusIcon, UserCircleIcon, PencilIcon, TrashBinIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Modal from "../../components/ui/Modal";
import { Link } from "react-router";

// Interface pour un médecin basée sur votre base de données
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

// Données de test basées sur votre structure de base de données
const mockMedecins: Medecin[] = [
  {
    medecin_id: 1,
    code: "MED001",
    nom: "Mwamba",
    prenom: "Pierre",
    date_naissance: "1979-05-15",
    sexe: "M",
    contact: "+243 123 456 789",
    numero_identification: "MED-2024-001"
  },
  {
    medecin_id: 2,
    code: "MED002",
    nom: "Tshisekedi",
    prenom: "Antoine",
    date_naissance: "1986-03-22",
    sexe: "M",
    contact: "+243 987 654 321",
    numero_identification: "MED-2024-002"
  },
  {
    medecin_id: 3,
    code: "MED003",
    nom: "Kasa-Vubu",
    prenom: "Joseph",
    date_naissance: "1972-11-08",
    sexe: "M",
    contact: "+243 555 123 456",
    numero_identification: "MED-2024-003"
  },
  {
    medecin_id: 4,
    code: "MED004",
    nom: "Lumumba",
    prenom: "Marie",
    date_naissance: "1989-07-14",
    sexe: "F",
    contact: "+243 777 888 999",
    numero_identification: "MED-2024-004"
  },
  {
    medecin_id: 5,
    code: "MED005",
    nom: "Mobutu",
    prenom: "Sophie",
    date_naissance: "1982-12-03",
    sexe: "F",
    contact: "+243 444 555 666",
    numero_identification: "MED-2024-005"
  }
];

export default function MedecinList() {
  const [medecins] = useState<Medecin[]>(mockMedecins);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredMedecins, setFilteredMedecins] = useState<Medecin[]>(mockMedecins);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    medecin: Medecin | null;
  }>({
    isOpen: false,
    medecin: null
  });

  // Fonction de recherche
  useEffect(() => {
    const filtered = medecins.filter(medecin => {
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${medecin.nom} ${medecin.prenom}`.toLowerCase();
      const code = medecin.code.toLowerCase();
      const numeroId = medecin.numero_identification.toLowerCase();
      
      return fullName.includes(searchLower) || 
             code.includes(searchLower) || 
             numeroId.includes(searchLower);
    });
    setFilteredMedecins(filtered);
  }, [searchTerm, medecins]);

  // Fonction pour ouvrir le modal de suppression
  const handleDeleteClick = (medecin: Medecin) => {
    setDeleteModal({
      isOpen: true,
      medecin
    });
  };

  // Fonction pour fermer le modal
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      medecin: null
    });
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = () => {
    if (deleteModal.medecin) {
      console.log("Suppression du médecin:", deleteModal.medecin);
      // Ici vous ajouterez la logique pour supprimer le médecin
      alert(`Médecin ${deleteModal.medecin.nom} ${deleteModal.medecin.prenom} supprimé avec succès !`);
      handleCloseDeleteModal();
    }
  };

  return (
    <>
      <Helmet>
        <title>Liste des Médecins | ClinLab ERP</title>
        <meta name="description" content="Gestion des médecins - Liste complète des médecins du laboratoire" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">
            Gestion des Médecins
          </h2>
          
          <Link 
            to="/medecins/nouveau"
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Nouveau Médecin
          </Link>
        </div>

        {/* Barre de recherche */}
        <div className="mb-6">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher par nom, prénom, code ou numéro d'identification..."
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
                {filteredMedecins.length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Médecins trouvés</p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {medecins.length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total des médecins</p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {medecins.filter(m => m.sexe === "M").length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Hommes</p>
            </div>
          </div>
          
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <UserIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">
                {medecins.filter(m => m.sexe === "F").length}
              </h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Femmes</p>
            </div>
          </div>
        </div>

        {/* Tableau des médecins */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">
                    Médecin
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Code
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Date de naissance
                  </th>
                  <th className="min-w-[180px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">
                    Numéro d'Identification
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
                {filteredMedecins.map((medecin) => (
                  <tr key={medecin.medecin_id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11">
                      <div className="flex flex-col">
                        <h5 className="font-medium text-gray-800 dark:text-white/90">
                          Dr. {medecin.nom} {medecin.prenom}
                        </h5>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {medecin.sexe === 'M' ? 'Homme' : 'Femme'} • {calculateAge(medecin.date_naissance)} ans
                        </p>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90 font-medium">{medecin.code}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90">
                        {formatDate(medecin.date_naissance)}
                      </p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90">{medecin.numero_identification}</p>
                    </td>
                    <td className="py-5 px-4">
                      <p className="text-gray-800 dark:text-white/90">{medecin.contact}</p>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        <Link 
                          to={`/medecins/${medecin.medecin_id}`}
                          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors"
                          title="Voir les détails"
                        >
                          <UserCircleIcon className="h-5 w-5" />
                        </Link>
                        <Link 
                          to={`/medecins/${medecin.medecin_id}/modifier`}
                          className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors"
                          title="Modifier"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteClick(medecin)}
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
                Affichage de <span className="font-medium">1</span> à <span className="font-medium">{filteredMedecins.length}</span> sur{' '}
                <span className="font-medium">{medecins.length}</span> résultats
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
            Supprimer le médecin
          </h3>
          
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Êtes-vous sûr de vouloir supprimer le médecin{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              Dr. {deleteModal.medecin?.nom} {deleteModal.medecin?.prenom}
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