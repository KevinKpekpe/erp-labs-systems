<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SystemAudit extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'system_audits';

    protected $fillable = [
        'company_id',
        'user_id',
        'action_type',
        'table_name',
        'record_id',
        'action_details',
        'ip_address',
        'user_agent',
    ];
}


