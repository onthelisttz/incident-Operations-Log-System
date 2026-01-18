<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Notifications
 *
 * APIs for managing user notifications
 */
class NotificationController extends Controller
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * List Notifications
     *
     * Get all notifications for the current user.
     *
     * @queryParam per_page integer Items per page. Example: 20
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $notifications = $this->notificationService->getForUser($request->user(), $perPage);

        return response()->json([
            'success' => true,
            'data' => NotificationResource::collection($notifications->items()),
            'meta' => [
                'current_page' => $notifications->currentPage(),
                'per_page' => $notifications->perPage(),
                'total' => $notifications->total(),
                'total_pages' => $notifications->lastPage(),
            ],
        ]);
    }

    /**
     * Get Unread Notifications
     *
     * Get unread notifications for the current user.
     */
    public function unread(Request $request): JsonResponse
    {
        $notifications = $this->notificationService->getUnreadForUser($request->user());
        $count = $this->notificationService->getUnreadCount($request->user());

        return response()->json([
            'success' => true,
            'data' => $notifications,
            'unread_count' => $count,
        ]);
    }

    /**
     * Mark Notification as Read
     *
     * Mark a single notification as read.
     *
     * @urlParam notification string required The notification ID. Example: 550e8400-e29b-41d4-a716-446655440000
     */
    public function markAsRead(Request $request, string $notification): JsonResponse
    {
        $this->notificationService->markAsRead($notification);

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read.',
        ]);
    }

    /**
     * Mark All as Read
     *
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request): JsonResponse
    {
        $this->notificationService->markAllAsRead($request->user());

        return response()->json([
            'success' => true,
            'message' => 'All notifications marked as read.',
        ]);
    }

    /**
     * Get Unread Count
     *
     * Get the count of unread notifications.
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $count = $this->notificationService->getUnreadCount($request->user());

        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $count,
            ],
        ]);
    }
}
