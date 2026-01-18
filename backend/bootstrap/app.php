<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // Add Sanctum stateful API middleware
        $middleware->statefulApi();
        
        // Exclude all API routes from CSRF verification (they use token-based auth)
        // Bearer tokens already provide CSRF protection
        $middleware->validateCsrfTokens(except: [
            'api/*',
        ]);
        
        // Register custom middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\RoleMiddleware::class,
            'active' => \App\Http\Middleware\EnsureUserIsActive::class,
            'first_login' => \App\Http\Middleware\CheckFirstLogin::class,
        ]);
    })
    ->withProviders([
        \App\Providers\RepositoryServiceProvider::class,
        \App\Providers\EventServiceProvider::class,
        \App\Providers\AuthServiceProvider::class,
        \App\Providers\RateLimitServiceProvider::class,
    ])
    ->withExceptions(function (Exceptions $exceptions): void {
        //
    })->create();
