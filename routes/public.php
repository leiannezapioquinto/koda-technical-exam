<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'app')->name('home');
Route::view('/login', 'app')->middleware('guest')->name('login');
Route::view('/register', 'app')->middleware('guest')->name('register');
Route::get('/auth/csrf', fn () => response()->json(['token' => csrf_token()]));
Route::middleware(['guest', 'throttle:authentication'])->group(function (): void {
    Route::post('/auth/login', [AuthController::class, 'login']);
    Route::post('/auth/register', [AuthController::class, 'register']);
});
Route::middleware('auth')->group(function (): void {
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
