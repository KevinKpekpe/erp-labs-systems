<?php

namespace App\Http\Controllers\Api\Compagnies\Billing;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Payment;
use App\Support\ApiResponse;
use App\Services\AuditService;

class InvoiceController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $status = request('status');
        $code = request('code');
        $dateFrom = request('date_from');
        $dateTo = request('date_to');

        $query = Invoice::where('company_id', $companyId)
            ->with(['patient:id,nom,postnom,prenom'])
            ->search($q)
            ->when($status, fn($q2) => $q2->where('statut_facture', $status))
            ->when($code, fn($q2) => $q2->where('code', 'LIKE', "%$code%"))
            ->when($dateFrom, fn($q2) => $q2->whereDate('date_facture', '>=', $dateFrom))
            ->when($dateTo, fn($q2) => $q2->whereDate('date_facture', '<=', $dateTo))
            ->orderByDesc('date_facture');

        return ApiResponse::success($query->paginate($perPage), 'invoices.list');
    }

    public function byPatient(int $patientId)
    {
        $companyId = request()->user()->company_id;
        $perPage = (int) (request('per_page') ?? 15);
        $q = request('q') ?? request('search');
        $status = request('status');
        $invoices = Invoice::where('company_id', $companyId)
            ->where('patient_id', $patientId)
            ->with(['patient:id,nom,postnom,prenom'])
            ->search($q)
            ->when($status, fn($q2) => $q2->where('statut_facture', $status))
            ->orderByDesc('date_facture')
            ->paginate($perPage);
        return ApiResponse::success($invoices, 'invoices.list');
    }

    public function show(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);
        $invoice->load([
            'patient:id,nom,postnom,prenom',
            'details:id,facture_id,examen_id,prix_unitaire_facture',
            'details.exam:id,nom_examen',
            'payments:id,facture_id,date_paiement,montant_paye,methode_paiement,reference_paiement',
        ]);
        return ApiResponse::success($invoice, 'invoices.details');
    }

    public function destroy(Invoice $invoice)
    {
        $this->authorizeInvoice($invoice);
        // Déjà annulée
        if ($invoice->statut_facture === 'Annulée') {
            return ApiResponse::error('invoices.already_cancelled', 422, 'ALREADY_CANCELLED');
        }

        // Interdire l'annulation si des paiements existent (même partiels)
        $sum = Payment::where('company_id', request()->user()->company_id)
            ->where('facture_id', $invoice->id)
            ->sum('montant_paye');
        if ($sum > 0.00001) {
            return ApiResponse::error('invoices.cannot_cancel_with_payments', 422, 'CANNOT_CANCEL');
        }

        // Annulation logique: statut Annulée, pas de suppression
        $invoice->update(['statut_facture' => 'Annulée']);

        // Audit
        AuditService::log('INVOICE_CANCELLED', 'factures', $invoice->id, 'Facture annulée par l\'utilisateur');

        return ApiResponse::success($invoice->fresh(), 'invoices.cancelled');
    }

    private function authorizeInvoice(Invoice $invoice): void
    {
        if ($invoice->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


