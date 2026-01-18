<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckFirstLogin
{
    /**
     * List of routes that should be accessible even during first login.
     */
    protected array $exceptRoutes = [
        'api/auth/first-login-password',
        'api/auth/logout',
        'api/auth/me',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->is_first_login) {
            // Check if current route is in the exception list
            $currentPath = $request->path();
            
            foreach ($this->exceptRoutes as $route) {
                if (str_starts_with($currentPath, $route)) {
                    return $next($request);
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'Password change required on first login.',
                'requires_password_change' => true,
            ], 403);
        }

        return $next($request);
    }
}
