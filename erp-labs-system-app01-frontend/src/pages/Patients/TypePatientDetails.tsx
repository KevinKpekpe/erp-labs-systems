import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, UserIcon, PencilIcon, UserCircleIcon } from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import { Link, useParams } from "react-router";

// Interface pour un type de patient
interface TypePatient {
  type_patient_id: number;
  code: string;
  nom_type: string;
  description?: string;
  nombre_patients: number;
}

// Données de test pour un type de patient
const mockTypePatient: TypePatient = {
  type_patient_id: 1,
  code: "TP001",
  nom_type: "Résident",
  description: "Patient hospitalisé dans l'établissement. Ce type de patient bénéficie d'une prise en charge complète et d'un suivi médical continu.",
  nombre_patients: 15
};

export default function TypePatientDetails() {
  const { id } = useParams<{ id: string }>();
  const [typePatient, setTypePatient] = useState<TypePatient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les données du type de patient
  useEffect(() => {
    // Simuler le chargement des données depuis l'API
    setTimeout(() => {
      setTypePatient(mockTypePatient);
      setIsLoading(false);
    }, 500);
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement du type de patient...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!typePatient) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Type de patient non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails Type de Patient | ClinLab ERP</title>
        <meta name="description" content="Détails du type de patient - ClinLab ERP" />
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
              Détails du Type de Patient
            </h2>
          </div>
          
          <Link
            to={`/types-patients/${typePatient.type_patient_id}/modifier`}
            className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            Modifier
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Informations du type de patient */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/20">
                  <UserCircleIcon className="h-8 w-8 text-brand-600 dark:text-brand-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {typePatient.nom_type}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{typePatient.code}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-3">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {typePatient.nom_type}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Nom du type</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <UserCircleIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {typePatient.code}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Code</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Description
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {typePatient.description || "Aucune description disponible"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {typePatient.nombre_patients} patient(s)
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Nombre de patients de ce type</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques et actions */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Statistiques
              </h3>

              <div className="space-y-4">
                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Patients de ce type
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Total dans le système
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                        {typePatient.nombre_patients}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Statut
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Actif dans le système
                      </p>
                    </div>
                    <div>
                      <Badge color="success">Actif</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  to={`/types-patients/${typePatient.type_patient_id}/modifier`}
                  className="w-full inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Modifier le Type
                </Link>
                
                <Link
                  to="/types-patients"
                  className="w-full inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  Voir tous les types
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 