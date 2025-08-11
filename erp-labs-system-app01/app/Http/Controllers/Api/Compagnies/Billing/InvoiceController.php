<?php

namespace App\Http\Controllers\Api\Compagnies\Billing;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Support\ApiResponse;

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
        // Autoriser l'annulation si non payée entièrement
        if ($invoice->statut_facture === 'Payée') {
            return ApiResponse::error('invoices.cannot_cancel_paid', 422, 'CANNOT_CANCEL');
        }
        $invoice->update(['statut_facture' => 'Annulée']);
        $invoice->delete();
        return ApiResponse::success(null, 'invoices.cancelled');
    }

    private function authorizeInvoice(Invoice $invoice): void
    {
        if ($invoice->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


