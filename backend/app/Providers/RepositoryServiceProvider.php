<?php

namespace App\Providers;

use App\Repositories\Eloquent\IncidentRepository;
use App\Repositories\Eloquent\IncidentUpdateRepository;
use App\Repositories\Eloquent\UserRepository;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use App\Repositories\Interfaces\IncidentUpdateRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        $this->app->bind(UserRepositoryInterface::class, UserRepository::class);
        $this->app->bind(IncidentRepositoryInterface::class, IncidentRepository::class);
        $this->app->bind(IncidentUpdateRepositoryInterface::class, IncidentUpdateRepository::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
