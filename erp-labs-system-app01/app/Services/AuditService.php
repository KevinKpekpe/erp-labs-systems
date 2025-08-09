<?php

namespace App\Services;

use App\Models\SystemAudit;
use App\Models\Company;
use Illuminate\Support\Facades\Log;

class AuditService
{
    public static function log(
        string $actionType,
        ?string $tableName = null,
        ?int $recordId = null,
        ?string $details = null
    ): void {
        $user = auth()->user();
        $companyId = $user->company_id ?? null;
        if (is_null($companyId)) {
            $code = request()->input('company_code');
            if ($code) {
                $companyId = Company::where('code', $code)->value('id');
            }
        }

        try {
            if ($companyId) {
                SystemAudit::create([
                    'company_id' => $companyId,
                    'user_id' => $user?->id,
                    'action_type' => $actionType,
                    'table_name' => $tableName,
                    'record_id' => $recordId,
                    'action_details' => $details,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ]);
            } else {
                // Si on n'a pas de company_id (ex: superadmin ou login sans contexte), log fichier
                Log::info('AUDIT(SKIPPED_DB)', [
                    'action' => $actionType,
                    'table' => $tableName,
                    'record' => $recordId,
                    'details' => $details,
                    'ip' => request()->ip(),
                    'ua' => request()->userAgent(),
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('AUDIT(FAILED_DB_WRITE)', [
                'exception' => get_class($e),
                'message' => $e->getMessage(),
                'action' => $actionType,
                'table' => $tableName,
                'record' => $recordId,
            ]);
        }
    }
}


