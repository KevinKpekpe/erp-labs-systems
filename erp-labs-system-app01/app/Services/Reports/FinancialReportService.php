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
        // Debug: Vérifions les dates utilisées
        Log::info('Debug financial report dates:', [
            'company_id' => $this->companyId,
            'start_date' => $this->startDate->format('Y-m-d H:i:s'),
            'end_date' => $this->endDate->format('Y-m-d H:i:s'),
            'period' => $this->filters['period'] ?? 'unknown'
        ]);

        $totalInvoices = DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->count();

        // Debug: Vérifions les factures dans la période
        $debugInvoices = DB::table('factures')
            ->where('factures.company_id', $this->companyId)
            ->whereBetween('factures.date_facture', [$this->startDate, $this->endDate])
            ->select(['id', 'code', 'date_facture', 'montant_total', 'statut_facture'])
            ->get();

        Log::info('Debug invoices in period:', [
            'invoices_count' => $debugInvoices->count(),
            'invoices_data' => $debugInvoices->toArray()
        ]);

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

        // Debug: Vérifions les valeurs pour le taux de paiement
        Log::info('Debug payment rate calculation:', [
            'company_id' => $this->companyId,
            'total_revenue' => $totalRevenue,
            'pending_amount' => $pendingAmount,
            'total_payments' => $totalPayments,
            'old_formula' => $totalRevenue > 0 ? ($totalPayments / $totalRevenue) * 100 : 0,
            'new_formula' => $totalRevenue > 0 ? ($totalRevenue / ($totalRevenue + $pendingAmount)) * 100 : 0
        ]);

        return [
            'total_invoices' => $totalInvoices,
            'total_revenue' => $totalRevenue,
            'pending_amount' => $pendingAmount,
            'total_payments' => $totalPayments,
            'payment_rate' => $totalRevenue > 0 ? round(($totalRevenue / ($totalRevenue + $pendingAmount)) * 100, 2) : 0,
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
        // Debug: Vérifions les paiements dans la période
        $debugPayments = DB::table('paiements')
            ->where('paiements.company_id', $this->companyId)
            ->whereBetween('paiements.date_paiement', [$this->startDate, $this->endDate])
            ->select(['id', 'facture_id', 'montant_paye', 'date_paiement', 'methode_paiement'])
            ->get();

        Log::info('Debug payments in period:', [
            'company_id' => $this->companyId,
            'start_date' => $this->startDate->format('Y-m-d H:i:s'),
            'end_date' => $this->endDate->format('Y-m-d H:i:s'),
            'payments_count' => $debugPayments->count(),
            'payments_data' => $debugPayments->toArray()
        ]);

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
            ->get()
            ->map(function ($payment) {
                $payment->montant_paye = (float) $payment->montant_paye; // Convertir en nombre
                return $payment;
            });
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
                $item->total_revenue = (float) $item->total_revenue; // Convertir en nombre
                $item->invoice_count = (int) $item->invoice_count; // Convertir en nombre
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
            ->leftJoin('paiements', function($join) {
                $join->on('paiements.facture_id', '=', 'factures.id')
                     ->where('paiements.company_id', '=', 'factures.company_id');
            })
            ->select([
                'factures.*',
                'patients.nom as patient_nom',
                'patients.postnom as patient_postnom',
                'patients.prenom as patient_prenom',
                DB::raw('COALESCE(SUM(paiements.montant_paye), 0) as montant_paye'),
                DB::raw('factures.montant_total - COALESCE(SUM(paiements.montant_paye), 0) as reste_a_payer')
            ])
            ->groupBy('factures.id', 'factures.company_id', 'factures.code', 'factures.demande_id', 'factures.patient_id', 'factures.montant_total', 'factures.statut_facture', 'factures.date_facture', 'factures.created_at', 'factures.updated_at', 'patients.nom', 'patients.postnom', 'patients.prenom')
            ->orderByDesc('factures.date_facture')
            ->limit(50)
            ->get()
            ->map(function ($outstanding) {
                $outstanding->montant_paye = (float) $outstanding->montant_paye; // Convertir en nombre
                $outstanding->reste_a_payer = (float) $outstanding->reste_a_payer; // Convertir en nombre
                $outstanding->montant_total = (float) $outstanding->montant_total; // Convertir en nombre
                return $outstanding;
            });
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
