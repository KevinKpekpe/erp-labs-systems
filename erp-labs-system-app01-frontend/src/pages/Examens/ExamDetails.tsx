import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeftIcon, PencilIcon, TimeIcon } from "../../icons";
import { Link, useParams } from "react-router";
import { apiFetch } from "../../lib/apiClient";

type Article = { id: number; nom_article: string; quantite_utilisee?: number };
type Exam = {
  id: number;
  code: string;
  nom_examen: string;
  description?: string | null;
  prix?: number | null;
  delai_rendu_estime?: number | null;
  unites_mesure?: string | null;
  valeurs_reference?: string | null;
  type_echantillon?: string | null;
  conditions_pre_analytiques?: string | null;
  equipement_reactifs_necessaires?: string | null;
  articles?: Article[];
};

function isObject(v: unknown): v is Record<string, unknown> { return typeof v === 'object' && v !== null; }
function extractExam(resp: unknown): Exam | null {
  const root = (resp as { data?: unknown })?.data ?? resp;
  if (!isObject(root)) return null;
  const articles: Article[] = Array.isArray((root as any).articles) ? ((root as any).articles as any[]).filter(isObject).map(a => ({ id: Number((a as any).id ?? 0), nom_article: String((a as any).nom_article ?? ''), quantite_utilisee: Number((a as any).quantite_utilisee ?? 0) })) : [];
  return {
    id: Number((root as any).id ?? 0),
    code: String((root as any).code ?? ''),
    nom_examen: String((root as any).nom_examen ?? ''),
    description: (root as any).description ?? '',
    prix: typeof (root as any).prix === 'number' ? (root as any).prix : Number((root as any).prix ?? 0),
    delai_rendu_estime: Number((root as any).delai_rendu_estime ?? 0),
    unites_mesure: String((root as any).unites_mesure ?? ''),
    valeurs_reference: String((root as any).valeurs_reference ?? ''),
    type_echantillon: String((root as any).type_echantillon ?? ''),
    conditions_pre_analytiques: String((root as any).conditions_pre_analytiques ?? ''),
    equipement_reactifs_necessaires: String((root as any).equipement_reactifs_necessaires ?? ''),
    articles,
  };
}

export default function ExamDetails() {
  const { id } = useParams<{ id: string }>();
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiFetch<unknown>(`/v1/exams/${id}`, { method: 'GET' }, 'company');
        if (mounted) setExam(extractExam(res));
      } catch {
        // noop
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Chargement de l'examen...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Examen non trouvé</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Détails Examen | ClinLab ERP</title>
        <meta name="description" content="Détails de l'examen - ClinLab ERP" />
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link to="/examens" className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"><ChevronLeftIcon className="mr-2 h-4 w-4" />Retour</Link>
            <h2 className="text-title-md2 font-semibold text-black dark:text-white">Détails de l'examen</h2>
          </div>
          <Link to={`/examens/${exam.id}/modifier`} className="inline-flex items-center justify-center rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"><PencilIcon className="mr-2 h-4 w-4" />Modifier</Link>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{exam.nom_examen}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{exam.code}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Prix</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{typeof exam.prix === 'number' ? new Intl.NumberFormat('fr-CD', { style: 'currency', currency: 'CDF', maximumFractionDigits: 0 }).format(exam.prix) : '-'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <TimeIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{typeof exam.delai_rendu_estime === 'number' ? exam.delai_rendu_estime + ' h' : '-'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Délai rendu estimé</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Unité(s) de mesure</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.unites_mesure || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Type d'échantillon</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.type_echantillon || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Valeurs de référence</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.valeurs_reference || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Description</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{exam.description || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Conditions pré-analytiques</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{exam.conditions_pre_analytiques || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Équipements / Réactifs nécessaires</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white whitespace-pre-wrap">{exam.equipement_reactifs_necessaires || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
              <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Réactifs (articles) associés</h3><p className="text-sm text-gray-500 dark:text-gray-400">{exam.articles?.length || 0} article(s)</p></div>
              <div className="p-6">
                {(!exam.articles || exam.articles.length === 0) ? (
                  <div className="text-center py-8"><TimeIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun réactif</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Aucun article n'est associé à cet examen.</p></div>
                ) : (
                  <div className="max-w-full overflow-x-auto">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                          <th className="min-w-[220px] py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-6">Article</th>
                          <th className="min-w-[120px] py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Quantité utilisée</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                        {exam.articles!.map((a) => (
                          <tr key={a.id}>
                            <td className="py-4 px-4 pl-6 xl:pl-6"><span className="font-medium text-gray-900 dark:text-white">{a.nom_article}</span></td>
                            <td className="py-4 px-4"><span className="text-gray-900 dark:text-white">{typeof a.quantite_utilisee === 'number' ? a.quantite_utilisee : '-'}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
