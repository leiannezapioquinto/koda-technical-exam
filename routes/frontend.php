<?php

use Illuminate\Support\Facades\Route;

Route::view('/dashboard', 'app')->middleware('auth')->name('dashboard');
