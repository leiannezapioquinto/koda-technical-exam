<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::view('/dashboard', 'app')->name('dashboard');
    Route::view('/dashboard/clients', 'app')->name('dashboard.clients');
    Route::get('/dashboard/summary', DashboardController::class);
});
