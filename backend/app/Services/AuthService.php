<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function __construct(
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Attempt to login user.
     *
     * @throws ValidationException
     */
    public function login(string $email, string $password): array
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Check if user is blocked first
        if ($user->isBlocked()) {
            throw ValidationException::withMessages([
                'email' => ['Your account is blocked. Contact administrator.'],
            ]);
        }

        if (!Hash::check($password, $user->password)) {
            $user->incrementLoginAttempts();
            $attemptsLeft = 3 - $user->login_attempts;

            // If max attempts reached, block user
            if ($user->login_attempts >= 3) {
                $user->block();
                throw ValidationException::withMessages([
                    'email' => ['Your account is blocked. Contact administrator.'],
                ]);
            }

            throw ValidationException::withMessages([
                'email' => ["Wrong password. {$attemptsLeft} attempt(s) left."],
            ]);
        }

        // On success, reset attempts and check status again
        $user->resetLoginAttempts();
        
        // Update last login timestamp
        $this->userRepository->updateLastLogin($user);
        
        // Create API token
        $token = $user->createToken('auth-token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token,
            'requires_password_change' => $user->is_first_login,
        ];
    }

    /**
     * Logout user (revoke current token).
     */
    public function logout(User $user): void
    {
        $user->currentAccessToken()->delete();
    }

    /**
     * Logout from all devices (revoke all tokens).
     */
    public function logoutAll(User $user): void
    {
        $user->tokens()->delete();
    }

    /**
     * Send password reset link.
     *
     * @throws ValidationException
     */
    public function sendPasswordResetLink(string $email): void
    {
        $user = $this->userRepository->findByEmail($email);

        if (!$user) {
            // Don't reveal if user exists for security
            return;
        }

        $status = Password::sendResetLink(['email' => $email]);

        if ($status !== Password::RESET_LINK_SENT) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    /**
     * Reset password with token.
     *
     * @throws ValidationException
     */
    public function resetPassword(string $email, string $token, string $password): void
    {
        $status = Password::reset(
            [
                'email' => $email,
                'password' => $password,
                'password_confirmation' => $password,
                'token' => $token,
            ],
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'is_first_login' => false,
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            throw ValidationException::withMessages([
                'email' => [__($status)],
            ]);
        }
    }

    /**
     * Change password for authenticated user.
     *
     * @throws ValidationException
     */
    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (!Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($newPassword),
            'is_first_login' => false,
        ]);
    }

    /**
     * Change password on first login.
     *
     * @throws ValidationException
     */
    public function firstLoginPasswordChange(User $user, string $newPassword): void
    {
        if (!$user->is_first_login) {
            throw ValidationException::withMessages([
                'password' => ['Password change is not required.'],
            ]);
        }

        $user->update([
            'password' => Hash::make($newPassword),
            'is_first_login' => false,
        ]);
    }

    /**
     * Update user profile.
     */
    public function updateProfile(User $user, array $data): User
    {
        $updateData = [];

        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }

        if (isset($data['phone'])) {
            $updateData['phone'] = $data['phone'];
        }

        if (isset($data['avatar'])) {
            $updateData['avatar'] = $data['avatar'];
        }

        if (!empty($updateData)) {
            $user->update($updateData);
        }

        return $user->fresh();
    }
}
