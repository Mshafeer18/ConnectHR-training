<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AboutController;
use App\Http\Controllers\StudentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Keep public pages here and protect students routes with the auth middleware.
| The separate auth routes (login/logout) are loaded from routes/auth.php.
|
*/

Route::get('/', function () {
    return view('welcome');
});

Route::get('/about', [AboutController::class, 'index']);

// Load minimal auth routes (login / logout)
require __DIR__ . '/auth.php';

// Protected student routes (requires authentication)
Route::middleware('auth')->group(function () {
    Route::get('students/export', [StudentController::class, 'export'])->name('students.export');
    Route::post('students/import', [StudentController::class, 'import'])->name('students.import');
    Route::resource('students', StudentController::class);
});
