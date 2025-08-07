import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import { Link } from "react-router";

interface FormData {
  code: string;
  nom_type: string;
  description: string;
}

interface FormErrors {
  code?: string;
  nom_type?: string;
}

export default function AddTypePatient() {
  const [formData, setFormData] = useState<FormData>({
    code: "",
    nom_type: "",
    description: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fonction pour gérer les changements dans les champs
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Effacer l'erreur du champ modifié
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Fonction de validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = "Le code est requis";
    } else if (formData.code.length < 3) {
      newErrors.code = "Le code doit contenir au moins 3 caractères";
    }

    if (!formData.nom_type.trim()) {
      newErrors.nom_type = "Le nom du type est requis";
    } else if (formData.nom_type.length < 2) {
      newErrors.nom_type = "Le nom du type doit contenir au moins 2 caractères";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction de soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Nouveau type de patient:", formData);
      alert("Type de patient créé avec succès !");
      
      // Rediriger vers la liste
      window.location.href = "/types-patients";
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création du type de patient");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Nouveau Type de Patient | ClinLab ERP</title>
        <meta name="description" content="Créer un nouveau type de patient - ClinLab ERP" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/types-patients" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Nouveau Type de Patient
            </h2>
          </div>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: TP001"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              <div>
                <label htmlFor="nom_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du Type <span className="text-red-500">*</span>
                </label>
                <Input
                  id="nom_type"
                  type="text"
                  placeholder="Ex: Résident, Ambulant"
                  value={formData.nom_type}
                  onChange={(e) => handleInputChange("nom_type", e.target.value)}
                  className={errors.nom_type ? "border-red-500" : ""}
                />
                {errors.nom_type && <p className="mt-1 text-sm text-red-500">{errors.nom_type}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                placeholder="Description détaillée du type de patient..."
                value={formData.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                rows={4}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <Link
                to="/types-patients"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Création...
                  </>
                ) : (
                  <>
                    <CheckLineIcon className="mr-2 h-4 w-4" />
                    Créer le Type
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