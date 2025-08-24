<?php

namespace App\Http\Controllers\Api\Compagnies\Billing;

use App\Http\Controllers\Controller;
use App\Http\Requests\Compagnies\Billing\PaymentStoreRequest;
use App\Models\Invoice;
use App\Models\Payment;
use App\Support\ApiResponse;
use App\Support\CodeGenerator;
use Illuminate\Support\Facades\DB;

class PaymentController extends Controller
{
    public function index()
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $payments = Payment::where('company_id', $companyId)
            ->with(['invoice:id,code'])
            ->search($q)
            ->orderByDesc('date_paiement')
            ->paginate($perPage);
        return ApiResponse::success($payments, 'payments.list');
    }

    public function byPatient(int $patientId)
    {
        $companyId = request()->user()->company_id;
        $q = request('q') ?? request('search');
        $perPage = (int) (request('per_page') ?? 15);
        $payments = Payment::where('company_id', $companyId)
            ->whereHas('invoice', fn($q2) => $q2->where('patient_id', $patientId))
            ->with(['invoice:id,code'])
            ->search($q)
            ->orderByDesc('date_paiement')
            ->paginate($perPage);
        return ApiResponse::success($payments, 'payments.list');
    }

    public function store(PaymentStoreRequest $request)
    {
        $companyId = $request->user()->company_id;
        $data = $request->validated();

        $payment = DB::transaction(function () use ($companyId, $data) {
            $invoice = Invoice::where('company_id', $companyId)->findOrFail($data['facture_id']);

            // Empêcher le dépassement du montant total (somme des paiements existants + nouveau)
            $alreadyPaid = Payment::where('company_id', $companyId)
                ->where('facture_id', $invoice->id)
                ->sum('montant_paye');
            $newTotal = (float) $alreadyPaid + (float) $data['montant_paye'];
            if ($newTotal - (float) $invoice->montant_total > 0.00001) {
                return ApiResponse::error('payments.amount_exceeds_total', 422, 'AMOUNT_EXCEEDS_TOTAL');
            }

            $payment = Payment::create([
                'company_id' => $companyId,
                'code' => CodeGenerator::generate('paiements', $companyId, 'PAY'),
                'facture_id' => $invoice->id,
                'date_paiement' => $data['date_paiement'] ?? now(),
                'montant_paye' => $data['montant_paye'],
                'methode_paiement' => $data['methode_paiement'],
                'reference_paiement' => $data['reference_paiement'] ?? null,
            ]);

            // Recalcul du statut facture
            $sum = Payment::where('company_id', $companyId)
                ->where('facture_id', $invoice->id)
                ->sum('montant_paye');
            if ($sum <= 0) {
                $invoice->update(['statut_facture' => 'En attente de paiement']);
            } elseif ($sum + 0.00001 < (float) $invoice->montant_total) {
                $invoice->update(['statut_facture' => 'Partiellement payée']);
            } else {
                $invoice->update(['statut_facture' => 'Payée']);
            }

            return $payment;
        });

        return ApiResponse::success($payment, 'payments.created', [], 201);
    }

    public function show(Payment $payment)
    {
        $this->authorizePayment($payment);
        $payment->load(['invoice:id,code,statut_facture,montant_total']);
        return ApiResponse::success($payment, 'payments.details');
    }

    public function destroy(Payment $payment)
    {
        $this->authorizePayment($payment);
        $companyId = request()->user()->company_id;
        $invoice = Invoice::where('company_id', $companyId)->findOrFail($payment->facture_id);
        $payment->delete();
        // Re-calc statut facture après annulation (soft delete)
        $sum = Payment::where('company_id', $companyId)
            ->where('facture_id', $invoice->id)
            ->sum('montant_paye');
        if ($sum <= 0) {
            $invoice->update(['statut_facture' => 'En attente de paiement']);
        } elseif ($sum + 0.00001 < (float) $invoice->montant_total) {
            $invoice->update(['statut_facture' => 'Partiellement payée']);
        } else {
            $invoice->update(['statut_facture' => 'Payée']);
        }
        return ApiResponse::success(null, 'payments.cancelled');
    }

    private function authorizePayment(Payment $payment): void
    {
        if ($payment->company_id !== request()->user()->company_id) {
            abort(403);
        }
    }
}


