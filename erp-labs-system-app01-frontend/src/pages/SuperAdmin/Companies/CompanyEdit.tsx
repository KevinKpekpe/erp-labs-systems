import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { ArrowLeftIcon, SaveIcon, TrashIcon } from "../../../icons";
import { apiFetch } from "../../../lib/apiClient";
import PageMeta from "../../../components/common/PageMeta";
import Alert from "../../../components/ui/alert/Alert";
import { ENV } from "../../../config/env";

interface Company {
  id: number;
  code: number;
  nom_company: string;
  adresse: string;
  email: string;
  contact: string;
  logo: string | null;
  secteur_activite: string | null;
  type_etablissement: string;
  description: string | null;
}

export default function CompanyEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    nom_company: "",
    adresse: "",
    email: "",
    contact: "",
    secteur_activite: "",
    type_etablissement: "",
    description: ""
  });
  
  // Logo handling
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [removeLogo, setRemoveLogo] = useState(false);

  useEffect(() => {
    fetchCompany();
  }, [id]);

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiFetch<{ success: boolean; data: Company }>(
        `/v1/superadmin/companies/${id}`,
        { method: "GET" },
        "superadmin"
      );
      
      if (res.success && res.data) {
        setCompany(res.data);
        setFormData({
          nom_company: res.data.nom_company,
          adresse: res.data.adresse,
          email: res.data.email,
          contact: res.data.contact,
          secteur_activite: res.data.secteur_activite || "",
          type_etablissement: res.data.type_etablissement,
          description: res.data.description || ""
        });
        
        // Set logo preview if exists
        if (res.data.logo) {
          const backendBase = (ENV.API_BASE_URL || "").replace(/\/api\/?$/, "");
          let logoUrl = res.data.logo;
          if (!logoUrl.startsWith("http") && !logoUrl.startsWith("/")) {
            logoUrl = `${backendBase}/storage/${logoUrl}`;
          } else if (logoUrl.startsWith("/")) {
            logoUrl = `${backendBase}${logoUrl}`;
          }
          setLogoPreview(logoUrl);
        }
      } else {
        setError("Compagnie non trouvée");
      }
    } catch (error) {
      console.error("Erreur lors du chargement de la compagnie:", error);
      setError("Erreur lors du chargement de la compagnie");
    } finally {
      setLoading(false);
    }
  };

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
      setRemoveLogo(false);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      const formDataToSend = new FormData();
      formDataToSend.append("nom_company", formData.nom_company);
      formDataToSend.append("adresse", formData.adresse);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("contact", formData.contact);
      formDataToSend.append("secteur_activite", formData.secteur_activite);
      formDataToSend.append("type_etablissement", formData.type_etablissement);
      formDataToSend.append("description", formData.description);
      
      if (logoFile) {
        formDataToSend.append("logo", logoFile);
      }
      
      if (removeLogo) {
        formDataToSend.append("remove_logo", "1");
      }
      
              await apiFetch(
          `/v1/superadmin/companies/${id}`,
          {
            method: "POST",
            body: formDataToSend
          },
          "superadmin"
        );
      
      setSuccessMessage("Compagnie mise à jour avec succès");
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate(`/superadmin/companies/${id}`, {
          state: { success: "Compagnie mise à jour avec succès" }
        });
      }, 1500);
      
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour:", error);
      const message = error.response?.data?.message || "Erreur lors de la mise à jour de la compagnie";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4 dark:bg-gray-700"></div>
          <div className="h-64 bg-gray-200 rounded dark:bg-gray-700"></div>
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 dark:bg-red-900/20 dark:border-red-800">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Erreur</h3>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                {error || "Compagnie non trouvée"}
              </p>
              <Link
                to="/superadmin/companies"
                className="mt-2 text-sm text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                Retour à la liste
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Modifier ${company.nom_company} | SuperAdmin`}
        description={`Modifier les informations de la compagnie ${company.nom_company}`}
      />
      
      <div className="p-6">
        {/* Messages flash */}
        {successMessage && (
          <div className="mb-6">
            <Alert variant="success" title="Succès" message={successMessage} />
          </div>
        )}
        
        {error && (
          <div className="mb-6">
            <Alert variant="error" title="Erreur" message={error} />
          </div>
        )}

        {/* En-tête */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to={`/superadmin/companies/${id}`}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Retour aux détails
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Modifier {company.nom_company}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Code: {company.code}
              </p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-gray-800 border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Logo et prévisualisation */}
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Logo de la compagnie</h3>
                
                <div className="space-y-4">
                  {/* Prévisualisation actuelle */}
                  {logoPreview && !removeLogo && (
                    <div className="text-center">
                      <img
                        src={logoPreview}
                        alt="Logo actuel"
                        className="h-32 w-32 mx-auto rounded-full object-cover border-4 border-gray-200 dark:border-gray-700"
                      />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Logo actuel</p>
                    </div>
                  )}
                  
                  {/* Upload de nouveau logo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nouveau logo
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/20 dark:file:text-blue-400"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Formats acceptés: JPG, PNG, GIF. Taille max: 2MB
                    </p>
                  </div>
                  
                  {/* Supprimer le logo */}
                  {logoPreview && !removeLogo && (
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/40"
                    >
                      <TrashIcon className="w-4 h-4 mr-2" />
                      Supprimer le logo
                    </button>
                  )}
                  
                  {removeLogo && (
                    <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Le logo sera supprimé lors de la sauvegarde
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations de la compagnie */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Informations de la compagnie</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Nom de la compagnie */}
                  <div className="md:col-span-2">
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
                    />
                  </div>

                  {/* Type d'établissement */}
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
                      <option value="">Sélectionner un type</option>
                      <option value="Privé">Privé</option>
                      <option value="Public">Public</option>
                      <option value="Mixte">Mixte</option>
                      <option value="ONG">ONG</option>
                    </select>
                  </div>

                  {/* Secteur d'activité */}
                  <div>
                    <label htmlFor="secteur_activite" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Secteur d'activité
                    </label>
                    <select
                      id="secteur_activite"
                      name="secteur_activite"
                      value={formData.secteur_activite}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    >
                      <option value="">Sélectionner un secteur</option>
                      <option value="Santé">Santé</option>
                      <option value="Éducation">Éducation</option>
                      <option value="Finance">Finance</option>
                      <option value="Technologie">Technologie</option>
                      <option value="Commerce">Commerce</option>
                      <option value="Industrie">Industrie</option>
                      <option value="Services">Services</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  {/* Contact */}
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
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                    />
                  </div>

                  {/* Adresse */}
                  <div className="md:col-span-2">
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
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400"
                      placeholder="Description de la compagnie..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Link
              to={`/superadmin/companies/${id}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Annuler
            </Link>
            
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-blue-600 dark:hover:bg-blue-700"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              {submitting ? "Sauvegarde..." : "Sauvegarder"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
