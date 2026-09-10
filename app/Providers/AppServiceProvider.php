<?php

namespace App\Providers;

use App\constants\AppConstants;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        RateLimiter::for('authentication', fn (Request $request) => Limit::perMinute(AppConstants::AUTH_ATTEMPTS_PER_MINUTE)->by($request->ip())
        );
    }
}
