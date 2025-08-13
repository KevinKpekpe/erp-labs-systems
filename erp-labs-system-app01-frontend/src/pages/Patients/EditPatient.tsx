import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, CheckLineIcon, UserIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Select from "../../components/form/Select";
import DatePicker from "../../components/form/date-picker";
import Label from "../../components/form/Label";
import { Link, useNavigate, useParams } from "react-router";
import { apiFetch } from "../../lib/apiClient";

interface TypePatient { id: number; nom_type: string }

// Helpers de parsing sûrs
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isPatientTypeDTO(value: unknown): value is { id: number; nom_type: string } {
  return isObject(value) && typeof value.id === "number" && typeof value.nom_type === "string";
}
function extractTypesResponse(resp: unknown): TypePatient[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  if (Array.isArray(root) && root.every(isPatientTypeDTO)) {
    return root.map(t => ({ id: t.id, nom_type: t.nom_type }));
  }
  if (isObject(root) && Array.isArray(root.data) && root.data.every(isPatientTypeDTO)) {
    return (root.data as Array<{ id: number; nom_type: string }>).map(t => ({ id: t.id, nom_type: t.nom_type }));
  }
  return [];
}
function extractPatient(resp: unknown): Record<string, unknown> {
  const root = (resp as { data?: unknown })?.data ?? resp;
  return isObject(root) ? root : {};
}

export default function EditPatient() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [types, setTypes] = useState<TypePatient[]>([]);
  const [formData, setFormData] = useState({
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [typesRes, patientRes] = await Promise.all([
          apiFetch<unknown>("/v1/patients/types?per_page=100", { method: "GET" }, "company"),
          apiFetch<unknown>(`/v1/patients/${id}`, { method: "GET" }, "company"),
        ]);
        if (mounted) setTypes(extractTypesResponse(typesRes));
        const p = extractPatient(patientRes);
        if (mounted) setFormData({
          nom: String(p.nom ?? ""),
          postnom: String(p.postnom ?? ""),
          prenom: String(p.prenom ?? ""),
          email: String(p.email ?? ""),
          date_naissance: String(p.date_naissance ?? ""),
          sexe: String(p.sexe ?? ""),
          adresse: String(p.adresse ?? ""),
          contact: String(p.contact ?? ""),
          type_patient_id: String((p.type_patient_id as unknown) ?? (isObject(p.type) ? p.type?.id : "") ?? ""),
        });
      } catch {
        // noop
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const typePatientOptions = types.map(t => ({ value: String(t.id), label: t.nom_type }));

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nom.trim()) newErrors.nom = "Le nom est requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Le prénom est requis";
    if (!formData.date_naissance) newErrors.date_naissance = "La date de naissance est requise";
    if (!formData.sexe) newErrors.sexe = "Le sexe est requis";
    if (!formData.adresse.trim()) newErrors.adresse = "L'adresse est requise";
    if (!formData.contact.trim()) newErrors.contact = "Le contact est requis";
    if (!formData.type_patient_id) newErrors.type_patient_id = "Le type de patient est requis";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await apiFetch(`/v1/patients/${id}`, { method: "PUT", body: JSON.stringify(formData) }, "company");
      navigate("/patients");
    } catch {
      // noop
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du patient...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Modifier Patient | ClinLab ERP</title>
        <meta name="description" content="Modifier les informations d'un patient - ClinLab ERP" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/patients" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Modifier Patient</h2>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 flex items-center"><UserIcon className="mr-2 h-5 w-5" />Informations de base</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div><Label htmlFor="nom">Nom <span className="text-red-500">*</span></Label><Input id="nom" type="text" placeholder="Nom de famille" value={formData.nom} onChange={(e) => handleInputChange("nom", e.target.value)} className={errors.nom ? "border-red-500" : ""} />{errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}</div>
                <div><Label htmlFor="postnom">Postnom</Label><Input id="postnom" type="text" placeholder="Postnom (optionnel)" value={formData.postnom} onChange={(e) => handleInputChange("postnom", e.target.value)} /></div>
                <div><Label htmlFor="prenom">Prénom <span className="text-red-500">*</span></Label><Input id="prenom" type="text" placeholder="Prénom" value={formData.prenom} onChange={(e) => handleInputChange("prenom", e.target.value)} className={errors.prenom ? "border-red-500" : ""} />{errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}</div>
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="exemple@email.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className={errors.email ? "border-red-500" : ""} />{errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}</div>
                <div><Label htmlFor="date_naissance">Date de naissance <span className="text-red-500">*</span></Label><DatePicker id="date_naissance" placeholder="Sélectionner une date" defaultDate={formData.date_naissance ? new Date(formData.date_naissance) : undefined} onChange={(_dates, dateStr) => handleInputChange("date_naissance", dateStr)} />{errors.date_naissance && <p className="mt-1 text-sm text-red-500">{errors.date_naissance}</p>}</div>
                <div><Label htmlFor="sexe">Sexe <span className="text-red-500">*</span></Label><Select options={[{ value: "M", label: "Masculin" }, { value: "F", label: "Féminin" }]} placeholder="Sélectionner le sexe" defaultValue={formData.sexe} onChange={(value) => handleInputChange("sexe", value)} className={errors.sexe ? "border-red-500" : ""} />{errors.sexe && <p className="mt-1 text-sm text-red-500">{errors.sexe}</p>}</div>
              </div>
            </div>

            <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Informations de contact</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div><Label htmlFor="adresse">Adresse <span className="text-red-500">*</span></Label><Input id="adresse" type="text" placeholder="Adresse complète" value={formData.adresse} onChange={(e) => handleInputChange("adresse", e.target.value)} className={errors.adresse ? "border-red-500" : ""} />{errors.adresse && <p className="mt-1 text-sm text-red-500">{errors.adresse}</p>}</div>
                <div><Label htmlFor="contact">Contact <span className="text-red-500">*</span></Label><Input id="contact" type="tel" placeholder="+243 123 456 789" value={formData.contact} onChange={(e) => handleInputChange("contact", e.target.value)} className={errors.contact ? "border-red-500" : ""} />{errors.contact && <p className="mt-1 text-sm text-red-500">{errors.contact}</p>}</div></div>
            </div>

            <div className="space-y-4"><h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Informations médicales</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div><Label htmlFor="type_patient">Type de patient <span className="text-red-500">*</span></Label><Select options={typePatientOptions} placeholder="Sélectionner le type" defaultValue={formData.type_patient_id} onChange={(value) => handleInputChange("type_patient_id", value)} className={errors.type_patient_id ? "border-red-500" : ""} />{errors.type_patient_id && <p className="mt-1 text-sm text-red-500">{errors.type_patient_id}</p>}</div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Link to="/patients" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</Link>
              <button type="submit" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-sm font-medium text-white hover:bg-opacity-90"><CheckLineIcon className="mr-2 h-4 w-4" />Enregistrer les modifications</button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
} 