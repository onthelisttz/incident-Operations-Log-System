<?php

namespace App\Policies;

use App\Models\Incident;
use App\Models\User;

class IncidentPolicy
{
    /**
     * Determine whether the user can view any incidents.
     */
    public function viewAny(User $user): bool
    {
        // All authenticated users can view incidents (filtered by role in repository)
        return true;
    }

    /**
     * Determine whether the user can view the incident.
     */
    public function view(User $user, Incident $incident): bool
    {
        // Admin can view all
        if ($user->isAdmin()) {
            return true;
        }

        // Operators can view incidents assigned to them or that they reported
        if ($user->isOperator()) {
            return $incident->assigned_to === $user->id || $incident->reported_by === $user->id;
        }

        // Reporters can only view their own incidents
        return $incident->reported_by === $user->id;
    }

    /**
     * Determine whether the user can create incidents.
     */
    public function create(User $user): bool
    {
        // Reporters and Admins can create incidents
        return $user->isReporter() || $user->isAdmin();
    }

    /**
     * Determine whether the user can update the incident.
     */
    public function update(User $user, Incident $incident): bool
    {
        // Only operators and admins can update incidents
        if (!$user->canManageIncidents()) {
            return false;
        }

        // Admin can update all
        if ($user->isAdmin()) {
            return true;
        }

        // Operators can only update incidents assigned to them
        return $incident->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can delete the incident.
     */
    public function delete(User $user, Incident $incident): bool
    {
        // Only admins can delete incidents
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the incident status.
     */
    public function updateStatus(User $user, Incident $incident): bool
    {
        // Only operators and admins can update status
        if (!$user->canManageIncidents()) {
            return false;
        }

        // Admin can update any status
        if ($user->isAdmin()) {
            return true;
        }

        // Operators can only update incidents assigned to them
        return $incident->assigned_to === $user->id;
    }

    /**
     * Determine whether the user can assign the incident.
     */
    public function assign(User $user, Incident $incident): bool
    {
        // Only admins can assign incidents
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can add comments to the incident.
     */
    public function addComment(User $user, Incident $incident): bool
    {
        // Same rules as viewing - if you can see it, you can comment
        return $this->view($user, $incident);
    }

    /**
     * Determine whether the user can add internal notes.
     */
    public function addInternalNote(User $user, Incident $incident): bool
    {
        // Only operators and admins can add internal notes
        return $user->canManageIncidents() && $this->view($user, $incident);
    }

    /**
     * Determine whether the user can upload attachments.
     */
    public function uploadAttachment(User $user, Incident $incident): bool
    {
        // Same rules as viewing - if you can see it, you can upload
        return $this->view($user, $incident);
    }

    /**
     * Determine whether the user can export incidents.
     */
    public function export(User $user): bool
    {
        // All authenticated users can export (filtered by role)
        return true;
    }
}
