<?php

namespace Database\Factories;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The current password being used by the factory.
     */
    protected static ?string $password;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= Hash::make('password'),
            'role' => UserRole::REPORTER,
            'phone' => fake()->optional()->phoneNumber(),
            'is_active' => true,
            'is_first_login' => false,
            'last_login_at' => fake()->optional()->dateTimeBetween('-30 days', 'now'),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Create an admin user.
     */
    public function admin(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::ADMIN,
        ]);
    }

    /**
     * Create an operator user.
     */
    public function operator(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::OPERATOR,
        ]);
    }

    /**
     * Create a reporter user.
     */
    public function reporter(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => UserRole::REPORTER,
        ]);
    }

    /**
     * Create an inactive user.
     */
    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }

    /**
     * Create a user requiring first login password change.
     */
    public function firstLogin(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_first_login' => true,
        ]);
    }
}
