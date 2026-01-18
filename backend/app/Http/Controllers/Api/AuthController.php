<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ChangePasswordRequest;
use App\Http\Requests\Auth\FirstLoginPasswordRequest;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Requests\Auth\UpdateProfileRequest;
use App\Http\Resources\PaginatedResource;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * @group Authentication
 *
 * APIs for user authentication and profile management
 */
class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    /**
     * Login
     *
     * Authenticate a user and return an API token.
     *
     * @unauthenticated
     * @bodyParam email string required The user's email. Example: admin@iols.local
     * @bodyParam password string required The user's password. Example: password
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->email,
            $request->password
        );

        return response()->json([
            'success' => true,
            'message' => 'Login successful.',
            'data' => [
                'user' => new UserResource($result['user']),
                'token' => $result['token'],
                'requires_password_change' => $result['requires_password_change'],
            ],
        ]);
    }

    /**
     * Logout
     *
     * Revoke the current access token.
     */
    public function logout(Request $request): JsonResponse
    {
        $this->authService->logout($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
        ]);
    }

    /**
     * Logout All Devices
     *
     * Revoke all access tokens for the user.
     */
    public function logoutAll(Request $request): JsonResponse
    {
        $this->authService->logoutAll($request->user());

        return response()->json([
            'success' => true,
            'message' => 'Logged out from all devices successfully.',
        ]);
    }

    /**
     * Forgot Password
     *
     * Send a password reset link to the user's email.
     *
     * @unauthenticated
     * @bodyParam email string required The user's email. Example: user@example.com
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $this->authService->sendPasswordResetLink($request->email);

        return response()->json([
            'success' => true,
            'message' => 'If an account with that email exists, a password reset link has been sent.',
        ]);
    }

    /**
     * Reset Password
     *
     * Reset the user's password using a reset token.
     *
     * @unauthenticated
     * @bodyParam email string required The user's email. Example: user@example.com
     * @bodyParam token string required The password reset token.
     * @bodyParam password string required The new password. Example: NewPassword123
     * @bodyParam password_confirmation string required Confirm the new password. Example: NewPassword123
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $this->authService->resetPassword(
            $request->email,
            $request->token,
            $request->password
        );

        return response()->json([
            'success' => true,
            'message' => 'Password has been reset successfully.',
        ]);
    }

    /**
     * Change Password
     *
     * Change the password for the authenticated user.
     *
     * @bodyParam current_password string required The current password.
     * @bodyParam password string required The new password. Example: NewPassword123
     * @bodyParam password_confirmation string required Confirm the new password. Example: NewPassword123
     */
    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $this->authService->changePassword(
            $request->user(),
            $request->current_password,
            $request->password
        );

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully.',
        ]);
    }

    /**
     * First Login Password Change
     *
     * Change password on first login (required).
     *
     * @bodyParam password string required The new password. Example: NewPassword123
     * @bodyParam password_confirmation string required Confirm the new password. Example: NewPassword123
     */
    public function firstLoginPassword(FirstLoginPasswordRequest $request): JsonResponse
    {
        $this->authService->firstLoginPasswordChange(
            $request->user(),
            $request->password
        );

        return response()->json([
            'success' => true,
            'message' => 'Password changed successfully. You can now access the system.',
        ]);
    }

    /**
     * Get Current User
     *
     * Get the authenticated user's profile.
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => new UserResource($request->user()),
        ]);
    }

    /**
     * Update Profile
     *
     * Update the authenticated user's profile.
     *
     * @bodyParam name string The user's name.
     * @bodyParam phone string The user's phone number.
     * @bodyParam avatar file The user's avatar image.
     */
    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar'] = $path;
        }

        $user = $this->authService->updateProfile($request->user(), $data);

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => new UserResource($user),
        ]);
    }
}
