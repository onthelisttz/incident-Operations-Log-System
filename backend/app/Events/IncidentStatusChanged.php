<?php

namespace App\Events;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class IncidentStatusChanged
{
    use Dispatchable, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public Incident $incident,
        public IncidentStatus $previousStatus,
        public IncidentStatus $newStatus,
        public User $changedBy
    ) {}
}
