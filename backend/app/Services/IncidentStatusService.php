<?php

namespace App\Services;

use App\Enums\IncidentStatus;
use App\Events\IncidentStatusChanged;
use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Incident;
use App\Models\User;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use App\Repositories\Interfaces\IncidentUpdateRepositoryInterface;

class IncidentStatusService
{
    public function __construct(
        protected IncidentRepositoryInterface $incidentRepository,
        protected IncidentUpdateRepositoryInterface $updateRepository
    ) {}

    /**
     * Update incident status with validation.
     *
     * @throws InvalidStatusTransitionException
     */
    public function updateStatus(Incident $incident, string $newStatus, User $user, ?string $notes = null): Incident
    {
        $currentStatus = $incident->status;
        $targetStatus = IncidentStatus::from($newStatus);

        // Validate transition
        if (!$currentStatus->canTransitionTo($targetStatus)) {
            throw new InvalidStatusTransitionException(
                "Cannot transition from '{$currentStatus->value}' to '{$targetStatus->value}'"
            );
        }

        // Require resolution notes when resolving
        if ($targetStatus === IncidentStatus::RESOLVED && empty($notes) && empty($incident->resolution_notes)) {
            throw new InvalidStatusTransitionException(
                'Resolution notes are required when resolving an incident.'
            );
        }

        // Update the incident
        $incident = $this->incidentRepository->updateStatus($incident, $targetStatus, $notes);

        // Create status change audit log
        $this->updateRepository->createStatusChange(
            $incident,
            $user,
            $currentStatus->value,
            $targetStatus->value,
            $notes
        );

        // Dispatch event
        event(new IncidentStatusChanged($incident, $currentStatus, $targetStatus, $user));

        return $incident;
    }

    /**
     * Get valid transitions for current status.
     */
    public function getValidTransitions(Incident $incident): array
    {
        $validTransitions = $incident->status->validTransitions();
        
        return array_map(function (IncidentStatus $status) {
            return [
                'value' => $status->value,
                'label' => $status->label(),
            ];
        }, $validTransitions);
    }

    /**
     * Check if a transition is valid.
     */
    public function canTransition(Incident $incident, string $targetStatus): bool
    {
        try {
            $target = IncidentStatus::from($targetStatus);
            return $incident->status->canTransitionTo($target);
        } catch (\ValueError $e) {
            return false;
        }
    }
}
