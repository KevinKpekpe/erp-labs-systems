<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait Searchable
{
    /**
     * Scope a query to apply a generic keyword search on declared $searchable columns.
     */
    public function scopeSearch(Builder $query, ?string $keyword): Builder
    {
        $keyword = trim((string) $keyword);
        if ($keyword === '') {
            return $query;
        }

        $columns = property_exists($this, 'searchable') ? (array) $this->searchable : [];
        if (empty($columns)) {
            return $query;
        }

        $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $keyword);
        $like = "%{$escaped}%";
        $table = $this->getTable();

        return $query->where(function (Builder $inner) use ($columns, $like, $table, $keyword) {
            foreach ($columns as $column) {
                $inner->orWhere("{$table}.{$column}", 'LIKE', $like);
            }
            if (ctype_digit($keyword)) {
                $inner->orWhere("{$table}.id", (int) $keyword);
            }
        });
    }
}


