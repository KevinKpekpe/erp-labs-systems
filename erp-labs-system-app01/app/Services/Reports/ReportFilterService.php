<?php

namespace App\Services\Reports;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ReportFilterService
{
    /**
     * Périodes prédéfinies disponibles
     */
    public const AVAILABLE_PERIODS = [
        'today' => 'Aujourd\'hui',
        'week' => 'Cette semaine',
        'month' => 'Ce mois',
        'quarter' => 'Ce trimestre',
        'year' => 'Cette année',
        'last_7_days' => '7 derniers jours',
        'last_30_days' => '30 derniers jours',
        'last_90_days' => '90 derniers jours',
        'last_year' => 'Année précédente',
        'custom' => 'Période personnalisée'
    ];

    /**
     * Valide et transforme les filtres de rapport
     */
    public function validateAndTransform(Request $request): array
    {
        $filters = $request->only([
            'period',
            'start_date',
            'end_date',
            'group_by',
            'sort_by',
            'sort_direction',
            'limit',
            'include_details'
        ]);

        $validator = Validator::make($filters, [
            'period' => 'sometimes|string|in:' . implode(',', array_keys(self::AVAILABLE_PERIODS)),
            'start_date' => 'required_if:period,custom|nullable|date|before_or_equal:end_date',
            'end_date' => 'required_if:period,custom|nullable|date|after_or_equal:start_date',
            'group_by' => 'sometimes|string|in:day,week,month,quarter,year',
            'sort_by' => 'sometimes|string',
            'sort_direction' => 'sometimes|string|in:asc,desc',
            'limit' => 'sometimes|integer|min:1|max:1000',
            'include_details' => 'sometimes|boolean'
        ]);

        if ($validator->fails()) {
            throw new \InvalidArgumentException($validator->errors()->first());
        }

        // Valeurs par défaut
        $filters['period'] = $filters['period'] ?? 'month';
        $filters['group_by'] = $filters['group_by'] ?? 'day';
        $filters['sort_direction'] = $filters['sort_direction'] ?? 'desc';
        $filters['limit'] = $filters['limit'] ?? 100;
        $filters['include_details'] = $filters['include_details'] ?? false;

        // Nettoyer les dates vides pour les périodes prédéfinies
        if ($filters['period'] !== 'custom') {
            $filters['start_date'] = null;
            $filters['end_date'] = null;
        }

        // Si période personnalisée, valider les dates
        if ($filters['period'] === 'custom') {
            if (empty($filters['start_date']) || empty($filters['end_date'])) {
                throw new \InvalidArgumentException('Les dates de début et fin sont requises pour une période personnalisée');
            }

            // Limiter la période à 2 ans maximum
            $startDate = Carbon::parse($filters['start_date']);
            $endDate = Carbon::parse($filters['end_date']);

            if ($startDate->diffInDays($endDate) > 730) {
                throw new \InvalidArgumentException('La période ne peut pas dépasser 2 ans');
            }
        }

        return $filters;
    }

    /**
     * Obtient la description lisible de la période
     */
    public function getPeriodDescription(array $filters): string
    {
        $period = $filters['period'] ?? 'month';

        if ($period === 'custom' && isset($filters['start_date']) && isset($filters['end_date'])) {
            $startDate = Carbon::parse($filters['start_date'])->format('d/m/Y');
            $endDate = Carbon::parse($filters['end_date'])->format('d/m/Y');
            return "Du {$startDate} au {$endDate}";
        }

        return self::AVAILABLE_PERIODS[$period] ?? 'Période inconnue';
    }

    /**
     * Obtient les dates de début et fin selon les filtres
     */
    public function getDateRange(array $filters): array
    {
        $period = $filters['period'] ?? 'month';

        if ($period === 'custom') {
            return [
                'start_date' => Carbon::parse($filters['start_date'])->startOfDay(),
                'end_date' => Carbon::parse($filters['end_date'])->endOfDay()
            ];
        }

        $startDate = null;
        $endDate = null;

        switch ($period) {
            case 'today':
                $startDate = Carbon::today()->startOfDay();
                $endDate = Carbon::today()->endOfDay();
                break;
            case 'week':
                $startDate = Carbon::now()->startOfWeek();
                $endDate = Carbon::now()->endOfWeek();
                break;
            case 'month':
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
                break;
            case 'quarter':
                $startDate = Carbon::now()->startOfQuarter();
                $endDate = Carbon::now()->endOfQuarter();
                break;
            case 'year':
                $startDate = Carbon::now()->startOfYear();
                $endDate = Carbon::now()->endOfYear();
                break;
            case 'last_7_days':
                $startDate = Carbon::now()->subDays(7)->startOfDay();
                $endDate = Carbon::now()->endOfDay();
                break;
            case 'last_30_days':
                $startDate = Carbon::now()->subDays(30)->startOfDay();
                $endDate = Carbon::now()->endOfDay();
                break;
            case 'last_90_days':
                $startDate = Carbon::now()->subDays(90)->startOfDay();
                $endDate = Carbon::now()->endOfDay();
                break;
            case 'last_year':
                $startDate = Carbon::now()->subYear()->startOfYear();
                $endDate = Carbon::now()->subYear()->endOfYear();
                break;
            default:
                $startDate = Carbon::now()->startOfMonth();
                $endDate = Carbon::now()->endOfMonth();
        }

        return [
            'start_date' => $startDate,
            'end_date' => $endDate
        ];
    }

    /**
     * Obtient les options de groupement pour les graphiques
     */
    public function getGroupByOptions(): array
    {
        return [
            'day' => 'Par jour',
            'week' => 'Par semaine',
            'month' => 'Par mois',
            'quarter' => 'Par trimestre',
            'year' => 'Par année'
        ];
    }

    /**
     * Obtient les options de tri
     */
    public function getSortOptions(): array
    {
        return [
            'date' => 'Par date',
            'amount' => 'Par montant',
            'quantity' => 'Par quantité',
            'name' => 'Par nom',
            'code' => 'Par code'
        ];
    }
}
