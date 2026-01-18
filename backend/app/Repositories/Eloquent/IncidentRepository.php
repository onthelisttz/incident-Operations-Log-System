<?php

namespace App\Repositories\Eloquent;

use App\Enums\IncidentStatus;
use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\User;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class IncidentRepository implements IncidentRepositoryInterface
{
    /**
     * Get all incidents with optional filtering.
     */
    public function all(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Get paginated incidents with optional filtering.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->buildQuery($filters)
            ->with(['reporter:id,name,email', 'assignedTo:id,name,email'])
            ->paginate($perPage);
    }

    /**
     * Get paginated incidents filtered by user role and access.
     */
    public function paginateForUser(User $user, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = $this->buildQuery($filters)
            ->with(['reporter:id,name,email', 'assignedTo:id,name,email']);

        // Apply role-based filtering
        if ($user->role === UserRole::REPORTER) {
            // Reporters can only see their own incidents
            $query->where('reported_by', $user->id);
        } elseif ($user->role === UserRole::OPERATOR) {
            // Operators can see incidents assigned to them
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('reported_by', $user->id);
            });
        }
        // Admins can see all incidents (no additional filter)

        return $query->paginate($perPage);
    }

    /**
     * Find incident by ID.
     */
    public function find(int $id): ?Incident
    {
        return Incident::with(['reporter', 'assignedTo'])->find($id);
    }

    /**
     * Find incident by incident number.
     */
    public function findByNumber(string $incidentNumber): ?Incident
    {
        return Incident::with(['reporter', 'assignedTo'])
            ->where('incident_number', $incidentNumber)
            ->first();
    }

    /**
     * Create a new incident.
     */
    public function create(array $data): Incident
    {
        // Generate incident number if not provided
        if (empty($data['incident_number'])) {
            $data['incident_number'] = Incident::generateIncidentNumber();
        }

        return Incident::create($data);
    }

    /**
     * Update an incident.
     */
    public function update(Incident $incident, array $data): Incident
    {
        $incident->update($data);
        return $incident->fresh(['reporter', 'assignedTo']);
    }

    /**
     * Delete an incident.
     */
    public function delete(Incident $incident): bool
    {
        return $incident->delete();
    }

    /**
     * Update incident status.
     */
    public function updateStatus(Incident $incident, IncidentStatus $status, ?string $notes = null): Incident
    {
        $updateData = ['status' => $status];

        // Set timestamps based on status
        if ($status === IncidentStatus::RESOLVED) {
            $updateData['resolved_at'] = now();
            if ($notes) {
                $updateData['resolution_notes'] = $notes;
            }
        } elseif ($status === IncidentStatus::CLOSED) {
            $updateData['closed_at'] = now();
        }

        $incident->update($updateData);
        return $incident->fresh(['reporter', 'assignedTo']);
    }

    /**
     * Assign incident to operator.
     */
    public function assign(Incident $incident, ?int $operatorId): Incident
    {
        $incident->update(['assigned_to' => $operatorId]);
        return $incident->fresh(['reporter', 'assignedTo']);
    }

    /**
     * Get recent incidents.
     */
    public function getRecent(int $limit = 10, ?User $user = null): Collection
    {
        $query = Incident::with(['reporter:id,name', 'assignedTo:id,name'])
            ->orderBy('created_at', 'desc');

        if ($user) {
            if ($user->role === UserRole::REPORTER) {
                $query->where('reported_by', $user->id);
            } elseif ($user->role === UserRole::OPERATOR) {
                $query->where(function ($q) use ($user) {
                    $q->where('assigned_to', $user->id)
                      ->orWhere('reported_by', $user->id);
                });
            }
        }

        return $query->limit($limit)->get();
    }

    /**
     * Get incidents assigned to a user.
     */
    public function getAssignedTo(int $userId, int $limit = null): Collection
    {
        $query = Incident::with(['reporter:id,name'])
            ->where('assigned_to', $userId)
            ->unresolved()
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc');

        if ($limit) {
            $query->limit($limit);
        }

        return $query->get();
    }

    /**
     * Get incident counts by status.
     */
    public function getCountByStatus(?User $user = null): array
    {
        $query = Incident::select('status', DB::raw('count(*) as count'));
        
        if ($user) {
            $this->applyUserFilter($query, $user);
        }

        return $query->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    /**
     * Get incident counts by severity.
     */
    public function getCountBySeverity(?User $user = null): array
    {
        $query = Incident::select('severity', DB::raw('count(*) as count'));

        if ($user) {
            $this->applyUserFilter($query, $user);
        }

        return $query->groupBy('severity')
            ->pluck('count', 'severity')
            ->toArray();
    }

    /**
     * Get incident counts by category.
     */
    public function getCountByCategory(?User $user = null): array
    {
        $query = Incident::select('category', DB::raw('count(*) as count'));

        if ($user) {
            $this->applyUserFilter($query, $user);
        }

        return $query->groupBy('category')
            ->pluck('count', 'category')
            ->toArray();
    }

    /**
     * Apply user role-based filtering to the query.
     */
    protected function applyUserFilter($query, User $user): void
    {
        if ($user->role === UserRole::REPORTER) {
            $query->where('reported_by', $user->id);
        } elseif ($user->role === UserRole::OPERATOR) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_to', $user->id)
                  ->orWhere('reported_by', $user->id);
            });
        }
    }

    /**
     * Get incidents at risk (not updated in specified hours).
     */
    public function getAtRisk(int $hoursWithoutUpdate = 24): Collection
    {
        return Incident::with(['reporter:id,name', 'assignedTo:id,name'])
            ->atRisk($hoursWithoutUpdate)
            ->orderBy('severity', 'desc')
            ->orderBy('updated_at', 'asc')
            ->get();
    }

    /**
     * Get total count.
     */
    public function getCount(array $filters = []): int
    {
        return $this->buildQuery($filters)->count();
    }

    /**
     * Build query with filters.
     */
    protected function buildQuery(array $filters = [])
    {
        $query = Incident::query();

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Status filter
        if (!empty($filters['status'])) {
            $query->status($filters['status']);
        }

        // Severity filter
        if (!empty($filters['severity'])) {
            $query->severity($filters['severity']);
        }

        // Priority filter
        if (!empty($filters['priority'])) {
            $query->priority($filters['priority']);
        }

        // Category filter
        if (!empty($filters['category'])) {
            $query->category($filters['category']);
        }

        // Date range filter
        if (!empty($filters['from_date']) || !empty($filters['to_date'])) {
            $query->dateRange($filters['from_date'] ?? null, $filters['to_date'] ?? null);
        }

        // Assigned to filter
        if (!empty($filters['assigned_to'])) {
            $query->assignedTo($filters['assigned_to']);
        }

        // Reported by filter
        if (!empty($filters['reported_by'])) {
            $query->reportedBy($filters['reported_by']);
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }
}
