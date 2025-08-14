import { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { UserIcon, PlusIcon, UserCircleIcon, PencilIcon, TrashBinIcon, CheckLineIcon } from "../../icons";
import Input from "../../components/form/input/InputField";
import Modal from "../../components/ui/Modal";
import Alert from "../../components/ui/alert/Alert";
import { Link, useLocation, useNavigate } from "react-router";
import { apiFetch } from "../../lib/apiClient";

interface Medecin {
  id: number;
  code: string;
  nom: string;
  prenom: string;
  date_naissance: string;
  sexe: 'M' | 'F' | string;
  contact: string;
  numero_identification: string;
}

function isObject(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
function isMedecinDTO(v: unknown): v is Record<string, unknown> {
  return isObject(v) && (typeof (v as Record<string, unknown>).id === 'number' || typeof (v as Record<string, unknown>).medecin_id === 'number') && typeof (v as Record<string, unknown>).nom === 'string' && typeof (v as Record<string, unknown>).prenom === 'string';
}
function normalizeMedecin(dto: Record<string, unknown>): Medecin {
  return {
    id: (dto.id as number) ?? (dto.medecin_id as number),
    code: String(dto.code ?? ''),
    nom: String(dto.nom ?? ''),
    prenom: String(dto.prenom ?? ''),
    date_naissance: String(dto.date_naissance ?? ''),
    sexe: String(dto.sexe ?? ''),
    contact: String(dto.contact ?? ''),
    numero_identification: String(dto.numero_identification ?? ''),
  };
}
function extractMedecins(resp: unknown): Medecin[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  if (Array.isArray(root) && root.every(isMedecinDTO)) return (root as Record<string, unknown>[]).map(normalizeMedecin);
  if (isObject(root)) {
    const data = (root as Record<string, unknown>).data as unknown;
    if (Array.isArray(data) && data.every(isMedecinDTO)) return (data as Record<string, unknown>[]).map(normalizeMedecin);
  }
  return [];
}

export default function MedecinList() {
  const [items, setItems] = useState<Medecin[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showTrashed, setShowTrashed] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; medecin: Medecin | null; hard?: boolean }>({ isOpen: false, medecin: null, hard: false });

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
          const res = await apiFetch<unknown>("/v1/doctors-trashed", { method: "GET" }, "company");
          if (mounted) setItems(extractMedecins(res));
        } else {
          const res = await apiFetch<unknown>("/v1/doctors?per_page=100", { method: "GET" }, "company");
          if (mounted) setItems(extractMedecins(res));
        }
      } catch {
        /* noop */
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [showTrashed]);

  const filteredMedecins = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return items.filter(m => `${m.nom} ${m.prenom}`.toLowerCase().includes(q) || `${m.code}`.toLowerCase().includes(q) || `${m.numero_identification}`.toLowerCase().includes(q));
  }, [items, searchTerm]);

  const handleDeleteClick = (medecin: Medecin, hard = false) => setDeleteModal({ isOpen: true, medecin, hard });
  const handleCloseDeleteModal = () => setDeleteModal({ isOpen: false, medecin: null, hard: false });

  const handleConfirmDelete = async () => {
    if (!deleteModal.medecin) return;
    try {
      if (showTrashed && deleteModal.hard) {
        await apiFetch(`/v1/doctors/${deleteModal.medecin.id}/force`, { method: "DELETE" }, "company");
        setSuccessMessage("Médecin supprimé définitivement avec succès.");
      } else {
        await apiFetch(`/v1/doctors/${deleteModal.medecin.id}`, { method: "DELETE" }, "company");
        setSuccessMessage("Médecin supprimé avec succès.");
      }
      setItems(prev => prev.filter(i => i.id !== deleteModal.medecin!.id));
    } catch {
      /* noop */
    }
    handleCloseDeleteModal();
  };

  const handleRestore = async (medecin: Medecin) => {
    try {
      await apiFetch(`/v1/doctors/${medecin.id}/restore`, { method: "POST" }, "company");
      setItems(prev => prev.filter(i => i.id !== medecin.id));
      setSuccessMessage("Médecin restauré avec succès.");
    } catch {
      /* noop */
    }
  };

  return (
    <>
      <Helmet>
        <title>Liste des Médecins | ClinLab ERP</title>
        <meta name="description" content="Gestion des médecins - Liste complète des médecins du laboratoire" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-semibold text-black dark:text-white">Gestion des Médecins</h2>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowTrashed(v => !v)} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
              {showTrashed ? 'Voir actifs' : 'Corbeille'}
            </button>
            {!showTrashed && (
              <Link to="/medecins/nouveau" className="inline-flex items-center justify-center rounded-md bg-brand-500 px-6 py-2.5 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                <PlusIcon className="mr-2 h-4 w-4" />
                Nouveau Médecin
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
            <Input type="text" placeholder="Rechercher par nom, prénom, code ou numéro d'identification..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4" />
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><UserIcon className="h-6 w-6 text-brand-500" /></div>
            <div className="mt-4.5"><h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{filteredMedecins.length}</h4><p className="text-sm font-medium text-gray-500 dark:text-gray-400">{showTrashed ? 'Supprimés trouvés' : 'Médecins trouvés'}</p></div>
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
                  <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Médecin</th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Code</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Date de naissance</th>
                  <th className="min-w-[180px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Numéro d'Identification</th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Contact</th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {loading ? (
                  <tr><td className="py-8 px-4" colSpan={6}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td></tr>
                ) : filteredMedecins.map((medecin) => (
                  <tr key={medecin.id}>
                    <td className="py-5 px-4 pl-9 xl:pl-11"><div className="flex flex-col"><h5 className="font-medium text-gray-800 dark:text-white/90">Dr. {medecin.nom} {medecin.prenom}</h5><p className="text-sm text-gray-500 dark:text-gray-400">{medecin.sexe === 'M' ? 'Homme' : 'Femme'}</p></div></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90 font-medium">{medecin.code}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{medecin.date_naissance ? new Date(medecin.date_naissance).toLocaleDateString('fr-FR') : '-'}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{medecin.numero_identification}</p></td>
                    <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{medecin.contact}</p></td>
                    <td className="py-5 px-4">
                      <div className="flex items-center space-x-3.5">
                        {!showTrashed ? (
                          <>
                            <Link to={`/medecins/${medecin.id}`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Voir les détails"><UserCircleIcon className="h-5 w-5" /></Link>
                            <Link to={`/medecins/${medecin.id}/modifier`} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-primary transition-colors" title="Modifier"><PencilIcon className="h-5 w-5" /></Link>
                            <button onClick={() => handleDeleteClick(medecin)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer"><TrashBinIcon className="h-5 w-5" /></button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleRestore(medecin)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-success dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-success transition-colors" title="Restaurer"><CheckLineIcon className="h-5 w-5" /></button>
                            <button onClick={() => handleDeleteClick(medecin, true)} className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-danger dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-danger transition-colors" title="Supprimer définitivement"><TrashBinIcon className="h-5 w-5" /></button>
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
          <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{showTrashed && deleteModal.hard ? 'Supprimer définitivement' : 'Supprimer le médecin'}</h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Êtes-vous sûr de vouloir {showTrashed && deleteModal.hard ? 'supprimer définitivement' : 'supprimer'} le médecin <span className="font-semibold text-gray-900 dark:text-white">Dr. {deleteModal.medecin?.nom} {deleteModal.medecin?.prenom}</span> ?</p>
          <div className="mt-6 flex justify-center space-x-3">
            <button onClick={handleCloseDeleteModal} className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">Annuler</button>
            <button onClick={handleConfirmDelete} className="inline-flex items-center justify-center rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700">Confirmer</button>
          </div>
        </div>
      </Modal>
    </>
  );
} 