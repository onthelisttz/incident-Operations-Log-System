<?php

namespace App\Repositories\Interfaces;

use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface IncidentRepositoryInterface
{
    /**
     * Get all incidents with optional filtering.
     */
    public function all(array $filters = []): Collection;

    /**
     * Get paginated incidents with optional filtering.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Get paginated incidents filtered by user role and access.
     */
    public function paginateForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find incident by ID.
     */
    public function find(int $id): ?Incident;

    /**
     * Find incident by incident number.
     */
    public function findByNumber(string $incidentNumber): ?Incident;

    /**
     * Create a new incident.
     */
    public function create(array $data): Incident;

    /**
     * Update an incident.
     */
    public function update(Incident $incident, array $data): Incident;

    /**
     * Delete an incident.
     */
    public function delete(Incident $incident): bool;

    /**
     * Update incident status.
     */
    public function updateStatus(Incident $incident, IncidentStatus $status, ?string $notes = null): Incident;

    /**
     * Assign incident to operator.
     */
    public function assign(Incident $incident, ?int $operatorId): Incident;

    /**
     * Get recent incidents.
     */
    public function getRecent(int $limit = 10, ?User $user = null): Collection;

    /**
     * Get incidents assigned to a user.
     */
    public function getAssignedTo(int $userId, int $limit = null): Collection;

    /**
     * Get incident counts by status.
     */
    public function getCountByStatus(): array;

    /**
     * Get incident counts by severity.
     */
    public function getCountBySeverity(): array;

    /**
     * Get incident counts by category.
     */
    public function getCountByCategory(): array;

    /**
     * Get incidents at risk (not updated in specified hours).
     */
    public function getAtRisk(int $hoursWithoutUpdate = 24): Collection;

    /**
     * Get total count.
     */
    public function getCount(array $filters = []): int;
}
