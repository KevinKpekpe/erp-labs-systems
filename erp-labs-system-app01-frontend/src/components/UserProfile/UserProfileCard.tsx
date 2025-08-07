import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { UserCircleIcon } from "../../icons";

export default function UserProfileCard() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const handleSave = () => {
    console.log("Saving profile changes...");
    closeModal();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <UserCircleIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white">
                Informations Personnelles
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Gérez vos informations de profil
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Code Utilisateur
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                USR001
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Nom d'utilisateur
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                jean.dupont
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                jean.dupont@laboratoire.com
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Téléphone
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                +243 123 456 789
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Sexe
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Masculin
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Statut
              </p>
              <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-xs font-medium text-success">
                Actif
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Dernière connexion
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                15/01/2025 14:30
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
          Modifier
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Modifier le Profil
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour vos informations personnelles.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Code Utilisateur</Label>
                  <Input type="text" value="USR001" disabled />
                </div>

                <div>
                  <Label>Nom d'utilisateur</Label>
                  <Input type="text" value="jean.dupont" />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input type="email" value="jean.dupont@laboratoire.com" />
                </div>

                <div>
                  <Label>Téléphone</Label>
                  <Input type="tel" value="+243 123 456 789" />
                </div>

                <div>
                  <Label>Sexe</Label>
                  <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                    <option value="M" className="dark:text-white">Masculin</option>
                    <option value="F" className="dark:text-white">Féminin</option>
                  </select>
                </div>

                <div>
                  <Label>Statut</Label>
                  <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                    <option value="true" className="dark:text-white">Actif</option>
                    <option value="false" className="dark:text-white">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal}>
                Annuler
              </Button>
              <Button size="sm" onClick={handleSave}>
                Enregistrer
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
} 