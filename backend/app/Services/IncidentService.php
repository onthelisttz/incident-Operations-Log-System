<?php

namespace App\Services;

use App\Enums\ActionType;
use App\Events\IncidentAssigned;
use App\Events\IncidentCreated;
use App\Events\IncidentStatusChanged;
use App\Models\Incident;
use App\Models\User;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use App\Repositories\Interfaces\IncidentUpdateRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class IncidentService
{
    public function __construct(
        protected IncidentRepositoryInterface $incidentRepository,
        protected IncidentUpdateRepositoryInterface $updateRepository
    ) {}

    /**
     * Get paginated incidents for user based on role.
     */
    public function getPaginatedForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->incidentRepository->paginateForUser($user, $filters, $perPage);
    }

    /**
     * Get all incidents (for export).
     */
    public function getAll(array $filters = []): Collection
    {
        return $this->incidentRepository->all($filters);
    }

    /**
     * Find incident by ID.
     */
    public function find(int $id): ?Incident
    {
        return $this->incidentRepository->find($id);
    }

    /**
     * Find incident by incident number.
     */
    public function findByNumber(string $incidentNumber): ?Incident
    {
        return $this->incidentRepository->findByNumber($incidentNumber);
    }

    /**
     * Create a new incident.
     */
    public function create(array $data, User $reporter): Incident
    {
        $incidentData = [
            'title' => $data['title'],
            'description' => $data['description'],
            'severity' => $data['severity'] ?? 'medium',
            'priority' => $data['priority'] ?? 'normal',
            'category' => $data['category'] ?? 'other',
            'reported_by' => $reporter->id,
            'impact_description' => $data['impact_description'] ?? null,
            'affected_systems' => $data['affected_systems'] ?? null,
            'due_date' => $data['due_date'] ?? null,
        ];

        $incident = $this->incidentRepository->create($incidentData);

        // Create initial update log
        $this->updateRepository->createComment(
            $incident,
            $reporter,
            'Incident reported and logged into the system.',
            false
        );

        // Dispatch event
        event(new IncidentCreated($incident));

        return $incident->fresh(['reporter', 'assignedTo']);
    }

    /**
     * Update an incident.
     */
    public function update(Incident $incident, array $data, User $user): Incident
    {
        $oldData = $incident->toArray();

        $updateData = [];
        $updateFields = ['title', 'description', 'category', 'impact_description', 'affected_systems', 'due_date'];

        foreach ($updateFields as $field) {
            if (isset($data[$field])) {
                $updateData[$field] = $data[$field];
            }
        }

        // Handle severity change
        if (isset($data['severity']) && $data['severity'] !== $incident->severity->value) {
            $updateData['severity'] = $data['severity'];
            $this->updateRepository->create([
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'action_type' => ActionType::SEVERITY_CHANGE,
                'previous_value' => $incident->severity->value,
                'new_value' => $data['severity'],
            ]);
        }

        // Handle priority change
        if (isset($data['priority']) && $data['priority'] !== $incident->priority->value) {
            $updateData['priority'] = $data['priority'];
            $this->updateRepository->create([
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'action_type' => ActionType::PRIORITY_CHANGE,
                'previous_value' => $incident->priority->value,
                'new_value' => $data['priority'],
            ]);
        }

        if (!empty($updateData)) {
            $incident = $this->incidentRepository->update($incident, $updateData);

            // Log edit if other fields changed
            $this->updateRepository->create([
                'incident_id' => $incident->id,
                'user_id' => $user->id,
                'action_type' => ActionType::EDIT,
                'comment' => 'Incident details updated.',
            ]);
        }

        return $incident;
    }

    /**
     * Delete an incident.
     */
    public function delete(Incident $incident): bool
    {
        return $this->incidentRepository->delete($incident);
    }

    /**
     * Assign incident to operator.
     */
    public function assign(Incident $incident, ?int $operatorId, User $assignedBy): Incident
    {
        $previousAssignee = $incident->assignedTo?->name;
        $incident = $this->incidentRepository->assign($incident, $operatorId);
        $newAssignee = $incident->assignedTo?->name;

        // Create assignment update
        $this->updateRepository->createAssignmentChange(
            $incident,
            $assignedBy,
            $previousAssignee,
            $newAssignee
        );

        // Dispatch event if assigned to someone
        if ($operatorId) {
            event(new IncidentAssigned($incident, $incident->assignedTo));
        }

        return $incident;
    }

    /**
     * Get recent incidents.
     */
    public function getRecent(int $limit = 10, ?User $user = null): Collection
    {
        return $this->incidentRepository->getRecent($limit, $user);
    }

    /**
     * Get incidents assigned to user.
     */
    public function getAssignedTo(int $userId, ?int $limit = null): Collection
    {
        return $this->incidentRepository->getAssignedTo($userId, $limit);
    }

    /**
     * Get incidents at risk of SLA breach.
     */
    public function getAtRisk(int $hoursWithoutUpdate = 24): Collection
    {
        return $this->incidentRepository->getAtRisk($hoursWithoutUpdate);
    }

    /**
     * Get incident activity/updates.
     */
    public function getUpdates(Incident $incident, ?User $viewer = null): Collection
    {
        return $this->updateRepository->getForIncident($incident, $viewer);
    }

    /**
     * Add comment to incident.
     */
    public function addComment(Incident $incident, User $user, string $comment, bool $isInternal = false): void
    {
        $this->updateRepository->createComment($incident, $user, $comment, $isInternal);
    }

    /**
     * Get incident counts for filtering options.
     */
    public function getFilterCounts(): array
    {
        return [
            'by_status' => $this->incidentRepository->getCountByStatus(),
            'by_severity' => $this->incidentRepository->getCountBySeverity(),
            'by_category' => $this->incidentRepository->getCountByCategory(),
        ];
    }

    /**
     * Get categories list.
     */
    public function getCategories(): array
    {
        return Incident::getCategories();
    }
}
