import { useState, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";

export default function UserMetaCard() {
  const { isOpen, openModal, closeModal } = useModal();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log("Saving changes...");
    closeModal();
    setSelectedImage(null); // Reset image preview
  };

  const handleClose = () => {
    closeModal();
    setSelectedImage(null); // Reset image preview
  };

  return (
    <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white lg:mb-6">
            Sécurité & Rôles
          </h4>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Rôle Principal
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Technicien de Laboratoire
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Permissions
              </p>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Patients:</span>
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    READ
                  </span>
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    CREATE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Examens:</span>
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    READ
                  </span>
                  <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    UPDATE
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Stocks:</span>
                  <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    READ
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Dernière modification
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                10/01/2025 09:15
              </p>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Statut du compte
              </p>
              <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-xs font-medium text-success">
                Actif
              </span>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Photo de profil
              </p>
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                  {selectedImage ? (
                    <img 
                      src={selectedImage} 
                      alt="Photo de profil" 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedImage ? "Nouvelle image sélectionnée" : "Aucune photo"}
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                Compagnie
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                Laboratoire Central
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
              Modifier la Sécurité & Rôles
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400 lg:mb-7">
              Gérez vos paramètres de sécurité et rôles.
            </p>
          </div>
          <form className="flex flex-col">
            <div className="custom-scrollbar h-[600px] overflow-y-auto px-2 pb-3">
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white lg:mb-6">
                  Sécurité & Rôles
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <Label>Rôle Principal</Label>
                    <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                      <option value="technicien" className="dark:text-white">Technicien de Laboratoire</option>
                      <option value="receptionniste" className="dark:text-white">Réceptionniste</option>
                      <option value="comptable" className="dark:text-white">Comptable</option>
                      <option value="administrateur" className="dark:text-white">Administrateur</option>
                    </select>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Statut du compte</Label>
                    <select className="w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm font-medium text-gray-800 dark:text-white outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                      <option value="true" className="dark:text-white">Actif</option>
                      <option value="false" className="dark:text-white">Inactif</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <Label>Photo de profil</Label>
                    <div className="flex items-center gap-6">
                      {/* Aperçu de l'image actuelle */}
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                          {selectedImage ? (
                            <img 
                              src={selectedImage} 
                              alt="Aperçu" 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedImage ? "Nouvelle image" : "Aucune image"}
                        </span>
                      </div>

                      {/* Sélection de fichier */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
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
                            Choisir une image
                          </button>
                          {selectedImage && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedImage(null);
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
                          Formats acceptés : JPG, PNG, GIF (max 2MB)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Changement de mot de passe */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white lg:mb-6">
                    Changement de mot de passe
                  </h5>
                  
                  <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                    <div className="col-span-2 lg:col-span-1">
                      <Label>Mot de passe actuel</Label>
                      <Input type="password" placeholder="Entrez votre mot de passe actuel" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Nouveau mot de passe</Label>
                      <Input type="password" placeholder="Entrez le nouveau mot de passe" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <Label>Confirmer le nouveau mot de passe</Label>
                      <Input type="password" placeholder="Confirmez le nouveau mot de passe" />
                    </div>

                    <div className="col-span-2 lg:col-span-1">
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg dark:bg-blue-900/10">
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          <strong>Conseils de sécurité :</strong>
                        </p>
                        <ul className="text-xs text-blue-600 dark:text-blue-400 mt-1 space-y-1">
                          <li>• Au moins 8 caractères</li>
                          <li>• Combinez lettres, chiffres et symboles</li>
                          <li>• Évitez les informations personnelles</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Permissions */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white lg:mb-6">
                    Permissions par Module
                  </h5>
                  
                  <div className="space-y-4">
                    {/* Patients */}
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h6 className="font-medium text-gray-800 dark:text-white mb-3">Patients</h6>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="patients_read" className="rounded" defaultChecked />
                          <label htmlFor="patients_read" className="text-sm text-gray-800 dark:text-white">READ</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="patients_create" className="rounded" defaultChecked />
                          <label htmlFor="patients_create" className="text-sm text-gray-800 dark:text-white">CREATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="patients_update" className="rounded" />
                          <label htmlFor="patients_update" className="text-sm text-gray-800 dark:text-white">UPDATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="patients_delete" className="rounded" />
                          <label htmlFor="patients_delete" className="text-sm text-gray-800 dark:text-white">DELETE</label>
                        </div>
                      </div>
                    </div>

                    {/* Examens */}
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h6 className="font-medium text-gray-800 dark:text-white mb-3">Examens</h6>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="examens_read" className="rounded" defaultChecked />
                          <label htmlFor="examens_read" className="text-sm text-gray-800 dark:text-white">READ</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="examens_create" className="rounded" />
                          <label htmlFor="examens_create" className="text-sm text-gray-800 dark:text-white">CREATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="examens_update" className="rounded" defaultChecked />
                          <label htmlFor="examens_update" className="text-sm text-gray-800 dark:text-white">UPDATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="examens_delete" className="rounded" />
                          <label htmlFor="examens_delete" className="text-sm text-gray-800 dark:text-white">DELETE</label>
                        </div>
                      </div>
                    </div>

                    {/* Stocks */}
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h6 className="font-medium text-gray-800 dark:text-white mb-3">Stocks</h6>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="stocks_read" className="rounded" defaultChecked />
                          <label htmlFor="stocks_read" className="text-sm text-gray-800 dark:text-white">READ</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="stocks_create" className="rounded" />
                          <label htmlFor="stocks_create" className="text-sm text-gray-800 dark:text-white">CREATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="stocks_update" className="rounded" />
                          <label htmlFor="stocks_update" className="text-sm text-gray-800 dark:text-white">UPDATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="stocks_delete" className="rounded" />
                          <label htmlFor="stocks_delete" className="text-sm text-gray-800 dark:text-white">DELETE</label>
                        </div>
                      </div>
                    </div>

                    {/* Factures */}
                    <div className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                      <h6 className="font-medium text-gray-800 dark:text-white mb-3">Factures</h6>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="factures_read" className="rounded" />
                          <label htmlFor="factures_read" className="text-sm text-gray-800 dark:text-white">READ</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="factures_create" className="rounded" />
                          <label htmlFor="factures_create" className="text-sm text-gray-800 dark:text-white">CREATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="factures_update" className="rounded" />
                          <label htmlFor="factures_update" className="text-sm text-gray-800 dark:text-white">UPDATE</label>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="factures_delete" className="rounded" />
                          <label htmlFor="factures_delete" className="text-sm text-gray-800 dark:text-white">DELETE</label>
                        </div>
                      </div>
                    </div>
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
