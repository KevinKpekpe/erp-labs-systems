<?php

namespace App\Services;

use App\Models\SystemAudit;

class AuditService
{
    public static function log(
        string $actionType,
        ?string $tableName = null,
        ?int $recordId = null,
        ?string $details = null
    ): void {
        $user = auth()->user();
        $companyId = $user->company_id ?? config('current_company_id');

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
    }
}


