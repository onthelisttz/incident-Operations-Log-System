<?php

use App\Http\Controllers\Api\AttachmentController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\IncidentController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PublicController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group.
|
*/

// ===========================================
// PUBLIC ROUTES (No Authentication Required)
// ===========================================
Route::prefix('public')->group(function () {
    Route::get('/info', [PublicController::class, 'info']);
    Route::get('/health', [PublicController::class, 'health']);
});

// ===========================================
// AUTHENTICATION ROUTES
// ===========================================
Route::prefix('auth')->group(function () {
    // Public auth routes with rate limiting
    Route::middleware('throttle:auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login']);
    });

    Route::middleware('throttle:password-reset')->group(function () {
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
    });

    // Protected auth routes
    Route::middleware(['auth:sanctum', 'active'])->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post('/logout-all', [AuthController::class, 'logoutAll']);
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/first-login-password', [AuthController::class, 'firstLoginPassword']);
        
        // These require first login check
        Route::middleware('first_login')->group(function () {
            Route::post('/change-password', [AuthController::class, 'changePassword']);
            Route::put('/profile', [AuthController::class, 'updateProfile']);
        });
    });
});

// ===========================================
// PROTECTED ROUTES (Authentication Required)
// ===========================================
Route::middleware(['auth:sanctum', 'active', 'first_login', 'throttle:authenticated'])->group(function () {
    
    // ===========================================
    // USER MANAGEMENT (Admin Only)
    // ===========================================
    Route::prefix('users')->middleware('role:admin')->group(function () {
        Route::get('/', [UserController::class, 'index']);
        Route::post('/', [UserController::class, 'store'])->middleware('throttle:user-create');
        Route::get('/operators', [UserController::class, 'operators']);
        Route::get('/export', [UserController::class, 'export'])->middleware('throttle:export');
        Route::get('/{user}', [UserController::class, 'show']);
        Route::put('/{user}', [UserController::class, 'update']);
        Route::delete('/{user}', [UserController::class, 'destroy']);
        Route::post('/{user}/reset-password', [UserController::class, 'resetPassword']);
        Route::patch('/{user}/toggle-status', [UserController::class, 'toggleStatus']);
    });

    // ===========================================
    // INCIDENT MANAGEMENT
    // ===========================================
    Route::prefix('incidents')->group(function () {
        Route::get('/', [IncidentController::class, 'index']);
        Route::post('/', [IncidentController::class, 'store']);
        Route::get('/export', [IncidentController::class, 'export'])->middleware('throttle:export');
        Route::get('/categories', [IncidentController::class, 'categories']);
        Route::get('/{incident}', [IncidentController::class, 'show']);
        Route::put('/{incident}', [IncidentController::class, 'update']);
        Route::delete('/{incident}', [IncidentController::class, 'destroy']);
        Route::patch('/{incident}/status', [IncidentController::class, 'updateStatus']);
        Route::patch('/{incident}/assign', [IncidentController::class, 'assign']);
        Route::get('/{incident}/updates', [IncidentController::class, 'updates']);
        Route::post('/{incident}/comments', [IncidentController::class, 'addComment']);
        Route::get('/{incident}/valid-transitions', [IncidentController::class, 'validTransitions']);

        // Attachments
        Route::get('/{incident}/attachments', [AttachmentController::class, 'index']);
        Route::post('/{incident}/attachments', [AttachmentController::class, 'store'])->middleware('throttle:upload');
    });

    // ===========================================
    // ATTACHMENTS
    // ===========================================
    Route::prefix('attachments')->group(function () {
        Route::delete('/{attachment}', [AttachmentController::class, 'destroy']);
        Route::get('/{attachment}/download', [AttachmentController::class, 'download']);
    });

    // ===========================================
    // DASHBOARD
    // ===========================================
    Route::prefix('dashboard')->group(function () {
        Route::get('/stats', [DashboardController::class, 'stats']);
        Route::get('/recent-incidents', [DashboardController::class, 'recentIncidents']);
        Route::get('/my-assigned', [DashboardController::class, 'myAssigned']);
        Route::get('/severity-breakdown', [DashboardController::class, 'severityBreakdown']);
        Route::get('/status-distribution', [DashboardController::class, 'statusDistribution']);
        Route::get('/category-breakdown', [DashboardController::class, 'categoryBreakdown']);
        Route::get('/trends', [DashboardController::class, 'trends']);
        Route::get('/mttr', [DashboardController::class, 'mttr']);
        Route::get('/operator-performance', [DashboardController::class, 'operatorPerformance']);
        Route::get('/escalation-alerts', [DashboardController::class, 'escalationAlerts']);
    });

    // ===========================================
    // NOTIFICATIONS
    // ===========================================
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::get('/unread', [NotificationController::class, 'unread']);
        Route::get('/unread-count', [NotificationController::class, 'unreadCount']);
        Route::patch('/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::patch('/read-all', [NotificationController::class, 'markAllAsRead']);
    });
});
