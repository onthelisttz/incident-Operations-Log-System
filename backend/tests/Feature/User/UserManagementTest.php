<?php

namespace Tests\Feature\User;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $operator;
    protected string $adminToken;
    protected string $operatorToken;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'is_first_login' => false,
        ]);
        $this->operator = User::factory()->create([
            'role' => UserRole::OPERATOR,
            'is_first_login' => false,
        ]);

        $this->adminToken = $this->admin->createToken('test')->plainTextToken;
        $this->operatorToken = $this->operator->createToken('test')->plainTextToken;
    }

    public function test_admin_can_list_users(): void
    {
        User::factory()->count(5)->create();

        $response = $this->withToken($this->adminToken)
            ->getJson('/api/users');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data',
                'meta' => ['current_page', 'per_page', 'total'],
            ]);
    }

    public function test_non_admin_cannot_list_users(): void
    {
        $response = $this->withToken($this->operatorToken)
            ->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_admin_can_create_user(): void
    {
        $response = $this->withToken($this->adminToken)
            ->postJson('/api/users', [
                'name' => 'New User',
                'email' => 'newuser@example.com',
                'role' => 'operator',
                'phone' => '+1234567890',
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'User created successfully. A welcome email has been sent.',
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
            'role' => 'operator',
            'is_first_login' => true,
        ]);
    }

    public function test_admin_cannot_create_user_with_duplicate_email(): void
    {
        $existingUser = User::factory()->create();

        $response = $this->withToken($this->adminToken)
            ->postJson('/api/users', [
                'name' => 'New User',
                'email' => $existingUser->email,
                'role' => 'operator',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_admin_can_update_user(): void
    {
        $user = User::factory()->create(['role' => UserRole::REPORTER]);

        $response = $this->withToken($this->adminToken)
            ->putJson("/api/users/{$user->id}", [
                'name' => 'Updated Name',
                'role' => 'operator',
            ]);

        $response->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'role' => 'operator',
        ]);
    }

    public function test_admin_can_deactivate_user(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $response = $this->withToken($this->adminToken)
            ->deleteJson("/api/users/{$user->id}");

        $response->assertOk()
            ->assertJson([
                'success' => true,
                'message' => 'User deactivated successfully.',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'is_active' => false,
        ]);
    }

    public function test_admin_can_get_operators_list(): void
    {
        User::factory()->count(3)->create(['role' => UserRole::OPERATOR]);

        $response = $this->withToken($this->adminToken)
            ->getJson('/api/users/operators');

        $response->assertOk()
            ->assertJsonStructure([
                'success',
                'data' => [['id', 'name', 'email', 'role']],
            ]);
    }

    public function test_user_role_validation(): void
    {
        $response = $this->withToken($this->adminToken)
            ->postJson('/api/users', [
                'name' => 'New User',
                'email' => 'test@example.com',
                'role' => 'invalid_role',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['role']);
    }
}
