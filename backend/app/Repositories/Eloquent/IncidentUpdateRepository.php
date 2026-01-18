<?php

namespace App\Repositories\Eloquent;

use App\Enums\ActionType;
use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\IncidentUpdate;
use App\Models\User;
use App\Repositories\Interfaces\IncidentUpdateRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class IncidentUpdateRepository implements IncidentUpdateRepositoryInterface
{
    /**
     * Get all updates for an incident.
     */
    public function getForIncident(Incident $incident, ?User $viewer = null): Collection
    {
        $query = $incident->updates()->with('user:id,name,email,role');

        // Filter internal updates for non-operators/admins
        if ($viewer && !$viewer->canManageIncidents()) {
            $query->public();
        }

        return $query->orderBy('created_at', 'desc')->get();
    }

    /**
     * Get paginated updates for an incident.
     */
    public function paginateForIncident(Incident $incident, ?User $viewer = null, int $perPage = 20): LengthAwarePaginator
    {
        $query = $incident->updates()->with('user:id,name,email,role');

        // Filter internal updates for non-operators/admins
        if ($viewer && !$viewer->canManageIncidents()) {
            $query->public();
        }

        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }

    /**
     * Create a new update/comment.
     */
    public function create(array $data): IncidentUpdate
    {
        return IncidentUpdate::create($data);
    }

    /**
     * Create a status change update.
     */
    public function createStatusChange(Incident $incident, User $user, string $previousStatus, string $newStatus, ?string $comment = null): IncidentUpdate
    {
        return $this->create([
            'incident_id' => $incident->id,
            'user_id' => $user->id,
            'action_type' => ActionType::STATUS_CHANGE,
            'previous_value' => $previousStatus,
            'new_value' => $newStatus,
            'comment' => $comment,
            'is_internal' => false,
        ]);
    }

    /**
     * Create an assignment change update.
     */
    public function createAssignmentChange(Incident $incident, User $user, ?string $previousAssignee, ?string $newAssignee, ?string $comment = null): IncidentUpdate
    {
        return $this->create([
            'incident_id' => $incident->id,
            'user_id' => $user->id,
            'action_type' => ActionType::ASSIGNMENT,
            'previous_value' => $previousAssignee,
            'new_value' => $newAssignee,
            'comment' => $comment,
            'is_internal' => false,
        ]);
    }

    /**
     * Create a comment.
     */
    public function createComment(Incident $incident, User $user, string $comment, bool $isInternal = false): IncidentUpdate
    {
        return $this->create([
            'incident_id' => $incident->id,
            'user_id' => $user->id,
            'action_type' => ActionType::COMMENT,
            'comment' => $comment,
            'is_internal' => $isInternal,
        ]);
    }

    /**
     * Delete an update.
     */
    public function delete(IncidentUpdate $update): bool
    {
        return $update->delete();
    }

    /**
     * Get recent activity across all incidents.
     */
    public function getRecentActivity(int $limit = 20, ?User $user = null): Collection
    {
        $query = IncidentUpdate::with(['user:id,name', 'incident:id,incident_number,title'])
            ->orderBy('created_at', 'desc');

        if ($user) {
            // Join with incidents to filter by user access
            $query->whereHas('incident', function ($q) use ($user) {
                if ($user->role === UserRole::REPORTER) {
                    $q->where('reported_by', $user->id);
                } elseif ($user->role === UserRole::OPERATOR) {
                    $q->where(function ($subQ) use ($user) {
                        $subQ->where('assigned_to', $user->id)
                             ->orWhere('reported_by', $user->id);
                    });
                }
            });

            // Hide internal updates from reporters
            if (!$user->canManageIncidents()) {
                $query->public();
            }
        }

        return $query->limit($limit)->get();
    }
}
