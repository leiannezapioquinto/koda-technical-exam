<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        //
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $isJsonRoute = fn (Request $request): bool => $request->is('auth/*', 'projects', 'projects/*', 'dashboard/*') || $request->expectsJson();

        $isExpected = fn (Throwable $e): bool => $e instanceof ValidationException
            || $e instanceof AuthenticationException
            || $e instanceof AuthorizationException
            || $e instanceof ModelNotFoundException
            || $e instanceof HttpExceptionInterface;

        $exceptions->shouldRenderJsonWhen($isJsonRoute);

        // Expected exceptions (validation, auth, 404s) already carry their own
        // status/message and are noise in the logs, so only unexpected
        // failures are reported here, with request context attached.
        $exceptions->report(function (Throwable $e) use ($isExpected): bool {
            if ($isExpected($e)) {
                return true;
            }

            $context = ['exception' => $e::class];
            if (app()->bound('request')) {
                $request = app('request');
                $context += [
                    'url' => $request->fullUrl(),
                    'method' => $request->method(),
                    'user_id' => $request->user()?->id,
                ];
            }
            Log::error($e->getMessage(), $context);

            return false;
        });

        // Unexpected failures on JSON routes get a generic message instead of
        // leaking exception details (SQL, stack traces) to the client.
        $exceptions->render(function (Throwable $e, Request $request) use ($isJsonRoute, $isExpected) {
            if ($isExpected($e) || ! $isJsonRoute($request)) {
                return null;
            }

            return response()->json(['message' => 'Something went wrong. Please try again later.'], 500);
        });
    })->create();
