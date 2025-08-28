<?php

namespace App\Services\Reports;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ExamsReportService extends BaseReportService
{
    /**
     * Génère les données du rapport des examens
     */
    public function generate(): array
    {
        $data = [
            'summary' => $this->generateSummary(),
            'exams' => $this->getExams(),
            'exams_by_status' => $this->getExamsByStatus(),
            'exams_by_doctor' => $this->getExamsByDoctor(),
            'exams_by_patient' => $this->getExamsByPatient(),
            'report_info' => [
                'title' => 'Rapport des Examens',
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
     * Génère le résumé des examens
     */
    private function generateSummary(): array
    {
        $totalExams = DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->count();

        $completedExams = DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->where('demande_examens.statut_demande', 'Terminée')
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->count();

        $pendingExams = DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->where('demande_examens.statut_demande', 'En attente')
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->count();

        $inProgressExams = DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->where('demande_examens.statut_demande', 'En cours')
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->count();

        return [
            'total_exams' => $totalExams,
            'completed_exams' => $completedExams,
            'pending_exams' => $pendingExams,
            'in_progress_exams' => $inProgressExams,
            'completion_rate' => $totalExams > 0 ? round(($completedExams / $totalExams) * 100, 2) : 0,
        ];
    }

    /**
     * Obtient la liste des examens
     */
    private function getExams()
    {
        return DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->leftJoin('patients', 'demande_examens.patient_id', '=', 'patients.id')
            ->leftJoin('medecins', 'demande_examens.medecin_prescripteur_id', '=', 'medecins.id')
            ->select([
                'demande_examens.*',
                'patients.nom as patient_nom',
                'patients.postnom as patient_postnom',
                'patients.prenom as patient_prenom',
                'medecins.nom as medecin_nom',
                'medecins.prenom as medecin_prenom'
            ])
            ->orderByDesc('demande_examens.date_demande')
            ->limit(100)
            ->get();
    }

    /**
     * Obtient les examens par statut
     */
    private function getExamsByStatus()
    {
        return DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->select([
                'demande_examens.statut_demande',
                DB::raw('COUNT(*) as count')
            ])
            ->groupBy('demande_examens.statut_demande')
            ->get();
    }

    /**
     * Obtient les examens par médecin
     */
    private function getExamsByDoctor()
    {
        return DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->whereNotNull('demande_examens.medecin_prescripteur_id')
            ->join('medecins', 'demande_examens.medecin_prescripteur_id', '=', 'medecins.id')
            ->select([
                'medecins.nom',
                'medecins.prenom',
                DB::raw('COUNT(*) as count')
            ])
            ->groupBy('medecins.id', 'medecins.nom', 'medecins.prenom')
            ->orderByDesc('count')
            ->limit(10)
            ->get();
    }

    /**
     * Obtient les examens par patient
     */
    private function getExamsByPatient()
    {
        return DB::table('demande_examens')
            ->where('demande_examens.company_id', $this->companyId)
            ->whereBetween('demande_examens.date_demande', [$this->startDate, $this->endDate])
            ->join('patients', 'demande_examens.patient_id', '=', 'patients.id')
            ->select([
                'patients.nom',
                'patients.postnom',
                'patients.prenom',
                DB::raw('COUNT(*) as count')
            ])
            ->groupBy('patients.id', 'patients.nom', 'patients.postnom', 'patients.prenom')
            ->orderByDesc('count')
            ->limit(10)
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
