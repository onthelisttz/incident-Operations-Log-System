<?php

namespace App\Services;

use App\Events\UserCreated;
use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get paginated users with filters.
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->userRepository->paginate($filters, $perPage);
    }

    /**
     * Get all users.
     */
    public function getAll(array $filters = []): Collection
    {
        return $this->userRepository->all($filters);
    }

    /**
     * Find user by ID.
     */
    public function find(int $id): ?User
    {
        return $this->userRepository->find($id);
    }

    /**
     * Create a new user with welcome email.
     */
    public function create(array $data): User
    {
        // Generate random default password
        $defaultPassword = Str::random(12);

        $userData = [
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($defaultPassword),
            'role' => $data['role'],
            'phone' => $data['phone'] ?? null,
            'is_active' => $data['is_active'] ?? true,
            'is_first_login' => true, // Force password change on first login
        ];

        $user = $this->userRepository->create($userData);

        // Dispatch event to send welcome email with password
        event(new UserCreated($user, $defaultPassword));

        return $user;
    }

    /**
     * Update a user.
     */
    public function update(User $user, array $data): User
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }

        if (isset($data['role'])) {
            $updateData['role'] = $data['role'];
        }

        if (isset($data['phone'])) {
            $updateData['phone'] = $data['phone'];
        }

        if (isset($data['is_active'])) {
            $updateData['is_active'] = $data['is_active'];
        }

        if (isset($data['avatar'])) {
            $updateData['avatar'] = $data['avatar'];
        }

        return $this->userRepository->update($user, $updateData);
    }

    /**
     * Delete a user (permanently).
     */
    public function delete(User $user): bool
    {
        return $this->userRepository->delete($user);
    }

    /**
     * Get operators for assignment.
     */
    public function getOperators(): Collection
    {
        return $this->userRepository->getOperators();
    }

    /**
     * Get user statistics for dashboard.
     */
    public function getStatistics(): array
    {
        $users = $this->userRepository->all();

        return [
            'total' => $users->count(),
            'active' => $users->where('is_active', true)->count(),
            'inactive' => $users->where('is_active', false)->count(),
            'by_role' => [
                'admin' => $users->where('role.value', 'admin')->count(),
                'operator' => $users->where('role.value', 'operator')->count(),
                'reporter' => $users->where('role.value', 'reporter')->count(),
            ],
        ];
    }

    /**
     * Reset user's password (admin action).
     */
    public function resetPassword(User $user): string
    {
        $newPassword = Str::random(12);

        $this->userRepository->update($user, [
            'password' => Hash::make($newPassword),
            'is_first_login' => true,
        ]);

        // Dispatch event to send email with new password
        event(new UserCreated($user, $newPassword));

        return $newPassword;
    }
}
