import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import { CompanyIcon } from "../../icons";

export default function CompanyDetailsCard() {
  const { isOpen, openModal, closeModal } = useModal();
  
  const handleSave = () => {
    console.log("Saving company details...");
    closeModal();
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
              <CompanyIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Laboratoire Central
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Établissement de santé publique
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Code Compagnie
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                LAB001
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Nom de la Compagnie
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Laboratoire Central de Kinshasa
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Adresse
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                123 Avenue du Commerce, Kinshasa, RDC
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                contact@labcentral.cd
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Contact
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                +243 123 456 789
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Secteur d'Activité
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                Laboratoire médical
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Type d'Établissement
              </p>
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Public
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                Logo
              </p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  logo_laboratoire.png
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Description
            </p>
            <p className="text-sm text-gray-800 dark:text-white/90">
              Le Laboratoire Central de Kinshasa est un établissement de santé publique spécialisé dans les analyses médicales. 
              Nous offrons des services de diagnostic de qualité pour soutenir la santé publique en République Démocratique du Congo.
            </p>
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

      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[800px] m-4">
        <div className="no-scrollbar relative w-full max-w-[800px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Modifier les Informations de la Compagnie
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour les informations de votre laboratoire.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[500px] overflow-y-auto px-2 pb-3">
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                <div>
                  <Label>Code Compagnie</Label>
                  <Input type="text" value="LAB001" disabled />
                </div>

                <div>
                  <Label>Nom de la Compagnie</Label>
                  <Input type="text" value="Laboratoire Central de Kinshasa" />
                </div>

                <div className="lg:col-span-2">
                  <Label>Adresse</Label>
                  <Input type="text" value="123 Avenue du Commerce, Kinshasa, RDC" />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input type="email" value="contact@labcentral.cd" />
                </div>

                <div>
                  <Label>Contact</Label>
                  <Input type="tel" value="+243 123 456 789" />
                </div>

                <div>
                  <Label>Secteur d'Activité</Label>
                  <Input type="text" value="Laboratoire médical" />
                </div>

                <div>
                  <Label>Type d'Établissement</Label>
                  <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                    <option value="Public">Public</option>
                    <option value="Privé">Privé</option>
                    <option value="Universitaire">Universitaire</option>
                  </select>
                </div>

                <div>
                  <Label>Logo</Label>
                  <Input type="file" accept="image/*" />
                </div>

                <div className="lg:col-span-2">
                  <Label>Description</Label>
                  <textarea 
                    className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    rows={4}
                    placeholder="Description de votre laboratoire..."
                  >
                    Le Laboratoire Central de Kinshasa est un établissement de santé publique spécialisé dans les analyses médicales. Nous offrons des services de diagnostic de qualité pour soutenir la santé publique en République Démocratique du Congo.
                  </textarea>
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