<?php

use App\constants\ProjectConstants;
use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->where('id', ProjectConstants::ID_PATTERN)->name('projects.show');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])->where('id', ProjectConstants::ID_PATTERN)->name('projects.update');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])->where('id', ProjectConstants::ID_PATTERN)->name('projects.destroy');
});
