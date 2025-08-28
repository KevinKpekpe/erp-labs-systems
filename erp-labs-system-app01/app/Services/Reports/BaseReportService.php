<?php

namespace App\Services\Reports;

use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Barryvdh\DomPDF\Facade\Pdf;

abstract class BaseReportService
{
    protected int $companyId;
    protected array $filters;
    protected Carbon $startDate;
    protected Carbon $endDate;

    public function __construct(int $companyId, array $filters = [])
    {
        $this->companyId = $companyId;
        $this->filters = $filters;
        $this->parseDateFilters();
    }

    /**
     * Parse les filtres de dates et définit les dates de début et fin
     */
    protected function parseDateFilters(): void
    {
        $period = $this->filters['period'] ?? 'month';
        $customStart = $this->filters['start_date'] ?? null;
        $customEnd = $this->filters['end_date'] ?? null;

        if ($customStart && $customEnd) {
            $this->startDate = Carbon::parse($customStart)->startOfDay();
            $this->endDate = Carbon::parse($customEnd)->endOfDay();
        } else {
            $this->setPeriodDates($period);
        }
    }

    /**
     * Définit les dates selon la période prédéfinie
     */
    protected function setPeriodDates(string $period): void
    {
        switch ($period) {
            case 'today':
                $this->startDate = Carbon::today()->startOfDay();
                $this->endDate = Carbon::today()->endOfDay();
                break;
            case 'week':
                $this->startDate = Carbon::now()->startOfWeek();
                $this->endDate = Carbon::now()->endOfWeek();
                break;
            case 'month':
                $this->startDate = Carbon::now()->startOfMonth();
                $this->endDate = Carbon::now()->endOfMonth();
                break;
            case 'quarter':
                $this->startDate = Carbon::now()->startOfQuarter();
                $this->endDate = Carbon::now()->endOfQuarter();
                break;
            case 'year':
                $this->startDate = Carbon::now()->startOfYear();
                $this->endDate = Carbon::now()->endOfYear();
                break;
            case 'last_7_days':
                $this->startDate = Carbon::now()->subDays(7)->startOfDay();
                $this->endDate = Carbon::now()->endOfDay();
                break;
            case 'last_30_days':
                $this->startDate = Carbon::now()->subDays(30)->startOfDay();
                $this->endDate = Carbon::now()->endOfDay();
                break;
            case 'last_90_days':
                $this->startDate = Carbon::now()->subDays(90)->startOfDay();
                $this->endDate = Carbon::now()->endOfDay();
                break;
            case 'last_year':
                $this->startDate = Carbon::now()->subYear()->startOfYear();
                $this->endDate = Carbon::now()->subYear()->endOfYear();
                break;
            default:
                $this->startDate = Carbon::now()->startOfMonth();
                $this->endDate = Carbon::now()->endOfMonth();
        }
    }

    /**
     * Applique les filtres de base (dates et company_id) à une requête
     */
    protected function applyBaseFilters($query, string $dateColumn = 'created_at'): void
    {
        $query->where('company_id', $this->companyId);
        // Temporairement commenté pour tester
        // ->whereBetween($dateColumn, [$this->startDate, $this->endDate]);
    }

    /**
     * Formate un montant en Francs Congolais
     */
    protected function formatCDF(float $amount): string
    {
        return number_format($amount, 0, ',', ' ') . ' CDF';
    }

    /**
     * Formate une date
     */
    protected function formatDate(string $date, string $format = 'd/m/Y'): string
    {
        return Carbon::parse($date)->format($format);
    }

    /**
     * Obtient la durée entre deux dates en jours
     */
    protected function getDaysBetween(string $startDate, string $endDate): int
    {
        return Carbon::parse($startDate)->diffInDays(Carbon::parse($endDate));
    }

    /**
     * Obtient la durée entre deux dates en heures
     */
    protected function getHoursBetween(string $startDate, string $endDate): int
    {
        return Carbon::parse($startDate)->diffInHours(Carbon::parse($endDate));
    }

    /**
     * Méthode abstraite que chaque rapport doit implémenter
     */
    abstract public function generate(): array;
}
