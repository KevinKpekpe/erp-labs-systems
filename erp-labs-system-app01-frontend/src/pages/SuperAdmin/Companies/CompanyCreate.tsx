import { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeftIcon, PlusIcon, TrashIcon } from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import PageMeta from "../../../components/common/PageMeta";

interface CompanyFormData {
  nom_company: string;
  adresse: string;
  email: string;
  contact: string;
  secteur_activite: string;
  type_etablissement: string;
  description: string;
  admin_username: string;
  admin_email: string;
}

export default function CompanyCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    nom_company: "",
    adresse: "",
    email: "",
    contact: "",
    secteur_activite: "",
    type_etablissement: "Privé",
    description: "",
    admin_username: "",
    admin_email: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    const fileInput = document.getElementById('logo') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom_company || !formData.adresse || !formData.contact || 
        !formData.admin_username || !formData.admin_email) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      
      // Ajouter les champs de base
      Object.entries(formData).forEach(([key, value]) => {
        if (value) formDataToSend.append(key, value);
      });
      
      // Ajouter le logo si présent
      if (logoFile) {
        formDataToSend.append('logo', logoFile);
      }

      const response = await apiFetch(
        "/v1/superadmin/companies",
        {
          method: "POST",
          body: formDataToSend
        },
        "superadmin"
      );

      if (response.success) {
        alert("Compagnie créée avec succès ! Un email a été envoyé à l'administrateur avec ses identifiants.");
        navigate("/superadmin/companies");
      }
    } catch (error: any) {
      console.error("Erreur lors de la création:", error);
      const message = error.response?.data?.message || "Erreur lors de la création de la compagnie";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Nouvelle Compagnie | SuperAdmin"
        description="Créer une nouvelle compagnie dans le système"
      />
      
      <div className="p-6">
        {/* En-tête */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/superadmin/companies")}
              className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour à la liste
            </button>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
            Nouvelle Compagnie
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Créer une nouvelle entreprise avec son administrateur initial
          </p>
        </div>

        {/* Formulaire */}
        <div className="max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de la compagnie */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Informations de la Compagnie
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="nom_company" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom de la compagnie *
                  </label>
                  <input
                    type="text"
                    id="nom_company"
                    name="nom_company"
                    value={formData.nom_company}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="Nom de l'entreprise"
                  />
                </div>

                <div>
                  <label htmlFor="type_etablissement" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'établissement *
                  </label>
                  <select
                    id="type_etablissement"
                    name="type_etablissement"
                    value={formData.type_etablissement}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                  >
                    <option value="Privé">Privé</option>
                    <option value="Public">Public</option>
                    <option value="Universitaire">Universitaire</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="adresse" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label htmlFor="contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contact *
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="Numéro de téléphone"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="email@compagnie.com"
                  />
                </div>

                <div>
                  <label htmlFor="secteur_activite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secteur d'activité
                  </label>
                  <input
                    type="text"
                    id="secteur_activite"
                    name="secteur_activite"
                    value={formData.secteur_activite}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="Ex: Santé, Éducation, Commerce..."
                  />
                </div>
              </div>

              <div className="mt-6">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                  placeholder="Description de l'entreprise..."
                />
              </div>

              {/* Logo */}
              <div className="mt-6">
                <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Logo de la compagnie
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    id="logo"
                    name="logo"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                  />
                  {logoPreview && (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Aperçu du logo"
                        className="w-16 h-16 rounded-lg object-cover border border-gray-300 dark:border-gray-600"
                      />
                      <button
                        type="button"
                        onClick={removeLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <TrashIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                </p>
              </div>
            </div>

            {/* Informations de l'administrateur */}
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Administrateur Initial
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Un compte administrateur sera créé automatiquement avec un mot de passe temporaire envoyé par email.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="admin_username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom d'utilisateur admin *
                  </label>
                  <input
                    type="text"
                    id="admin_username"
                    name="admin_username"
                    value={formData.admin_username}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="admin"
                  />
                </div>

                <div>
                  <label htmlFor="admin_email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email admin *
                  </label>
                  <input
                    type="email"
                    id="admin_email"
                    name="admin_email"
                    value={formData.admin_email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    placeholder="admin@compagnie.com"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/superadmin/companies")}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Création en cours...
                  </>
                ) : (
                  <>
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Créer la Compagnie
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
