<?php

namespace App\Http\Controllers\Api\Compagnies\Billing;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Support\ApiResponse;
use Carbon\Carbon;

class BillingDashboardController extends Controller
{
    public function metrics()
    {
        $companyId = request()->user()->company_id;

        // Comptes de factures par statut
        $totalInvoices = Invoice::where('company_id', $companyId)->count();
        $countPaid = Invoice::where('company_id', $companyId)->where('statut_facture', 'Payée')->count();
        $countPartial = Invoice::where('company_id', $companyId)->where('statut_facture', 'Partiellement payée')->count();
        $countPending = Invoice::where('company_id', $companyId)->where('statut_facture', 'En attente de paiement')->count();
        $countCancelled = Invoice::where('company_id', $companyId)->where('statut_facture', 'Annulée')->count();

        // Sommes des paiements
        $sumPayments = (float) Payment::where('company_id', $companyId)->sum('montant_paye');
        $sumToday = (float) Payment::where('company_id', $companyId)
            ->whereDate('date_paiement', Carbon::today())
            ->sum('montant_paye');
        $sumThisMonth = (float) Payment::where('company_id', $companyId)
            ->whereYear('date_paiement', Carbon::now()->year)
            ->whereMonth('date_paiement', Carbon::now()->month)
            ->sum('montant_paye');

        // Restant dû global (hors factures annulées)
        $totalInvoiced = (float) Invoice::where('company_id', $companyId)
            ->where('statut_facture', '!=', 'Annulée')
            ->sum('montant_total');
        $outstanding = max(0.0, $totalInvoiced - $sumPayments);

        // Revenus des 6 derniers mois (par paiements)
        $months = [];
        for ($i = 5; $i >= 0; $i--) {
            $d = Carbon::now()->subMonths($i);
            $label = $d->format('m/Y');
            $sum = (float) Payment::where('company_id', $companyId)
                ->whereYear('date_paiement', $d->year)
                ->whereMonth('date_paiement', $d->month)
                ->sum('montant_paye');
            $months[] = ['label' => $label, 'amount' => $sum];
        }

        return ApiResponse::success([
            'invoices' => [
                'total' => $totalInvoices,
                'paid' => $countPaid,
                'partial' => $countPartial,
                'pending' => $countPending,
                'cancelled' => $countCancelled,
            ],
            'payments' => [
                'sum_total' => $sumPayments,
                'sum_today' => $sumToday,
                'sum_this_month' => $sumThisMonth,
            ],
            'outstanding' => $outstanding,
            'revenue_months' => $months,
        ], 'billing.dashboard.metrics');
    }
}


