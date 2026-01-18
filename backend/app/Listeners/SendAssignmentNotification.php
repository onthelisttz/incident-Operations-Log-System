<?php

namespace App\Listeners;

use App\Events\IncidentAssigned;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Auth;

class SendAssignmentNotification
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(IncidentAssigned $event): void
    {
        $assignedBy = Auth::user() ?? $event->incident->reporter;
        
        $this->notificationService->notifyAssignment(
            $event->incident,
            $event->assignedTo,
            $assignedBy
        );
    }
}
