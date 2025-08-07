import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router";
import { ChevronLeftIcon, CheckLineIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";

interface FormData {
  code: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: string;
  contact: string;
  numero_identification: string;
}

interface FormErrors {
  code?: string;
  nom?: string;
  prenom?: string;
  date_naissance?: string;
  sexe?: string;
  contact?: string;
  numero_identification?: string;
}

// Données de test pour simuler un médecin existant
const mockMedecin = {
  medecin_id: 1,
  code: "MED001",
  nom: "Mwamba",
  prenom: "Pierre",
  date_naissance: "1979-05-15",
  sexe: "M" as const,
  contact: "+243 123 456 789",
  numero_identification: "MED-2024-001"
};

export default function EditMedecin() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    code: "",
    nom: "",
    prenom: "",
    date_naissance: "",
    sexe: "",
    contact: "",
    numero_identification: ""
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Options pour le select du sexe
  const sexeOptions = [
    { value: "M", label: "Masculin" },
    { value: "F", label: "Féminin" }
  ];

  // Simuler le chargement des données
  useEffect(() => {
    const loadMedecin = async () => {
      setLoading(true);
      
      // Simuler un délai de chargement
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Charger les données du médecin (ici on utilise les données mockées)
      setFormData({
        code: mockMedecin.code,
        nom: mockMedecin.nom,
        prenom: mockMedecin.prenom,
        date_naissance: mockMedecin.date_naissance,
        sexe: mockMedecin.sexe,
        contact: mockMedecin.contact,
        numero_identification: mockMedecin.numero_identification
      });
      
      setLoading(false);
    };

    loadMedecin();
  }, [id]);

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

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    } else if (formData.nom.length < 2) {
      newErrors.nom = "Le nom doit contenir au moins 2 caractères";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    } else if (formData.prenom.length < 2) {
      newErrors.prenom = "Le prénom doit contenir au moins 2 caractères";
    }

    if (!formData.date_naissance) {
      newErrors.date_naissance = "La date de naissance est requise";
    }

    if (!formData.sexe) {
      newErrors.sexe = "Le sexe est requis";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Le contact est requis";
    } else if (formData.contact.length < 8) {
      newErrors.contact = "Le contact doit contenir au moins 8 caractères";
    }

    if (!formData.numero_identification.trim()) {
      newErrors.numero_identification = "Le numéro d'identification est requis";
    } else if (formData.numero_identification.length < 5) {
      newErrors.numero_identification = "Le numéro d'identification doit contenir au moins 5 caractères";
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
      
      console.log("Médecin modifié:", formData);
      alert("Médecin modifié avec succès !");
      
      // Rediriger vers la liste
      window.location.href = "/medecins";
    } catch (error) {
      console.error("Erreur lors de la modification:", error);
      alert("Erreur lors de la modification du médecin");
    } finally {
      setIsSubmitting(false);
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

  return (
    <>
      <Helmet>
        <title>Modifier le Médecin | ClinLab ERP</title>
        <meta name="description" content="Modifier les informations d'un médecin - ClinLab ERP" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <a 
              href="/medecins" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </a>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Modifier le Médecin
            </h2>
          </div>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Label htmlFor="code">Code <span className="text-red-500">*</span></Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="Ex: MED001"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
              </div>

              <div>
                <Label htmlFor="numero_identification">Numéro d'Identification <span className="text-red-500">*</span></Label>
                <Input
                  id="numero_identification"
                  type="text"
                  placeholder="Ex: MED-2024-001"
                  value={formData.numero_identification}
                  onChange={(e) => handleInputChange("numero_identification", e.target.value)}
                  className={errors.numero_identification ? "border-red-500" : ""}
                />
                {errors.numero_identification && <p className="mt-1 text-sm text-red-500">{errors.numero_identification}</p>}
              </div>

              <div>
                <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                <Input
                  id="nom"
                  type="text"
                  placeholder="Nom du médecin"
                  value={formData.nom}
                  onChange={(e) => handleInputChange("nom", e.target.value)}
                  className={errors.nom ? "border-red-500" : ""}
                />
                {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
              </div>

              <div>
                <Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label>
                <Input
                  id="prenom"
                  type="text"
                  placeholder="Prénom du médecin"
                  value={formData.prenom}
                  onChange={(e) => handleInputChange("prenom", e.target.value)}
                  className={errors.prenom ? "border-red-500" : ""}
                />
                {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
              </div>

              <div>
                <Label htmlFor="date_naissance">Date de naissance <span className="text-red-500">*</span></Label>
                <DatePicker
                  id="date_naissance"
                  placeholder="Sélectionner une date"
                  defaultDate={formData.date_naissance ? new Date(formData.date_naissance) : undefined}
                  onChange={(dates, dateStr) => handleInputChange("date_naissance", dateStr)}
                />
                {errors.date_naissance && <p className="mt-1 text-sm text-red-500">{errors.date_naissance}</p>}
              </div>

              <div>
                <Label htmlFor="sexe">Sexe <span className="text-red-500">*</span></Label>
                <Select
                  options={sexeOptions}
                  placeholder="Sélectionner le sexe"
                  defaultValue={formData.sexe}
                  onChange={(value) => handleInputChange("sexe", value)}
                  className={errors.sexe ? "border-red-500" : ""}
                />
                {errors.sexe && <p className="mt-1 text-sm text-red-500">{errors.sexe}</p>}
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="contact">Contact <span className="text-red-500">*</span></Label>
                <Input
                  id="contact"
                  type="tel"
                  placeholder="Ex: +243 123 456 789"
                  value={formData.contact}
                  onChange={(e) => handleInputChange("contact", e.target.value)}
                  className={errors.contact ? "border-red-500" : ""}
                />
                {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-6">
              <a
                href="/medecins"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </a>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    Modification...
                  </>
                ) : (
                  <>
                    <CheckLineIcon className="mr-2 h-4 w-4" />
                    Modifier le Médecin
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