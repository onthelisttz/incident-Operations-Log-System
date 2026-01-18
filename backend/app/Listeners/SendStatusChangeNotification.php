<?php

namespace App\Listeners;

use App\Events\IncidentStatusChanged;
use App\Services\NotificationService;

class SendStatusChangeNotification
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(IncidentStatusChanged $event): void
    {
        $this->notificationService->notifyStatusChanged(
            $event->incident,
            $event->previousStatus->value,
            $event->newStatus->value,
            $event->changedBy
        );
    }
}
