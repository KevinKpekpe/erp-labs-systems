<?php

namespace App\Services\Reports;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FinancialReportService extends BaseReportService
{
    /**
     * Génère les données du rapport financier
     */
    public function generate(): array
    {
        $data = [
            'summary' => $this->generateSummary(),
            'invoices' => $this->getInvoices(),
            'payments' => $this->getPayments(),
            'revenue_by_month' => $this->getRevenueByMonth(),
            'outstanding_amounts' => $this->getOutstandingAmounts(),
            'report_info' => [
                'title' => 'Rapport Financier',
                'period_description' => $this->getPeriodDescription(),
                'start_date' => $this->startDate->format('d/m/Y'),
                'end_date' => $this->endDate->format('d/m/Y'),
                'generated_at' => Carbon::now()->format('d/m/Y H:i:s'),
            ],
            'company' => $this->getCompanyInfo(),
            'user' => $this->getUserInfo(),
        ];

        return $data;
    }

    /**
     * Génère le résumé financier
     */
    private function generateSummary(): array
    {
        $totalInvoices = DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->count();

        $totalRevenue = DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->where('factures.statut_facture', 'Payée')
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->sum('montant_total');

        $pendingAmount = DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->whereIn('factures.statut_facture', ['En attente de paiement', 'Partiellement payée'])
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->sum('montant_total');

        $totalPayments = DB::table('paiements')
            ->where('paiements.company_id', $this->companyId)
            ->whereBetween('paiements.date_paiement', [$this->startDate, $this->endDate])
            ->sum('montant_paye');

        return [
            'total_invoices' => $totalInvoices,
            'total_revenue' => $this->formatCDF($totalRevenue),
            'pending_amount' => $this->formatCDF($pendingAmount),
            'total_payments' => $this->formatCDF($totalPayments),
            'payment_rate' => $totalRevenue > 0 ? round(($totalPayments / $totalRevenue) * 100, 2) : 0,
        ];
    }

    /**
     * Obtient la liste des factures
     */
    private function getInvoices()
    {
        return DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->leftJoin('demande_examens', 'factures.demande_id', '=', 'demande_examens.id')
            ->leftJoin('patients', 'factures.patient_id', '=', 'patients.id')
            ->select([
                'factures.*',
                'patients.nom as patient_nom',
                'patients.postnom as patient_postnom',
                'patients.prenom as patient_prenom'
            ])
            ->orderByDesc('factures.date_facture')
            ->limit(100)
            ->get();
    }

    /**
     * Obtient la liste des paiements
     */
    private function getPayments()
    {
        return DB::table('paiements')
            ->where('paiements.company_id', $this->companyId)
            ->whereBetween('paiements.date_paiement', [$this->startDate, $this->endDate])
            ->leftJoin('factures', 'paiements.facture_id', '=', 'factures.id')
            ->select([
                'paiements.*',
                'factures.code as facture_code'
            ])
            ->orderByDesc('paiements.date_paiement')
            ->limit(100)
            ->get();
    }

    /**
     * Obtient les revenus par mois
     */
    private function getRevenueByMonth()
    {
        return DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->where('factures.statut_facture', 'Payée')
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->select([
                DB::raw('YEAR(factures.date_facture) as year'),
                DB::raw('MONTH(factures.date_facture) as month'),
                DB::raw('SUM(factures.montant_total) as total_revenue'),
                DB::raw('COUNT(*) as invoice_count')
            ])
            ->groupBy('year', 'month')
            ->orderBy('year')
            ->orderBy('month')
            ->get()
            ->map(function ($item) {
                $item->month_name = Carbon::createFromDate($item->year, $item->month, 1)->format('F');
                $item->formatted_revenue = $this->formatCDF($item->total_revenue);
                return $item;
            });
    }

    /**
     * Obtient les montants impayés
     */
    private function getOutstandingAmounts()
    {
        return DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->whereIn('factures.statut_facture', ['En attente de paiement', 'Partiellement payée'])
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->leftJoin('demande_examens', 'factures.demande_id', '=', 'demande_examens.id')
            ->leftJoin('patients', 'factures.patient_id', '=', 'patients.id')
            ->select([
                'factures.*',
                'patients.nom as patient_nom',
                'patients.postnom as patient_postnom',
                'patients.prenom as patient_prenom'
            ])
            ->orderByDesc('factures.date_facture')
            ->limit(50)
            ->get();
    }

    /**
     * Obtient la description de la période
     */
    private function getPeriodDescription(): string
    {
        if ($this->filters['period'] === 'custom') {
            return "Du {$this->startDate->format('d/m/Y')} au {$this->endDate->format('d/m/Y')}";
        }

        $periods = [
            'today' => 'Aujourd\'hui',
            'week' => 'Cette semaine',
            'month' => 'Ce mois',
            'quarter' => 'Ce trimestre',
            'year' => 'Cette année',
            'last_7_days' => '7 derniers jours',
            'last_30_days' => '30 derniers jours',
            'last_90_days' => '90 derniers jours',
            'last_year' => 'Année précédente',
        ];

        return $periods[$this->filters['period']] ?? 'Période inconnue';
    }

    /**
     * Obtient les informations de la compagnie
     */
    private function getCompanyInfo()
    {
        return DB::table('companies')
            ->where('id', $this->companyId)
            ->first();
    }

    /**
     * Obtient les informations de l'utilisateur
     */
    private function getUserInfo()
    {
        $user = request()->user();
        return [
            'username' => $user->username ?? 'Système',
            'email' => $user->email ?? 'N/A',
        ];
    }
}
