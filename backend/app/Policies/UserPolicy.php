<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        // Only admins can view user list
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        // Admins can view any user
        if ($user->isAdmin()) {
            return true;
        }

        // Users can view their own profile
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can create users.
     */
    public function create(User $user): bool
    {
        // Only admins can create users
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can update the user.
     */
    public function update(User $user, User $model): bool
    {
        // Admins can update any user
        if ($user->isAdmin()) {
            return true;
        }

        // Users can update their own profile (limited fields handled in controller)
        return $user->id === $model->id;
    }

    /**
     * Determine whether the user can delete/deactivate the user.
     */
    public function delete(User $user, User $model): bool
    {
        // Only admins can delete users
        if (!$user->isAdmin()) {
            return false;
        }

        // Prevent self-deletion
        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can reset another user's password.
     */
    public function resetPassword(User $user, User $model): bool
    {
        // Only admins can reset passwords
        if (!$user->isAdmin()) {
            return false;
        }

        // Can't reset own password through admin panel (use change password)
        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can change roles.
     */
    public function changeRole(User $user, User $model): bool
    {
        // Only admins can change roles
        if (!$user->isAdmin()) {
            return false;
        }

        // Prevent changing own role
        return $user->id !== $model->id;
    }

    /**
     * Determine whether the user can export users.
     */
    public function export(User $user): bool
    {
        // Only admins can export users
        return $user->isAdmin();
    }

    /**
     * Determine whether the user can view operators list.
     */
    public function viewOperators(User $user): bool
    {
        // Admins can view operators for assignment
        return $user->isAdmin();
    }
}
