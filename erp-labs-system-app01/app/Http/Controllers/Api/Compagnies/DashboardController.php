<?php

namespace App\Http\Controllers\Api\Compagnies;

use App\Http\Controllers\Controller;
use App\Models\ExamRequest;
use App\Models\Exam;
use App\Models\Patient;
use App\Models\StockAlert;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function metrics()
    {
        $companyId = request()->user()->company_id;

        $today = now()->toDateString();
        $patientsToday = Patient::where('company_id', $companyId)
            ->whereDate('created_at', $today)
            ->count();

        $examsInProgress = ExamRequest::where('company_id', $companyId)
            ->whereIn('statut_demande', ['En attente','En cours'])
            ->count();

        $examsCompleted = ExamRequest::where('company_id', $companyId)
            ->where('statut_demande', 'Terminée')
            ->count();

        $stockAlerts = StockAlert::where('company_id', $companyId)->count();

        return ApiResponse::success([
            'patients_today' => $patientsToday,
            'exams_in_progress' => $examsInProgress,
            'exams_completed' => $examsCompleted,
            'stock_alerts_count' => $stockAlerts,
        ], 'dashboard.metrics');
    }

    public function examsMonthly()
    {
        $companyId = request()->user()->company_id;
        $year = (int) request('year', now()->year);

        $rows = DB::table('demande_examens as dr')
            ->join('demande_examen_details as d', 'dr.id', '=', 'd.demande_id')
            ->join('examens as e', 'd.examen_id', '=', 'e.id')
            ->where('dr.company_id', $companyId)
            ->whereYear('dr.date_demande', $year)
            ->selectRaw('MONTH(dr.date_demande) as month, e.nom_examen as type, COUNT(*) as total')
            ->groupBy('month', 'type')
            ->get();

        $series = [];
        foreach ($rows as $r) {
            $series[$r->type][(int)$r->month] = (int)$r->total;
        }
        $result = [];
        foreach ($series as $name => $data) {
            $arr = [];
            for ($m = 1; $m <= 12; $m++) { $arr[] = $data[$m] ?? 0; }
            $result[] = ['name' => $name, 'data' => $arr];
        }

        return ApiResponse::success([
            'year' => $year,
            'series' => $result,
        ], 'dashboard.exams_monthly');
    }

    public function demographics()
    {
        $companyId = request()->user()->company_id;

        $ageBuckets = [
            '0-18' => [0, 18],
            '19-30' => [19, 30],
            '31-50' => [31, 50],
            '51-70' => [51, 70],
            '70+' => [71, 200],
        ];
        $ages = [];
        foreach ($ageBuckets as $label => [$min, $max]) {
            $ages[] = [
                'label' => $label,
                'count' => Patient::where('company_id', $companyId)
                    ->whereBetween(DB::raw('TIMESTAMPDIFF(YEAR, date_naissance, CURDATE())'), [$min, $max])
                    ->count(),
            ];
        }

        $gender = [
            'F' => Patient::where('company_id', $companyId)->where('sexe', 'F')->count(),
            'M' => Patient::where('company_id', $companyId)->where('sexe', 'M')->count(),
        ];

        return ApiResponse::success([
            'ages' => $ages,
            'gender' => $gender,
        ], 'dashboard.demographics');
    }

    public function distribution()
    {
        $companyId = request()->user()->company_id;
        $period = request('period', 'month');

        $query = DB::table('demande_examens as dr')
            ->join('demande_examen_details as d', 'dr.id', '=', 'd.demande_id')
            ->join('examens as e', 'd.examen_id', '=', 'e.id')
            ->where('dr.company_id', $companyId)
            ->select('e.nom_examen as label', DB::raw('COUNT(*) as total'))
            ->groupBy('label');
        if ($period === 'month') {
            $query->whereYear('dr.date_demande', now()->year)->whereMonth('dr.date_demande', now()->month);
        }
        $rows = $query->get();

        $labels = $rows->pluck('label');
        $series = $rows->pluck('total')->map(fn($v) => (int)$v);

        return ApiResponse::success([
            'labels' => $labels,
            'series' => $series,
        ], 'dashboard.distribution');
    }

    public function recentRequests()
    {
        $companyId = request()->user()->company_id;
        $limit = (int) request('limit', 10);

        $rows = DB::table('demande_examens as dr')
            ->join('patients as p', 'dr.patient_id', '=', 'p.id')
            ->join('demande_examen_details as d', 'dr.id', '=', 'd.demande_id')
            ->join('examens as e', 'd.examen_id', '=', 'e.id')
            ->leftJoin('doctors as doc', 'dr.medecin_prescripteur_id', '=', 'doc.id')
            ->where('dr.company_id', $companyId)
            ->orderByDesc('dr.date_demande')
            ->limit($limit)
            ->select([
                'dr.id',
                DB::raw("CONCAT(p.nom, ' ', p.prenom) as patientName"),
                'p.code as patientCode',
                'e.nom_examen as typeExamen',
                DB::raw("COALESCE(CONCAT(doc.nom, ' ', doc.prenom), dr.medecin_prescripteur_externe_nom) as medecin"),
                'dr.date_demande as dateDemande',
                'dr.statut_demande as statut',
            ])
            ->get();

        return ApiResponse::success($rows, 'dashboard.recent_requests');
    }
}
