import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { UserIcon, PlusIcon, UserCircleIcon, PencilIcon, TrashBinIcon, CheckLineIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/alert/Alert";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../lib/apiClient";

interface TypePatient {
  id: number;
  code: string;
  nom_type: string;
  description?: string | null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
function isTypePatientDTO(value: unknown): value is { id: number; nom_type: string; code?: string; description?: string | null } {
  return (
    isObject(value) &&
    typeof (value as Record<string, unknown>).id === "number" &&
    typeof (value as Record<string, unknown>).nom_type === "string"
  );
}
function extractTypePatientList(resp: unknown): TypePatient[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  if (Array.isArray(root) && root.every(isTypePatientDTO)) {
    return (root as Array<{ id: number; nom_type: string; code?: string; description?: string | null }>).map((t) => ({
      id: t.id,
      nom_type: t.nom_type,
      code: String(t.code ?? ""),
      description: t.description ?? null,
    }));
  }
  if (isObject(root) && Array.isArray((root as { data?: unknown }).data)) {
    const arr = (root as { data: unknown }).data as unknown[];
    const filtered = arr.filter(isTypePatientDTO) as Array<{ id: number; nom_type: string; code?: string; description?: string | null }>;
    return filtered.map((t) => ({ id: t.id, nom_type: t.nom_type, code: String(t.code ?? ""), description: t.description ?? null }));
  }
  return [];
}

export default function TypePatientList() {
  const [items, setItems] = useState<TypePatient[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrashed, setShowTrashed] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; typePatient: TypePatient | null; hard?: boolean }>({ isOpen: false, typePatient: null, hard: false });

  const location = useLocation();
  const navigate = useNavigate();

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
    let mounted = true;
    setLoading(true);
    (async () => {
      try {
        if (showTrashed) {
          const res = await apiFetch<unknown>("/v1/patients/types-trashed", { method: "GET" }, "company");
          const list = extractTypePatientList(res);
          if (mounted) setItems(list);
        } else {
          const res = await apiFetch<unknown>("/v1/patients/types?per_page=100", { method: "GET" }, "company");
          const list = extractTypePatientList(res);
          if (mounted) setItems(list);
        }
      } catch {
        /* noop */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showTrashed]);

  const filteredTypePatients = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter(tp => `${tp.nom_type}`.toLowerCase().includes(q) || `${tp.code}`.toLowerCase().includes(q) || `${tp.description ?? ""}`.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const handleDeleteClick = (typePatient: TypePatient, hard = false) => setDeleteModal({ isOpen: true, typePatient, hard });
  const handleCloseDeleteModal = () => setDeleteModal({ isOpen: false, typePatient: null, hard: false });

  const handleConfirmDelete = async () => {
    if (!deleteModal.typePatient) return;
    try {
      if (showTrashed && deleteModal.hard) {
        await apiFetch(`/v1/patients/types/${deleteModal.typePatient.id}/force`, { method: "DELETE" }, "company");
        setSuccessMessage("Type de patient supprimé définitivement avec succès.");
      } else {
        await apiFetch(`/v1/patients/types/${deleteModal.typePatient.id}`, { method: "DELETE" }, "company");
        setSuccessMessage("Type de patient supprimé avec succès.");
      }
      setItems(prev => prev.filter(i => i.id !== deleteModal.typePatient!.id));
    } catch {
      /* noop */
    }
    handleCloseDeleteModal();
  };

  const handleRestore = async (typePatient: TypePatient) => {
    try {
      await apiFetch(`/v1/patients/types/${typePatient.id}/restore`, { method: "POST" }, "company");
      setItems(prev => prev.filter(i => i.id !== typePatient.id));
      setSuccessMessage("Type de patient restauré avec succès.");
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <Helmet>
        <title>Types de Patients | ClinLab ERP</title>
        <meta name="description" content="Gestion des types de patients - Liste complète des types de patients du laboratoire" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Types de Patients</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              {showTrashed ? 'Voir actifs' : 'Corbeille'}
            </button>
            {!showTrashed && (
              <Link to="/types-patients/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nouveau Type
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
            <Input type="text" placeholder="Rechercher par nom, code ou description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><UserIcon className="h-6 w-6 text-brand-500" /></div>
            <div className="mt-4.5"><h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{filteredTypePatients.length}</h4><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{showTrashed ? 'Supprimés trouvés' : 'Types trouvés'}</p></div>
          </div>
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><UserIcon className="h-6 w-6 text-brand-500" /></div>
            <div className="mt-4.5"><h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{items.length}</h4><p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total {showTrashed ? 'corbeille' : 'actifs'}</p></div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Type de Patient</th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Code</th>
                  <th className="min-w-[200px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Description</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr><td className="py-8 px-4" colSpan={4}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>
                ) : filteredTypePatients.map((typePatient) => (
                  <tr key={typePatient.id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11"><div className="flex flex-col"><h5 className="font-medium text-gray-800 dark:text-white/90">{typePatient.nom_type}</h5></div></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90 font-medium">{typePatient.code}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-600 dark:text-gray-400">{typePatient.description || "Aucune description"}</p></td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        {!showTrashed ? (
                          <>
                            <Link to={`/types-patients/${typePatient.id}`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Voir les détails"><UserCircleIcon className="h-5 w-5" /></Link>
                            <Link to={`/types-patients/${typePatient.id}/modifier`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
                            <button onClick={() => handleDeleteClick(typePatient)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer"><TrashBinIcon className="h-5 w-5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleRestore(typePatient)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-success dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-success transition-colors" title="Restaurer"><CheckLineIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleDeleteClick(typePatient, true)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer définitivement"><TrashBinIcon className="h-5 w-5" /></button>
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

      <Modal isOpen={deleteModal.isOpen} onClose={handleCloseDeleteModal} title={showTrashed && deleteModal.hard ? "Confirmer la suppression définitive" : "Confirmer la suppression"} size="sm">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20"><TrashBinIcon className="h-6 w-6 text-red-600 dark:text-red-400" /></div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{showTrashed && deleteModal.hard ? 'Supprimer définitivement' : 'Supprimer le type de patient'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir {showTrashed && deleteModal.hard ? 'supprimer définitivement' : 'supprimer'} le type de patient <span className="font-semibold text-gray-900 dark:text-white">{deleteModal.typePatient?.nom_type}</span> ?</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={handleCloseDeleteModal} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={handleConfirmDelete} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
} 