<?php

namespace App\Providers;

use App\Models\Incident;
use App\Models\User;
use App\Policies\IncidentPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Gate;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The model to policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Incident::class => IncidentPolicy::class,
        User::class => UserPolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        // Register policies
        $this->registerPolicies();

        // Custom Password Reset URL
        \Illuminate\Auth\Notifications\ResetPassword::createUrlUsing(function (User $notifiable, string $token) {
            $frontendUrl = config('app.frontend_url', 'http://localhost:5173');
            return "{$frontendUrl}/reset-password?token={$token}&email={$notifiable->getEmailForPasswordReset()}";
        });

        // Define gates for role-based access
        Gate::define('admin', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('operator', function (User $user) {
            return $user->isOperator() || $user->isAdmin();
        });

        Gate::define('manage-users', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('manage-incidents', function (User $user) {
            return $user->canManageIncidents();
        });

        Gate::define('view-analytics', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('view-operator-metrics', function (User $user) {
            return $user->isAdmin();
        });

        Gate::define('export-data', function (User $user) {
            // All users can export their accessible data
            return true;
        });

        Gate::define('export-all-data', function (User $user) {
            return $user->isAdmin();
        });
    }
}
