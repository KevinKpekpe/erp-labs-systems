import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  BoxIcon,
  StockAlertIcon,
  StockWarningIcon,
  StockValueIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  UserIcon,
} from "../../icons";
import Badge from "../../components/ui/badge/Badge";
import { Link } from "react-router";
import { apiFetch } from "../../lib/apiClient";
import { formatCDF } from "../../lib/currency";

interface StockStats {
  totalArticles: number;
  articlesEnRupture: number;
  articlesCritiques: number;
  valeurTotale: number;
  mouvementsAujourdhui: number;
}

interface ArticleCritique {
  id: number;
  code: string;
  nom_article: string;
  quantite_actuelle: number;
  seuil_critique: number;
  categorie?: string | null;
}

interface MouvementRecent {
  id: number;
  code: string;
  nom_article: string;
  type_mouvement: "Entrée" | "Sortie" | string;
  quantite: number;
  date_mouvement: string;
  motif?: string | null;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractMetrics(resp: unknown): StockStats | null {
  const root = (resp as { data?: unknown })?.data ?? resp;
  if (!isObject(root)) return null;
  return {
    totalArticles: Number(root.totalArticles ?? 0),
    articlesEnRupture: Number(root.articlesEnRupture ?? 0),
    articlesCritiques: Number(root.articlesCritiques ?? 0),
    valeurTotale: Number(root.valeurTotale ?? 0),
    mouvementsAujourdhui: Number(root.mouvementsAujourdhui ?? 0),
  };
}

function extractArray<T>(resp: unknown, mapItem: (raw: Record<string, unknown>) => T): T[] {
  const root = (resp as { data?: unknown })?.data ?? resp;
  const data = isObject(root) && Array.isArray(root.data) ? (root.data as unknown[]) : Array.isArray(root) ? (root as unknown[]) : [];
  return data.filter(isObject).map((raw) => mapItem(raw as Record<string, unknown>));
}

export default function StocksDashboard() {
  const [stats, setStats] = useState<StockStats | null>(null);
  const [articlesCritiques, setArticlesCritiques] = useState<ArticleCritique[]>([]);
  const [mouvementsRecents, setMouvementsRecents] = useState<MouvementRecent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [metricsRes, criticalRes, movesRes] = await Promise.all([
          apiFetch<unknown>("/v1/stock/dashboard/metrics", { method: "GET" }, "company"),
          apiFetch<unknown>("/v1/stock/dashboard/critical?per_page=5", { method: "GET" }, "company"),
          apiFetch<unknown>("/v1/stock/dashboard/movements-recent?per_page=5", { method: "GET" }, "company"),
        ]);

        if (!mounted) return;

        setStats(extractMetrics(metricsRes));

        setArticlesCritiques(
          extractArray<ArticleCritique>(criticalRes, (raw) => ({
            id: Number(raw.id ?? 0),
            code: String(raw.code ?? ""),
            nom_article: String((raw.article as Record<string, unknown> | undefined)?.nom_article ?? ""),
            quantite_actuelle: Number(raw.quantite_actuelle ?? 0),
            seuil_critique: Number(raw.seuil_critique ?? 0),
            categorie: String(((raw.article as Record<string, unknown> | undefined)?.category as Record<string, unknown> | undefined)?.nom_categorie ?? ""),
          }))
        );

        setMouvementsRecents(
          extractArray<MouvementRecent>(movesRes, (raw) => ({
            id: Number(raw.id ?? 0),
            code: String(raw.code ?? ""),
            nom_article: String(((raw.stock as Record<string, unknown> | undefined)?.article as Record<string, unknown> | undefined)?.nom_article ?? ""),
            type_mouvement: String(raw.type_mouvement ?? ""),
            quantite: Number(raw.quantite ?? 0),
            date_mouvement: String(raw.date_mouvement ?? ""),
            motif: (raw.motif as string) ?? null,
          }))
        );
      } catch {
        // noop
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (amount: number) => formatCDF(amount);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMouvementBadge = (type: "Entrée" | "Sortie" | string) => {
    return type === "Entrée" ? (
      <Badge color="success" startIcon={<ArrowUpIcon className="w-3 h-3" />}>Entrée</Badge>
    ) : (
      <Badge color="error" startIcon={<ArrowDownIcon className="w-3 h-3" />}>Sortie</Badge>
    );
  };

  return (
    <>
      <Helmet>
        <title>Tableau de Bord - Stocks | ERP Laboratoire</title>
      </Helmet>

      <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-title-md2 font-bold text-black dark:text-white">Tableau de Bord - Stocks</h2>
          <nav>
            <ol className="flex items-center gap-2">
              <li>
                <Link className="font-medium" to="/">Accueil /</Link>
              </li>
              <li className="text-primary">Stocks</li>
            </ol>
          </nav>
        </div>

        {/* Cartes de statistiques */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5 mb-6">
          {/* Total Articles */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <BoxIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{loading ? "…" : (stats?.totalArticles ?? 0)}</h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Articles</p>
            </div>
          </div>

          {/* Articles en Rupture */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <StockAlertIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{loading ? "…" : (stats?.articlesEnRupture ?? 0)}</h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">En Rupture</p>
            </div>
          </div>

          {/* Articles Critiques */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <StockWarningIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{loading ? "…" : (stats?.articlesCritiques ?? 0)}</h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Critiques</p>
            </div>
          </div>

          {/* Valeur Totale */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
            <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
              <StockValueIcon className="h-6 w-6 text-brand-500" />
            </div>
            <div className="mt-4.5">
              <h4 className="text-title-md font-bold text-gray-800 dark:text-white/90">{loading ? "…" : formatCurrency(stats?.valeurTotale ?? 0)}</h4>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Valeur Totale</p>
            </div>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="grid grid-cols-12 gap-4 md:gap-6 2xl:gap-7.5">
          {/* Articles en situation critique */}
          <div className="col-span-12 xl:col-span-8">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Articles en Situation Critique</h3>
                <Link to="/stocks/articles" className="inline-flex items-center justify-center rounded-md bg-brand-500 py-2 px-10 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
                  <PlusIcon className="mr-2 h-4 w-4" />
                  Voir Tous
                </Link>
              </div>

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
                <div className="max-w-full overflow-x-auto">
                  <table className="w-full table-auto">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-white/[0.05]">
                        <th className="min-w-[220px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start xl:pl-11">Article</th>
                        <th className="min-w-[150px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Catégorie</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Quantité</th>
                        <th className="min-w-[120px] py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Seuil</th>
                        <th className="py-4 px-4 font-medium text-gray-500 dark:text-gray-400 text-start">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                      {loading ? (
                        <tr>
                          <td className="py-6 px-4" colSpan={5}><div className="h-4 w-32 bg-gray-200 rounded animate-pulse dark:bg-gray-800" /></td>
                        </tr>
                      ) : articlesCritiques.length === 0 ? (
                        <tr>
                          <td className="py-8 px-4" colSpan={5}>
                            <div className="text-center">
                              <UserIcon className="mx-auto h-10 w-10 text-gray-400" />
                              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Aucun article critique</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        articlesCritiques.map((article) => (
                          <tr key={article.id}>
                            <td className="py-5 px-4 pl-9 xl:pl-11">
                              <div className="flex flex-col">
                                <h5 className="font-medium text-gray-800 dark:text-white/90">{article.nom_article}</h5>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{article.code}</p>
                              </div>
                            </td>
                            <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{article.categorie || '-'}</p></td>
                            <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{article.quantite_actuelle}</p></td>
                            <td className="py-5 px-4"><p className="text-gray-800 dark:text-white/90">{article.seuil_critique}</p></td>
                            <td className="py-5 px-4">{article.quantite_actuelle === 0 ? (<Badge color="error">En Rupture</Badge>) : (<Badge color="warning">Critique</Badge>)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Mouvements récents */}
          <div className="col-span-12 xl:col-span-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">Mouvements Récents</h3>
                <Link to="/stocks/mouvements" className="inline-flex items-center justify-center rounded-md bg-brand-500 py-2 px-4 text-center font-medium text-white hover:bg-opacity-90">Voir Tous</Link>
              </div>

              <div className="space-y-4">
                {loading ? (
                  <div className="flex items-center space-x-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div><span className="text-gray-600 dark:text-gray-400">Chargement...</span></div>
                ) : mouvementsRecents.length === 0 ? (
                  <div className="text-center py-8"><UserIcon className="mx-auto h-12 w-12 text-gray-400" /><h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucun mouvement</h3><p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Aucun mouvement récent.</p></div>
                ) : (
                  mouvementsRecents.map((mouvement, index) => (
                    <div key={mouvement.id} className={`flex items-center justify-between pb-4 ${index < mouvementsRecents.length - 1 ? 'border-b border-gray-100 dark:border-white/[0.05]' : ''}`}>
                      <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4">
                          {mouvement.type_mouvement === 'Entrée' ? (<ArrowUpIcon className="h-5 w-5 text-brand-500" />) : (<ArrowDownIcon className="h-5 w-5 text-brand-500" />)}
                        </div>
                        <div>
                          <h5 className="font-medium text-gray-800 dark:text-white/90">{mouvement.nom_article}</h5>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{mouvement.motif || ''}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(mouvement.date_mouvement)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getMouvementBadge(mouvement.type_mouvement)}
                        <p className="text-sm font-medium text-gray-800 dark:text-white/90">{mouvement.quantite}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <h3 className="mb-6 text-xl font-semibold text-gray-800 dark:text-white/90">Actions Rapides</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Link to="/stocks/articles/nouveau" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-4 px-6 shadow-default transition-all hover:shadow-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:shadow-boxdark">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><PlusIcon className="h-5 w-5 text-brand-500" /></div>
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-white/90">Nouvel Article</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Ajouter un article</p>
                </div>
              </div>
            </Link>

            <Link to="/stocks/mouvements/nouveau" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-4 px-6 shadow-default transition-all hover:shadow-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:shadow-boxdark">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><ArrowUpIcon className="h-5 w-5 text-brand-500" /></div>
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-white/90">Mouvement</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Enregistrer un mouvement</p>
                </div>
              </div>
            </Link>

            <Link to="/stocks/categories" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-4 px-6 shadow-default transition-all hover:shadow-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:shadow-boxdark">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><BoxIcon className="h-5 w-5 text-brand-500" /></div>
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-white/90">Catégories</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Gérer les catégories</p>
                </div>
              </div>
            </Link>

            <Link to="/stocks/alertes" className="flex items-center justify-center rounded-lg border border-gray-200 bg-white py-4 px-6 shadow-default transition-all hover:shadow-1 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:shadow-boxdark">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-meta-2 dark:bg-meta-4"><StockAlertIcon className="h-5 w-5 text-brand-500" /></div>
                <div>
                  <h5 className="font-medium text-gray-800 dark:text-white/90">Alertes</h5>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Voir les alertes</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
} 