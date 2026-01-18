<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    /**
     * Get all users with optional filtering.
     */
    public function all(array $filters = []): Collection;

    /**
     * Get paginated users with optional filtering.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator;

    /**
     * Find user by ID.
     */
    public function find(int $id): ?User;

    /**
     * Find user by email.
     */
    public function findByEmail(string $email): ?User;

    /**
     * Create a new user.
     */
    public function create(array $data): User;

    /**
     * Update a user.
     */
    public function update(User $user, array $data): User;

    /**
     * Delete a user.
     */
    public function delete(User $user): bool;

    /**
     * Get operators for assignment dropdown.
     */
    public function getOperators(): Collection;

    /**
     * Get active users count.
     */
    public function getActiveCount(): int;

    /**
     * Get count of users by role.
     */
    public function getCountByRole(): array;

    /**
     * Get count of users by status (active/inactive).
     */
    public function getCountByStatus(): array;

    /**
     * Update last login timestamp.
     */
    public function updateLastLogin(User $user): void;
}
