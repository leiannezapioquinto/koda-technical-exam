<?php

use App\Http\Controllers\ProjectController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth')->group(function (): void {
    Route::get('/projects', [ProjectController::class, 'index'])->name('projects.index');
    Route::post('/projects', [ProjectController::class, 'store'])->name('projects.store');
    Route::get('/projects/{id}', [ProjectController::class, 'show'])->whereNumber('id')->name('projects.show');
    Route::put('/projects/{id}', [ProjectController::class, 'update'])->whereNumber('id')->name('projects.update');
    Route::delete('/projects/{id}', [ProjectController::class, 'destroy'])->whereNumber('id')->name('projects.destroy');
});
