<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\StudentController;

// public: obtain token
Route::post('login', [AuthController::class, 'login'])->middleware('tenant');

// Protect everything below with token auth
Route::middleware(['tenant', 'auth:sanctum'])->group(function () {

    // revoke token / logout
    Route::post('logout', [AuthController::class, 'logout']);

    // All student endpoints require token
    Route::prefix('students')->group(function () {
        Route::get('/', [StudentController::class, 'apiIndex']);
        Route::post('/', [StudentController::class, 'apiStore']);
        Route::post('import', [StudentController::class, 'apiImport']);
        Route::get('export', [StudentController::class, 'apiExport']);
        Route::get('{student}', [StudentController::class, 'apiShow']);
        Route::put('{student}', [StudentController::class, 'apiUpdate']);
        Route::delete('{student}', [StudentController::class, 'apiDestroy']);
    });
});
