<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\User\StoreUserRequest;
use App\Http\Requests\User\UpdateUserRequest;
use App\Http\Resources\PaginatedResource;
use App\Http\Resources\UserResource;
use App\Services\ExportService;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group User Management
 *
 * APIs for managing users (Admin only)
 */
class UserController extends Controller
{
    public function __construct(
        protected UserService $userService,
        protected ExportService $exportService
    ) {}

    /**
     * List Users
     *
     * Get a paginated list of all users.
     *
     * @queryParam search string Search by name or email. Example: john
     * @queryParam role string Filter by role. Example: operator
     * @queryParam status string Filter by status (active/inactive). Example: active
     * @queryParam per_page integer Items per page. Example: 15
     * @queryParam page integer Page number. Example: 1
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['search', 'role', 'status', 'sort_by', 'sort_order']);
        $perPage = $request->input('per_page', 15);

        $users = $this->userService->getPaginated($filters, $perPage);

        return response()->json(
            PaginatedResource::format($users, UserResource::class)
        );
    }

    /**
     * Create User
     *
     * Create a new user. A welcome email with login credentials will be sent.
     *
     * @bodyParam name string required The user's name. Example: John Doe
     * @bodyParam email string required The user's email. Example: john@example.com
     * @bodyParam role string required The user's role (reporter, operator, admin). Example: operator
     * @bodyParam phone string The user's phone number. Example: +1234567890
     * @bodyParam is_active boolean Whether the user is active. Example: true
     */
    public function store(StoreUserRequest $request): JsonResponse
    {
        $user = $this->userService->create($request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User created successfully. A welcome email has been sent.',
            'data' => new UserResource($user),
        ], 201);
    }

    /**
     * Get User
     *
     * Get details of a specific user.
     *
     * @urlParam user integer required The user ID. Example: 1
     */
    public function show(int $user): JsonResponse
    {
        $userModel = $this->userService->find($user);

        if (!$userModel) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($userModel),
        ]);
    }

    /**
     * Update User
     *
     * Update a user's details.
     *
     * @urlParam user integer required The user ID. Example: 1
     * @bodyParam name string The user's name.
     * @bodyParam email string The user's email.
     * @bodyParam role string The user's role.
     * @bodyParam phone string The user's phone number.
     * @bodyParam is_active boolean Whether the user is active.
     */
    public function update(UpdateUserRequest $request, int $user): JsonResponse
    {
        $userModel = $this->userService->find($user);

        if (!$userModel) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $updatedUser = $this->userService->update($userModel, $request->validated());

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'data' => new UserResource($updatedUser),
        ]);
    }

    /**
     * Delete User
     *
     * Deactivate a user (soft delete).
     *
     * @urlParam user integer required The user ID. Example: 1
     */
    public function destroy(int $user): JsonResponse
    {
        $userModel = $this->userService->find($user);

        if (!$userModel) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $this->userService->delete($userModel);

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully.',
        ]);
    }

    /**
     * Get Operators
     *
     * Get a list of operators for assignment dropdowns.
     */
    public function operators(): JsonResponse
    {
        $operators = $this->userService->getOperators();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($operators),
        ]);
    }

    /**
     * Export Users
     *
     * Export users to CSV with optional filters.
     *
     * @queryParam search string Search by name or email.
     * @queryParam role string Filter by role.
     * @queryParam status string Filter by status.
     */
    public function export(Request $request)
    {
        $filters = $request->only(['search', 'role', 'status']);
        
        return $this->exportService->exportUsers($filters);
    }

    /**
     * Reset User Password
     *
     * Reset a user's password (generates new password and sends email).
     *
     * @urlParam user integer required The user ID. Example: 1
     */
    public function resetPassword(int $user): JsonResponse
    {
        $userModel = $this->userService->find($user);

        if (!$userModel) {
            return response()->json([
                'success' => false,
                'message' => 'User not found.',
            ], 404);
        }

        $this->userService->resetPassword($userModel);

        return response()->json([
            'success' => true,
            'message' => 'Password reset. A new password has been sent to the user.',
        ]);
    }

    /**
     * Toggle User Status (Block/Unblock)
     *
     * Block or unblock a user. When unblocking, login attempts are reset.
     *
     * @urlParam user integer required The user ID.
     */
    public function toggleStatus(Request $request, int $user): JsonResponse
    {
        $userModel = $this->userService->find($user);

        if (!$userModel) {
            return response()->json(['success' => false, 'message' => 'User not found.'], 404);
        }

        // Prevent self-blocking
        if ($userModel->id === $request->user()->id) {
            return response()->json(['success' => false, 'message' => 'You cannot block yourself.'], 403);
        }

        // Toggle logic
        if ($userModel->is_active) {
            $userModel->block();
            $message = 'User blocked successfully.';
        } else {
            $userModel->unblock();
            $message = 'User unblocked successfully.';
        }

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => new UserResource($userModel),
        ]);
    }
}
