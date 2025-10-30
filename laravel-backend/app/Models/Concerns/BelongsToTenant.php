<?php

namespace App\Models\Concerns;

use Illuminate\Database\Eloquent\Builder;

trait BelongsToTenant
{
    public static function bootBelongsToTenant()
    {
        // apply global scope to restrict queries by current tenant
        static::addGlobalScope('tenant_id', function (Builder $builder) {
            if (app()->bound('currentTenant')) {
                $tenant = app('currentTenant');
                // only add if model table has tenant_id column
                try {
                    $model = $builder->getModel();
                    if (collect($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()))->contains('tenant_id')) {
                        $builder->where($model->getTable() . '.tenant_id', $tenant->id);
                    }
                } catch (\Throwable $e) {
                    // if schema not available (rare), skip scope to avoid breaking migrations
                }
            }
        });

        // set tenant_id automatically on create if available
        static::creating(function ($model) {
            if (app()->bound('currentTenant') && empty($model->tenant_id)) {
                $tenant = app('currentTenant');
                // only set if column exists
                try {
                    if (collect($model->getConnection()->getSchemaBuilder()->getColumnListing($model->getTable()))->contains('tenant_id')) {
                        $model->tenant_id = $tenant->id;
                    }
                } catch (\Throwable $e) {
                    // ignore
                }
            }
        });
    }
}
