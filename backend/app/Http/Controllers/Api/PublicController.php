<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

/**
 * @group Public
 *
 * Public APIs that don't require authentication
 */
class PublicController extends Controller
{
    /**
     * Get System Info
     *
     * Get public system information for the landing page.
     *
     * @unauthenticated
     */
    public function info(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => [
                'name' => config('app.name'),
                'description' => 'Incident & Operations Log System',
                'version' => '1.0.0',
                'features' => [
                    'Incident Management',
                    'Real-time Notifications',
                    'Role-based Access Control',
                    'Analytics Dashboard',
                    'CSV Export',
                    'Activity Audit Trail',
                ],
                'support_email' => config('mail.from.address'),
            ],
        ]);
    }

    /**
     * Health Check
     *
     * Check if the API is operational.
     *
     * @unauthenticated
     */
    public function health(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'message' => 'API is operational.',
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
