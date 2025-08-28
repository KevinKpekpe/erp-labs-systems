<?php

namespace App\Http\Controllers\Api\Compagnies;

use App\Http\Controllers\Controller;
use App\Services\Reports\ReportFilterService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Log;

class ReportController extends Controller
{
    public function __construct(private ReportFilterService $filterService) {}

    /**
     * Obtient les options de filtres disponibles
     */
    public function getFilterOptions()
    {
        return ApiResponse::success([
            'periods' => array_keys(ReportFilterService::AVAILABLE_PERIODS),
            'group_by_options' => array_keys($this->filterService->getGroupByOptions()),
            'sort_options' => array_keys($this->filterService->getSortOptions()),
        ], 'reports.filter_options');
    }

    /**
     * Valide les filtres de rapport
     */
    public function validateFilters(Request $request)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);
            $dateRange = $this->filterService->getDateRange($filters);
            $periodDescription = $this->filterService->getPeriodDescription($filters);

            return ApiResponse::success([
                'filters' => $filters,
                'date_range' => $dateRange,
                'period_description' => $periodDescription,
                'is_valid' => true
            ], 'reports.filters_validated');
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        }
    }

    /**
     * Génère un rapport d'inventaire
     */
    public function inventoryReport(Request $request)
    {
        try {
            // Validation complète des filtres
            $filters = $this->filterService->validateAndTransform($request);
            $companyId = $request->user()->company_id;

            try {
                $reportService = new \App\Services\Reports\InventoryReportService($companyId, $filters);
                $data = $reportService->generate();

                return ApiResponse::success($data, 'reports.inventory.generated');

            } catch (\Exception $e) {
                return ApiResponse::error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500, 'REPORT_GENERATION_ERROR');
            }

        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        } catch (\Exception $e) {
            return ApiResponse::error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500, 'REPORT_GENERATION_ERROR');
        }
    }

    /**
     * Génère un rapport des examens
     */
    public function examsReport(Request $request)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);
            $companyId = $request->user()->company_id;

            try {
                $reportService = new \App\Services\Reports\ExamsReportService($companyId, $filters);
                $data = $reportService->generate();

                return ApiResponse::success($data, 'reports.exams.generated');

            } catch (\Exception $e) {
                return ApiResponse::error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500, 'REPORT_GENERATION_ERROR');
            }

        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        } catch (\Exception $e) {
            return ApiResponse::error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500, 'REPORT_GENERATION_ERROR');
        }
    }

    /**
     * Génère un rapport des patients
     */
    public function patientsReport(Request $request)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);

            // TODO: Implémenter le service de rapport des patients
            return ApiResponse::success([
                'message' => 'Rapport des patients en cours de développement',
                'filters' => $filters
            ], 'reports.patients.pending');
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        }
    }

    /**
     * Génère un rapport financier
     */
    public function financialReport(Request $request)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);
            $companyId = $request->user()->company_id;

            try {
                $reportService = new \App\Services\Reports\FinancialReportService($companyId, $filters);
                $data = $reportService->generate();

                return ApiResponse::success($data, 'reports.financial.generated');

            } catch (\Exception $e) {
                return ApiResponse::error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500, 'REPORT_GENERATION_ERROR');
            }

        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        } catch (\Exception $e) {
            return ApiResponse::error('Erreur lors de la génération du rapport: ' . $e->getMessage(), 500, 'REPORT_GENERATION_ERROR');
        }
    }

    /**
     * Génère un rapport RH
     */
    public function hrReport(Request $request)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);

            // TODO: Implémenter le service de rapport RH
            return ApiResponse::success([
                'message' => 'Rapport RH en cours de développement',
                'filters' => $filters
            ], 'reports.hr.pending');
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        }
    }

    /**
     * Génère un rapport personnalisé
     */
    public function customReport(Request $request)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);
            $reportType = $request->input('report_type');

            if (empty($reportType)) {
                return ApiResponse::error('Le type de rapport est requis', 422, 'REPORT_TYPE_REQUIRED');
            }

            // TODO: Implémenter la logique de rapport personnalisé
            return ApiResponse::success([
                'message' => 'Rapport personnalisé en cours de développement',
                'report_type' => $reportType,
                'filters' => $filters
            ], 'reports.custom.pending');
        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        }
    }

    /**
     * Télécharge un rapport au format CSV
     */
    public function downloadReport(Request $request, string $reportType)
    {
        try {
            $filters = $this->filterService->validateAndTransform($request);
            $companyId = $request->user()->company_id;

            // Générer les données du rapport
            $data = $this->generateReportData($reportType, $companyId, $filters);

            if (!$data) {
                return ApiResponse::error('Type de rapport non supporté', 400, 'UNSUPPORTED_REPORT_TYPE');
            }

            // Générer le CSV
            $csvContent = $this->generateCSV($reportType, $data);
            $filename = "rapport_{$reportType}_{$filters['period']}_" . now()->format('Y-m-d') . '.csv';

            return response($csvContent)
                ->header('Content-Type', 'text/csv; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');

        } catch (\InvalidArgumentException $e) {
            return ApiResponse::error($e->getMessage(), 422, 'INVALID_FILTERS');
        } catch (\Exception $e) {
            return ApiResponse::error('Erreur lors du téléchargement: ' . $e->getMessage(), 500, 'DOWNLOAD_ERROR');
        }
    }

    /**
     * Génère les données d'un rapport selon le type
     */
    private function generateReportData(string $reportType, int $companyId, array $filters): ?array
    {
        switch ($reportType) {
            case 'inventory':
                $service = new \App\Services\Reports\InventoryReportService($companyId, $filters);
                break;
            case 'exams':
                $service = new \App\Services\Reports\ExamsReportService($companyId, $filters);
                break;
            case 'financial':
                $service = new \App\Services\Reports\FinancialReportService($companyId, $filters);
                break;
            default:
                return null;
        }

        return $service->generate();
    }

    /**
     * Génère le contenu CSV selon le type de rapport
     */
    private function generateCSV(string $reportType, array $data): string
    {
        $csv = [];

        switch ($reportType) {
            case 'inventory':
                $csv = $this->generateInventoryCSV($data);
                break;
            case 'exams':
                $csv = $this->generateExamsCSV($data);
                break;
            case 'financial':
                $csv = $this->generateFinancialCSV($data);
                break;
            default:
                $csv = [['Type de rapport non supporté']];
        }

        // Convertir en CSV
        $output = fopen('php://temp', 'r+');
        foreach ($csv as $row) {
            fputcsv($output, $row, ';');
        }
        rewind($output);
        $csvContent = stream_get_contents($output);
        fclose($output);

        return $csvContent;
    }

    /**
     * Génère le CSV pour l'inventaire
     */
    private function generateInventoryCSV(array $data): array
    {
        $csv = [];

        // En-têtes
        $csv[] = ['Rapport d\'Inventaire - ' . ($data['report_info']['period_description'] ?? 'Période')];
        $csv[] = ['Généré le: ' . ($data['report_info']['generated_at'] ?? now()->format('d/m/Y H:i:s'))];
        $csv[] = [];

        // Résumé
        if (isset($data['summary'])) {
            $csv[] = ['RÉSUMÉ'];
            $csv[] = ['Total Articles', $data['summary']['total_articles'] ?? 0];
            $csv[] = ['Valeur Totale', ($data['summary']['total_value'] ?? 0) . ' CDF'];
            $csv[] = ['Articles Critiques', $data['summary']['critical_articles_count'] ?? 0];
            $csv[] = ['Articles Expirés', $data['summary']['expired_items_count'] ?? 0];
            $csv[] = [];
        }

        // Articles
        if (isset($data['articles']) && count($data['articles']) > 0) {
            $csv[] = ['ARTICLES EN STOCK'];
            $csv[] = ['Article', 'Catégorie', 'Quantité', 'Prix Unitaire', 'Valeur'];

            foreach ($data['articles'] as $article) {
                $csv[] = [
                    $article->nom_article ?? 'N/A',
                    $article->nom_categorie ?? 'N/A',
                    $article->quantite_actuelle ?? 0,
                    ($article->prix_unitaire ?? 0) . ' CDF',
                    (($article->quantite_actuelle ?? 0) * ($article->prix_unitaire ?? 0)) . ' CDF'
                ];
            }
            $csv[] = [];
        }

        // Articles critiques
        if (isset($data['critical_articles']) && count($data['critical_articles']) > 0) {
            $csv[] = ['ARTICLES CRITIQUES'];
            $csv[] = ['Article', 'Quantité Actuelle', 'Seuil Critique'];

            foreach ($data['critical_articles'] as $article) {
                $csv[] = [
                    $article->nom_article ?? 'N/A',
                    $article->quantite_actuelle ?? 0,
                    $article->seuil_critique ?? 0
                ];
            }
        }

        return $csv;
    }

    /**
     * Génère le CSV pour les examens
     */
    private function generateExamsCSV(array $data): array
    {
        $csv = [];

        // En-têtes
        $csv[] = ['Rapport des Examens - ' . ($data['report_info']['period_description'] ?? 'Période')];
        $csv[] = ['Généré le: ' . ($data['report_info']['generated_at'] ?? now()->format('d/m/Y H:i:s'))];
        $csv[] = [];

        // Résumé
        if (isset($data['summary'])) {
            $csv[] = ['RÉSUMÉ'];
            $csv[] = ['Total Examens', $data['summary']['total_exams'] ?? 0];
            $csv[] = ['Terminés', $data['summary']['completed_exams'] ?? 0];
            $csv[] = ['En Attente', $data['summary']['pending_exams'] ?? 0];
            $csv[] = ['Taux de Réussite', ($data['summary']['completion_rate'] ?? 0) . '%'];
            $csv[] = [];
        }

        // Examens
        if (isset($data['exams']) && count($data['exams']) > 0) {
            $csv[] = ['LISTE DES EXAMENS'];
            $csv[] = ['Code', 'Patient', 'Médecin', 'Date', 'Statut'];

            foreach ($data['exams'] as $exam) {
                $csv[] = [
                    $exam->code ?? 'N/A',
                    ($exam->patient_nom ?? '') . ' ' . ($exam->patient_postnom ?? '') . ' ' . ($exam->patient_prenom ?? ''),
                    ($exam->medecin_nom ?? '') . ' ' . ($exam->medecin_prenom ?? ''),
                    $exam->date_demande ?? 'N/A',
                    $exam->statut_demande ?? 'N/A'
                ];
            }
        }

        return $csv;
    }

    /**
     * Génère le CSV pour le rapport financier
     */
    private function generateFinancialCSV(array $data): array
    {
        $csv = [];

        // En-têtes
        $csv[] = ['Rapport Financier - ' . ($data['report_info']['period_description'] ?? 'Période')];
        $csv[] = ['Généré le: ' . ($data['report_info']['generated_at'] ?? now()->format('d/m/Y H:i:s'))];
        $csv[] = [];

        // Résumé
        if (isset($data['summary'])) {
            $csv[] = ['RÉSUMÉ'];
            $csv[] = ['Total Factures', $data['summary']['total_invoices'] ?? 0];
            $csv[] = ['Revenus Totaux', ($data['summary']['total_revenue'] ?? 0) . ' CDF'];
            $csv[] = ['Montants en Attente', ($data['summary']['pending_amount'] ?? 0) . ' CDF'];
            $csv[] = ['Taux de Paiement', ($data['summary']['payment_rate'] ?? 0) . '%'];
            $csv[] = [];
        }

        // Factures
        if (isset($data['invoices']) && count($data['invoices']) > 0) {
            $csv[] = ['FACTURES'];
            $csv[] = ['Code', 'Patient', 'Montant', 'Statut', 'Date'];

            foreach ($data['invoices'] as $invoice) {
                $csv[] = [
                    $invoice->code ?? 'N/A',
                    ($invoice->patient_nom ?? '') . ' ' . ($invoice->patient_postnom ?? ''),
                    ($invoice->montant_total ?? 0) . ' CDF',
                    $invoice->statut_facture ?? 'N/A',
                    $invoice->date_facture ?? 'N/A'
                ];
            }
            $csv[] = [];
        }

        // Paiements
        if (isset($data['payments']) && count($data['payments']) > 0) {
            $csv[] = ['PAIEMENTS'];
            $csv[] = ['Facture', 'Montant', 'Méthode', 'Date'];

            foreach ($data['payments'] as $payment) {
                $csv[] = [
                    $payment->facture_code ?? 'N/A',
                    ($payment->montant ?? 0) . ' CDF',
                    $payment->methode_paiement ?? 'N/A',
                    $payment->date_paiement ?? 'N/A'
                ];
            }
        }

        return $csv;
    }
}
