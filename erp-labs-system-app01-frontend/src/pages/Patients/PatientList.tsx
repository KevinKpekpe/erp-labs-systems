import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { UserIcon, PlusIcon, UserCircleIcon, PencilIcon, TrashBinIcon, CheckLineIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Badge from "../../components/ui/badge/Badge";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/alert/Alert";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../lib/apiClient";

interface Patient {
  id: number;
  code: string;
  nom: string;
  postnom?: string | null;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F' | string;
  adresse: string;
  contact: string;
  type?: { nom_type?: string } | null;
  type_patient?: string | null;
}

export default function PatientList() {
  const [items, setItems] = useState<Patient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrashed, setShowTrashed] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; patient: Patient | null; hard?: boolean }>({ isOpen: false, patient: null, hard: false });

  const location = useLocation();
  const navigate = useNavigate();

  const load = useMemo(() => async (trashed: boolean) => {
    setLoading(true);
    try {
      if (trashed) {
        const res = await apiFetch<{ data: Patient[] }>("/v1/patients-trashed", { method: "GET" }, "company");
        setItems(((res.data as any)?.data as any) ?? (res.data as any) ?? []);
      } else {
        const res = await apiFetch<{ data: { data: Patient[] } }>("/v1/patients?per_page=100", { method: "GET" }, "company");
        const list = (res.data as any)?.data ?? [];
        setItems(list);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const state = (location.state as { success?: string } | null) || null;
    if (state?.success) {
      setSuccessMessage(state.success);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);

  useEffect(() => {
    load(showTrashed);
  }, [load, showTrashed]);

  const filteredPatients = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter((patient) => {
      const fullName = `${patient.nom} ${patient.postnom || ''} ${patient.prenom}`.toLowerCase();
      const code = `${patient.code}`.toLowerCase();
      return fullName.includes(q) || code.includes(q);
    });
  }, [items, searchTerm]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('fr-FR');
  const calculateAge = (dateString: string) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) age--;
    return age;
  };

  const getPatientTypeBadge = (patient: Patient) => {
    const display = patient.type?.nom_type || patient.type_patient || '';
    return display === "Résident" ? <Badge color="success">Résident</Badge> : <Badge color="warning">{display || 'Ambulant'}</Badge>;
  };

  const openDeleteModal = (patient: Patient, hard = false) => setDeleteModal({ isOpen: true, patient, hard });
  const closeDeleteModal = () => setDeleteModal({ isOpen: false, patient: null, hard: false });

  const confirmDelete = async () => {
    if (!deleteModal.patient) return;
    try {
      if (showTrashed && deleteModal.hard) {
        await apiFetch(`/v1/patients/${deleteModal.patient.id}/force`, { method: "DELETE" }, "company");
        setSuccessMessage("Patient supprimé définitivement avec succès.");
      } else {
        await apiFetch(`/v1/patients/${deleteModal.patient.id}`, { method: "DELETE" }, "company");
        setSuccessMessage("Patient supprimé avec succès.");
      }
      setItems((prev) => prev.filter((p) => p.id !== deleteModal.patient!.id));
    } catch {}
    closeDeleteModal();
  };

  const restore = async (patient: Patient) => {
    try {
      await apiFetch(`/v1/patients/${patient.id}/restore`, { method: "POST" }, "company");
    setItems((prev) => prev.filter((p) => p.id !== patient.id));
      setSuccessMessage("Patient restauré avec succès.");
    } catch {}
  };

  return (
    <>
      <Helmet>
        <title>Liste des Patients | ClinLab ERP</title>
        <meta name="description" content="Gestion des patients - Liste complète des patients du laboratoire" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Gestion des Patients</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTrashed((v) => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              {showTrashed ? 'Voir actifs' : 'Corbeille'}
            </button>
            {!showTrashed && (
              <Link to="/patients/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nouveau Patient
              </Link>
            )}
          </div>
        </div>

        {successMessage && (
          <div className="mb-6">
            <Alert variant="success" title="Succès" message={successMessage} />
          </div>
        )}

        <div className="mb-6">
          <div className="relative">
            <UserIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input type="text" placeholder="Rechercher par nom, prénom, postnom ou code..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><UserIcon className="h-6 w-6 text-brand-500" /></div>
            <div className="mt-4.5"><h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{filteredPatients.length}</h4><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{showTrashed ? 'Supprimés trouvés' : 'Patients trouvés'}</p></div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Patient</th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Code</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Âge/Sexe</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Type</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Contact</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr><td className="py-8 px-4" colSpan={6}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>
                ) : filteredPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11"><div className="flex flex-col"><h5 className="font-medium text-gray-800 dark:text-white/90">{patient.nom} {patient.postnom || ''} {patient.prenom}</h5><p className="text-sm text-gray-500 dark:text-gray-400">{patient.adresse}</p></div></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90 font-medium">{patient.code}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{patient.date_naissance ? `${calculateAge(patient.date_naissance)} ans / ${patient.sexe === 'M' ? 'M' : 'F'}` : '-'}</p><p className="text-sm text-gray-500 dark:text-gray-400">{patient.date_naissance ? formatDate(patient.date_naissance) : ''}</p></td>
                    <td className="py-5 px-4">{getPatientTypeBadge(patient)}</td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{patient.contact}</p></td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        {!showTrashed ? (
                          <>
                            <Link to={`/patients/${patient.id}`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Voir les détails"><UserCircleIcon className="h-5 w-5" /></Link>
                            <Link to={`/patients/${patient.id}/modifier`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
                            <button onClick={() => openDeleteModal(patient)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer"><TrashBinIcon className="h-5 w-5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => restore(patient)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-success dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-success transition-colors" title="Restaurer"><CheckLineIcon className="h-5 w-5" /></button>
                            <button onClick={() => openDeleteModal(patient, true)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer définitivement"><TrashBinIcon className="h-5 w-5" /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={deleteModal.isOpen} onClose={closeDeleteModal} title={showTrashed && deleteModal.hard ? "Confirmer la suppression définitive" : "Confirmer la suppression"} size="sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"><TrashBinIcon className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{showTrashed && deleteModal.hard ? 'Supprimer définitivement' : 'Supprimer le patient'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir {showTrashed && deleteModal.hard ? 'supprimer définitivement' : 'supprimer'} le patient <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.patient?.nom} {deleteModal.patient?.prenom}</span> ?</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={closeDeleteModal} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={confirmDelete} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
} 