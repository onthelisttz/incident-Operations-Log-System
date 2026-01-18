<?php

namespace App\Services;

use App\Models\Incident;
use App\Models\User;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Str;

class NotificationService
{
    /**
     * Create an in-app notification for a user.
     */
    public function notifyUser(User $user, string $type, array $data, $notifiable = null): void
    {
        $notificationData = [
            'id' => Str::uuid()->toString(),
            'user_id' => $user->id,
            'type' => $type,
            'notifiable_type' => $notifiable ? get_class($notifiable) : null,
            'notifiable_id' => $notifiable?->id,
            'data' => json_encode($data),
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ];

        \DB::table('notifications')->insert($notificationData);
    }

    /**
     * Notify about new incident creation.
     */
    public function notifyIncidentCreated(Incident $incident): void
    {
        // Notify all operators and admins
        $recipients = User::where('role', 'operator')
            ->orWhere('role', 'admin')
            ->where('is_active', true)
            ->get();

        foreach ($recipients as $user) {
            $this->notifyUser($user, 'incident_created', [
                'message' => "New incident: {$incident->title}",
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'severity' => $incident->severity->value,
                'reporter' => $incident->reporter->name,
            ], $incident);
        }
    }

    /**
     * Notify about incident status change.
     */
    public function notifyStatusChanged(Incident $incident, string $previousStatus, string $newStatus, User $changedBy): void
    {
        // Notify the reporter
        if ($incident->reporter->id !== $changedBy->id) {
            $this->notifyUser($incident->reporter, 'status_changed', [
                'message' => "Incident {$incident->incident_number} status changed to {$newStatus}",
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'changed_by' => $changedBy->name,
            ], $incident);
        }

        // Notify assigned operator if different from the one who made the change
        if ($incident->assignedTo && $incident->assignedTo->id !== $changedBy->id) {
            $this->notifyUser($incident->assignedTo, 'status_changed', [
                'message' => "Incident {$incident->incident_number} status changed to {$newStatus}",
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'previous_status' => $previousStatus,
                'new_status' => $newStatus,
                'changed_by' => $changedBy->name,
            ], $incident);
        }
    }

    /**
     * Notify about incident assignment.
     */
    public function notifyAssignment(Incident $incident, User $assignedTo, User $assignedBy): void
    {
        if ($assignedTo->id !== $assignedBy->id) {
            $this->notifyUser($assignedTo, 'incident_assigned', [
                'message' => "You have been assigned to incident: {$incident->title}",
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'title' => $incident->title,
                'severity' => $incident->severity->value,
                'priority' => $incident->priority->value,
                'assigned_by' => $assignedBy->name,
            ], $incident);
        }
    }

    /**
     * Notify about new comment on incident.
     */
    public function notifyComment(Incident $incident, User $commentedBy): void
    {
        // Notify reporter if different
        if ($incident->reporter->id !== $commentedBy->id) {
            $this->notifyUser($incident->reporter, 'new_comment', [
                'message' => "New comment on incident {$incident->incident_number}",
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'commented_by' => $commentedBy->name,
            ], $incident);
        }

        // Notify assigned operator if different
        if ($incident->assignedTo && $incident->assignedTo->id !== $commentedBy->id) {
            $this->notifyUser($incident->assignedTo, 'new_comment', [
                'message' => "New comment on incident {$incident->incident_number}",
                'incident_id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'commented_by' => $commentedBy->name,
            ], $incident);
        }
    }

    /**
     * Get unread notifications for user.
     */
    public function getUnreadForUser(User $user): array
    {
        return \DB::table('notifications')
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'data' => json_decode($notification->data, true),
                    'created_at' => $notification->created_at,
                ];
            })
            ->toArray();
    }

    /**
     * Get all notifications for user (paginated).
     */
    public function getForUser(User $user, int $perPage = 20): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        return \DB::table('notifications')
            ->where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    /**
     * Mark notification as read.
     */
    public function markAsRead(string $notificationId): void
    {
        \DB::table('notifications')
            ->where('id', $notificationId)
            ->update(['read_at' => now()]);
    }

    /**
     * Mark all notifications as read for user.
     */
    public function markAllAsRead(User $user): void
    {
        \DB::table('notifications')
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    /**
     * Get unread count for user.
     */
    public function getUnreadCount(User $user): int
    {
        return \DB::table('notifications')
            ->where('user_id', $user->id)
            ->whereNull('read_at')
            ->count();
    }
}
