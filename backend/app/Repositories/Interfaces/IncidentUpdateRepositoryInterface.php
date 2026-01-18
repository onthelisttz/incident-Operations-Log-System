<?php

namespace App\Repositories\Interfaces;

use App\Enums\ActionType;
use App\Models\Incident;
use App\Models\IncidentUpdate;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface IncidentUpdateRepositoryInterface
{
    /**
     * Get all updates for an incident.
     */
    public function getForIncident(Incident $incident, ?User $viewer = null): Collection;

    /**
     * Get paginated updates for an incident.
     */
    public function paginateForIncident(Incident $incident, ?User $viewer = null, int $perPage = 20): LengthAwarePaginator;

    /**
     * Create a new update/comment.
     */
    public function create(array $data): IncidentUpdate;

    /**
     * Create a status change update.
     */
    public function createStatusChange(Incident $incident, User $user, string $previousStatus, string $newStatus, ?string $comment = null): IncidentUpdate;

    /**
     * Create an assignment change update.
     */
    public function createAssignmentChange(Incident $incident, User $user, ?string $previousAssignee, ?string $newAssignee, ?string $comment = null): IncidentUpdate;

    /**
     * Create a comment.
     */
    public function createComment(Incident $incident, User $user, string $comment, bool $isInternal = false): IncidentUpdate;

    /**
     * Delete an update.
     */
    public function delete(IncidentUpdate $update): bool;

    /**
     * Get recent activity across all incidents.
     */
    public function getRecentActivity(int $limit = 20, ?User $user = null): Collection;
}
