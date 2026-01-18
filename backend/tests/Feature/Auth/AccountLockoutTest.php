<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AccountLockoutTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create([
            'password' => bcrypt('password'),
            'is_active' => true,
            'login_attempts' => 0,
        ]);
    }

    public function test_user_can_login_with_correct_password(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response->assertOk();
        $this->assertEquals(0, $this->user->fresh()->login_attempts);
    }

    public function test_wrong_password_increments_attempts(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'wrong_password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
            
        $this->assertEquals(1, $this->user->fresh()->login_attempts);
        $this->assertStringContainsString('2 attempt(s) left', $response->json('errors.email.0'));
    }

    public function test_three_failed_attempts_block_user(): void
    {
        // Attempt 1
        $this->postJson('/api/auth/login', ['email' => $this->user->email, 'password' => 'wrong',]);
        
        // Attempt 2
        $this->postJson('/api/auth/login', ['email' => $this->user->email, 'password' => 'wrong',]);
        
        // Attempt 3
        $response = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'wrong',
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('blocked', $response->json('errors.email.0'));
        $this->assertFalse($this->user->fresh()->is_active);
    }

    public function test_blocked_user_cannot_login_even_with_correct_password(): void
    {
        $this->user->block();

        $response = $this->postJson('/api/auth/login', [
            'email' => $this->user->email,
            'password' => 'password',
        ]);

        $response->assertStatus(422);
        $this->assertStringContainsString('blocked', $response->json('errors.email.0'));
    }

    public function test_successful_login_resets_attempts(): void
    {
        // Fail once
        $this->postJson('/api/auth/login', ['email' => $this->user->email, 'password' => 'wrong',]);
        $this->assertEquals(1, $this->user->fresh()->login_attempts);

        // Success
        $this->postJson('/api/auth/login', ['email' => $this->user->email, 'password' => 'password',]);
        $this->assertEquals(0, $this->user->fresh()->login_attempts);
    }
}
