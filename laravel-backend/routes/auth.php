<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Authentication Routes (minimal)
| Only login (guest) and logout (auth) routes are registered.
|--------------------------------------------------------------------------
*/

Route::middleware('guest')->group(function () {
    // Show login form (GET /login)
    Route::get('login', [AuthenticatedSessionController::class, 'create'])
        ->name('login');

    // Process login form (POST /login)
    Route::post('login', [AuthenticatedSessionController::class, 'store']);
});

// Logout (POST /logout) — keep protected by auth
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
