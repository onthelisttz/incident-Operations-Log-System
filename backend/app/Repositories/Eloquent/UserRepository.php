<?php

namespace App\Repositories\Eloquent;

use App\Enums\UserRole;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class UserRepository implements UserRepositoryInterface
{
    /**
     * Get all users with optional filtering.
     */
    public function all(array $filters = []): Collection
    {
        return $this->buildQuery($filters)->get();
    }

    /**
     * Get paginated users with optional filtering.
     */
    public function paginate(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->buildQuery($filters)->paginate($perPage);
    }

    /**
     * Find user by ID.
     */
    public function find(int $id): ?User
    {
        return User::find($id);
    }

    /**
     * Find user by email.
     */
    public function findByEmail(string $email): ?User
    {
        return User::where('email', $email)->first();
    }

    /**
     * Create a new user.
     */
    public function create(array $data): User
    {
        return User::create($data);
    }

    /**
     * Update a user.
     */
    public function update(User $user, array $data): User
    {
        $user->update($data);
        return $user->fresh();
    }

    /**
     * Delete a user.
     */
    public function delete(User $user): bool
    {
        return $user->delete();
    }

    /**
     * Get operators for assignment dropdown.
     */
    public function getOperators(): Collection
    {
        return User::active()
            ->where('role', UserRole::OPERATOR->value)
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role']);
    }

    /**
     * Get active users count.
     */
    public function getActiveCount(): int
    {
        return User::active()->count();
    }

    /**
     * Get count of users by role.
     */
    public function getCountByRole(): array
    {
        return [
            'admin' => User::where('role', UserRole::ADMIN->value)->count(),
            'operator' => User::where('role', UserRole::OPERATOR->value)->count(),
            'reporter' => User::where('role', UserRole::REPORTER->value)->count(),
        ];
    }

    /**
     * Get count of users by status (active/inactive).
     */
    public function getCountByStatus(): array
    {
        return [
            'active' => User::where('is_active', true)->count(),
            'inactive' => User::where('is_active', false)->count(),
        ];
    }

    /**
     * Update last login timestamp.
     */
    public function updateLastLogin(User $user): void
    {
        $user->update(['last_login_at' => now()]);
    }

    /**
     * Build query with filters.
     */
    protected function buildQuery(array $filters = [])
    {
        $query = User::query();

        // Search filter
        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        // Role filter
        if (!empty($filters['role'])) {
            $query->role($filters['role']);
        }

        // Status filter
        if (isset($filters['status'])) {
            $isActive = $filters['status'] === 'active';
            $query->where('is_active', $isActive);
        }

        // Active only
        if (!empty($filters['active_only'])) {
            $query->active();
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }
}
