<?php

namespace Tests\Feature\User;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $targetUser;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $this->targetUser = User::factory()->create();
    }

    public function test_admin_can_block_user(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/users/{$this->targetUser->id}/toggle-status");

        $response->assertOk();
        $this->assertFalse($this->targetUser->fresh()->is_active);
    }

    public function test_admin_can_unblock_user_and_reset_attempts(): void
    {
        $this->targetUser->update(['is_active' => false, 'login_attempts' => 3]);

        $response = $this->actingAs($this->admin)
            ->patchJson("/api/users/{$this->targetUser->id}/toggle-status");

        $response->assertOk();
        $this->assertTrue($this->targetUser->fresh()->is_active);
        $this->assertEquals(0, $this->targetUser->fresh()->login_attempts);
    }

    public function test_admin_cannot_block_themselves(): void
    {
        $response = $this->actingAs($this->admin)
            ->patchJson("/api/users/{$this->admin->id}/toggle-status");

        $response->assertStatus(403)
            ->assertJson(['message' => 'You cannot block yourself.']);
            
        $this->assertTrue($this->admin->fresh()->is_active);
    }
}
