<?php

return [

    /*
    |--------------------------------------------------------------------------
    | IOLS System Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration options for the Incident & Operations Log System.
    |
    */

    // Frontend URL for emails and redirects
    'frontend_url' => env('FRONTEND_URL', 'http://localhost:5173'),

    // Incident settings
    'incidents' => [
        // Hours without update before considering at-risk
        'at_risk_hours' => env('IOLS_AT_RISK_HOURS', 24),
        
        // Default incidents per page
        'per_page' => env('IOLS_INCIDENTS_PER_PAGE', 15),
    ],

    // Dashboard settings
    'dashboard' => [
        // Days to show in trends chart
        'trend_days' => env('IOLS_TREND_DAYS', 30),
        
        // Number of recent incidents to show
        'recent_limit' => env('IOLS_RECENT_LIMIT', 10),
    ],

    // Export settings
    'export' => [
        // Chunk size for large exports
        'chunk_size' => env('IOLS_EXPORT_CHUNK_SIZE', 1000),
    ],

    // Notification settings
    'notifications' => [
        // Enable email notifications
        'email_enabled' => env('IOLS_EMAIL_NOTIFICATIONS', true),
    ],

];
