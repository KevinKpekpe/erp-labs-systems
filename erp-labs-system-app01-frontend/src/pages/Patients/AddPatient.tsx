import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, PlusIcon, UserIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";
import { Link } from "react-router";

// Interface pour un type de patient
interface TypePatient {
  type_patient_id: number;
  code: string;
  nom_type: string;
  description?: string;
}

// Données de test pour les types de patients
const mockTypePatients: TypePatient[] = [
  { type_patient_id: 1, code: "RES", nom_type: "Résident", description: "Patient hospitalisé" },
  { type_patient_id: 2, code: "AMB", nom_type: "Ambulant", description: "Patient externe" }
];

export default function AddPatient() {
  const [formData, setFormData] = useState({
    code: "",
    nom: "",
    postnom: "",
    prenom: "",
    email: "",
    date_naissance: "",
    sexe: "",
    adresse: "",
    contact: "",
    type_patient_id: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Options pour le select du sexe
  const sexeOptions = [
    { value: "M", label: "Masculin" },
    { value: "F", label: "Féminin" }
  ];

  // Options pour le select du type de patient
  const typePatientOptions = mockTypePatients.map(type => ({
    value: type.type_patient_id.toString(),
    label: type.nom_type
  }));

  // Fonction pour gérer les changements de champs
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur du champ modifié
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  // Fonction de validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Le code patient est requis";
    }

    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est requis";
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = "Le prénom est requis";
    }

    if (!formData.date_naissance) {
      newErrors.date_naissance = "La date de naissance est requise";
    }

    if (!formData.sexe) {
      newErrors.sexe = "Le sexe est requis";
    }

    if (!formData.adresse.trim()) {
      newErrors.adresse = "L'adresse est requise";
    }

    if (!formData.contact.trim()) {
      newErrors.contact = "Le contact est requis";
    }

    if (!formData.type_patient_id) {
      newErrors.type_patient_id = "Le type de patient est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction de soumission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log("Données du patient à sauvegarder:", formData);
      // Ici vous ajouterez la logique pour sauvegarder le patient
      alert("Patient ajouté avec succès !");
    }
  };

  return (
    <>
      <Helmet>
        <title>Nouveau Patient | ClinLab ERP</title>
        <meta name="description" content="Ajouter un nouveau patient - ClinLab ERP" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        {/* En-tête */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link 
              to="/patients" 
              className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="mr-2 h-4 w-4" />
              Retour
            </Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">
              Nouveau Patient
            </h2>
          </div>
        </div>

        {/* Formulaire */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center">
                <UserIcon className="mr-2 h-5 w-5" />
                Informations de base
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <Label htmlFor="code">Code Patient <span className="text-red-500">*</span></Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="Ex: PAT001"
                    value={formData.code}
                    onChange={(e) => handleInputChange("code", e.target.value)}
                    className={errors.code ? "border-red-500" : ""}
                  />
                  {errors.code && <p className="mt-1 text-sm text-red-500">{errors.code}</p>}
                </div>

                <div>
                  <Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label>
                  <Input
                    id="nom"
                    type="text"
                    placeholder="Nom de famille"
                    value={formData.nom}
                    onChange={(e) => handleInputChange("nom", e.target.value)}
                    className={errors.nom ? "border-red-500" : ""}
                  />
                  {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
                </div>

                <div>
                  <Label htmlFor="postnom">Postnom</Label>
                  <Input
                    id="postnom"
                    type="text"
                    placeholder="Postnom (optionnel)"
                    value={formData.postnom}
                    onChange={(e) => handleInputChange("postnom", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label>
                  <Input
                    id="prenom"
                    type="text"
                    placeholder="Prénom"
                    value={formData.prenom}
                    onChange={(e) => handleInputChange("prenom", e.target.value)}
                    className={errors.prenom ? "border-red-500" : ""}
                  />
                  {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
                </div>

                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="exemple@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="date_naissance">Date de naissance <span className="text-red-500">*</span></Label>
                  <DatePicker
                    id="date_naissance"
                    placeholder="Sélectionner une date"
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
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Informations de contact
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="adresse">Adresse <span className="text-red-500">*</span></Label>
                  <Input
                    id="adresse"
                    type="text"
                    placeholder="Adresse complète"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange("adresse", e.target.value)}
                    className={errors.adresse ? "border-red-500" : ""}
                  />
                  {errors.adresse && <p className="mt-1 text-sm text-red-500">{errors.adresse}</p>}
                </div>

                <div>
                  <Label htmlFor="contact">Contact <span className="text-red-500">*</span></Label>
                  <Input
                    id="contact"
                    type="tel"
                    placeholder="+243 123 456 789"
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    className={errors.contact ? "border-red-500" : ""}
                  />
                  {errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}
                </div>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Informations médicales
              </h3>
              
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="type_patient">Type de patient <span className="text-red-500">*</span></Label>
                  <Select
                    options={typePatientOptions}
                    placeholder="Sélectionner le type"
                    defaultValue={formData.type_patient_id}
                    onChange={(value) => handleInputChange("type_patient_id", value)}
                    className={errors.type_patient_id ? "border-red-500" : ""}
                  />
                  {errors.type_patient_id && <p className="mt-1 text-sm text-red-500">{errors.type_patient_id}</p>}
                </div>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link
                to="/patients"
                className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Annuler
              </Link>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"
              >
                <PlusIcon className="mr-2 h-4 w-4" />
                Ajouter le patient
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 