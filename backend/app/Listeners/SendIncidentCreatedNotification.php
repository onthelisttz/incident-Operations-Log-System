<?php

namespace App\Listeners;

use App\Events\IncidentCreated;
use App\Services\NotificationService;

class SendIncidentCreatedNotification
{
    public function __construct(
        protected NotificationService $notificationService
    ) {}

    /**
     * Handle the event.
     */
    public function handle(IncidentCreated $event): void
    {
        $this->notificationService->notifyIncidentCreated($event->incident);
    }
}
