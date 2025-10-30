<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Tenant;

class TenantMiddleware
{
    public function handle($request, Closure $next)
    {
        $slug = $request->header('X-Tenant-Slug') ?? $request->query('tenant');

        if (! $slug) {
            return response()->json(['message' => 'Tenant header missing (X-Tenant-Slug)'], 400);
        }

        $tenant = Tenant::where('slug', $slug)->first();

        if (! $tenant) {
            return response()->json(['message' => 'Tenant not found'], 404);
        }

        // bind tenant into the container so trait/global scope and controllers can access it
        app()->instance('currentTenant', $tenant);

        return $next($request);
    }
}
