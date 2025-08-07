import { useState, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserAddressCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedLogo, setSelectedLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedLogo(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    console.log("Saving company details...");
    closeModal();
    setSelectedLogo(null); // Reset logo preview
  };

  const handleClose = () => {
    closeModal();
    setSelectedLogo(null); // Reset logo preview
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white lg:mb-6">
            Informations de la Compagnie
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Code Compagnie
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                LAB001
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Nom de la Compagnie
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Laboratoire Central de Kinshasa
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Adresse
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                123 Avenue du Commerce, Kinshasa, RDC
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Email
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                contact@labcentral.cd
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Contact
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                +243 123 456 789
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Secteur d'Activité
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Laboratoire médical
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Type d'Établissement
              </p>
              <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                Public
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Logo
              </p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {selectedLogo ? (
                    <img 
                      src={selectedLogo} 
                      alt="Logo de la compagnie" 
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedLogo ? "Nouveau logo sélectionné" : "logo_laboratoire.png"}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="text-sm text-gray-800 dark:text-white">
                Établissement de santé publique spécialisé dans les analyses médicales
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openModal}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
        >
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
              fill=""
            />
          </svg>
          Edit
        </button>
      </div>

      <Modal isOpen={isOpen} onClose={handleClose} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white">
              Modifier les Informations de la Compagnie
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Mettez à jour les informations de votre laboratoire.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white lg:mb-6">
                  Informations de la Compagnie
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Code Compagnie</Label>
                    <Input type="text" value="LAB001" disabled />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Nom de la Compagnie</Label>
                    <Input type="text" value="Laboratoire Central de Kinshasa" />
                  </div>

                  <div className="col-span-2">
                    <Label>Adresse</Label>
                    <Input type="text" value="123 Avenue du Commerce, Kinshasa, RDC" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Email</Label>
                    <Input type="email" value="contact@labcentral.cd" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Contact</Label>
                    <Input type="tel" value="+243 123 456 789" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Secteur d'Activité</Label>
                    <Input type="text" value="Laboratoire médical" />
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Type d'Établissement</Label>
                    <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                      <option value="Public" className="dark:text-white">Public</option>
                      <option value="Privé" className="dark:text-white">Privé</option>
                      <option value="Universitaire" className="dark:text-white">Universitaire</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <Label>Logo de la Compagnie</Label>
                    <div className="flex items-center gap-6">
                      {/* Aperçu du logo actuel */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                          {selectedLogo ? (
                            <img 
                              src={selectedLogo} 
                              alt="Aperçu du logo" 
                              className="h-full w-full object-contain"
                            />
                          ) : (
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedLogo ? "Nouveau logo" : "Aucun logo"}
                        </span>
                      </div>

                      {/* Sélection de fichier */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleLogoChange}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                          >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Choisir un logo
                          </button>
                          {selectedLogo && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLogo(null);
                                if (fileInputRef.current) {
                                  fileInputRef.current.value = '';
                                }
                              }}
                              className="flex items-center gap-2 rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-600 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Supprimer
                            </button>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          Formats acceptés : JPG, PNG, SVG (max 2MB)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <Label>Description</Label>
                    <textarea 
                      className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      rows={3}
                    >
                      Établissement de santé publique spécialisé dans les analyses médicales
                    </textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={handleClose}>
                Close
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
