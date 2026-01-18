<?php

namespace Tests\Feature\Incident;

use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class IncidentManagementTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;
    protected User $operator;
    protected User $reporter;
    protected string $adminToken;
    protected string $operatorToken;
    protected string $reporterToken;

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
        $this->reporter = User::factory()->create([
            'role' => UserRole::REPORTER,
            'is_first_login' => false,
        ]);

        $this->adminToken = $this->admin->createToken('test')->plainTextToken;
        $this->operatorToken = $this->operator->createToken('test')->plainTextToken;
        $this->reporterToken = $this->reporter->createToken('test')->plainTextToken;
    }

    public function test_reporter_can_create_incident(): void
    {
        $response = $this->withToken($this->reporterToken)
            ->postJson('/api/incidents', [
                'title' => 'Test Incident',
                'description' => 'This is a test incident description.',
                'severity' => 'high',
                'priority' => 'urgent',
                'category' => 'network',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'incident_number', 'title', 'severity', 'status'],
            ]);

        $this->assertDatabaseHas('incidents', [
            'title' => 'Test Incident',
            'reported_by' => $this->reporter->id,
        ]);
    }

    public function test_operator_cannot_create_incident(): void
    {
        $response = $this->withToken($this->operatorToken)
            ->postJson('/api/incidents', [
                'title' => 'Test Incident',
                'description' => 'This is a test incident description.',
            ]);

        $response->assertStatus(403);
    }

    public function test_reporter_can_only_see_own_incidents(): void
    {
        // Create incidents for different users
        Incident::factory()->create(['reported_by' => $this->reporter->id]);
        Incident::factory()->create(['reported_by' => $this->admin->id]);

        $response = $this->withToken($this->reporterToken)
            ->getJson('/api/incidents');

        $response->assertOk();
        
        $data = $response->json('data');
        foreach ($data as $incident) {
            $this->assertEquals($this->reporter->id, 
                Incident::find($incident['id'])->reported_by);
        }
    }

    public function test_admin_can_see_all_incidents(): void
    {
        Incident::factory()->count(5)->create();

        $response = $this->withToken($this->adminToken)
            ->getJson('/api/incidents');

        $response->assertOk();
        $this->assertCount(5, $response->json('data'));
    }

    public function test_admin_can_assign_incident(): void
    {
        $incident = Incident::factory()->create(['assigned_to' => null]);

        $response = $this->withToken($this->adminToken)
            ->patchJson("/api/incidents/{$incident->id}/assign", [
                'operator_id' => $this->operator->id,
            ]);

        $response->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('incidents', [
            'id' => $incident->id,
            'assigned_to' => $this->operator->id,
        ]);
    }

    public function test_operator_cannot_assign_incident(): void
    {
        $incident = Incident::factory()->create(['assigned_to' => null]);

        $response = $this->withToken($this->operatorToken)
            ->patchJson("/api/incidents/{$incident->id}/assign", [
                'operator_id' => $this->operator->id,
            ]);

        $response->assertStatus(403);
    }

    public function test_status_transition_follows_rules(): void
    {
        $incident = Incident::factory()->create([
            'status' => IncidentStatus::OPEN,
            'assigned_to' => $this->operator->id,
        ]);

        // Valid: Open -> Investigating
        $response = $this->withToken($this->operatorToken)
            ->patchJson("/api/incidents/{$incident->id}/status", [
                'status' => 'investigating',
            ]);

        $response->assertOk();
        $this->assertDatabaseHas('incidents', [
            'id' => $incident->id,
            'status' => 'investigating',
        ]);
    }

    public function test_invalid_status_transition_is_rejected(): void
    {
        $incident = Incident::factory()->create([
            'status' => IncidentStatus::OPEN,
            'assigned_to' => $this->operator->id,
        ]);

        // Invalid: Open -> Resolved (must go through investigating)
        $response = $this->withToken($this->operatorToken)
            ->patchJson("/api/incidents/{$incident->id}/status", [
                'status' => 'resolved',
            ]);

        $response->assertStatus(422);
    }

    public function test_user_can_add_comment(): void
    {
        $incident = Incident::factory()->create([
            'reported_by' => $this->reporter->id,
        ]);

        $response = $this->withToken($this->reporterToken)
            ->postJson("/api/incidents/{$incident->id}/comments", [
                'comment' => 'This is a test comment.',
            ]);

        $response->assertOk()
            ->assertJson(['success' => true]);

        $this->assertDatabaseHas('incident_updates', [
            'incident_id' => $incident->id,
            'user_id' => $this->reporter->id,
            'comment' => 'This is a test comment.',
        ]);
    }

    public function test_only_admin_can_delete_incident(): void
    {
        $incident = Incident::factory()->create();

        // Reporter cannot delete
        $response = $this->withToken($this->reporterToken)
            ->deleteJson("/api/incidents/{$incident->id}");
        $response->assertStatus(403);

        // Admin can delete
        $response = $this->withToken($this->adminToken)
            ->deleteJson("/api/incidents/{$incident->id}");
        $response->assertOk();

        $this->assertDatabaseMissing('incidents', ['id' => $incident->id]);
    }

    public function test_incident_list_can_be_filtered(): void
    {
        Incident::factory()->create(['severity' => IncidentSeverity::CRITICAL]);
        Incident::factory()->create(['severity' => IncidentSeverity::LOW]);

        $response = $this->withToken($this->adminToken)
            ->getJson('/api/incidents?severity=critical');

        $response->assertOk();
        
        $data = $response->json('data');
        foreach ($data as $incident) {
            $this->assertEquals('critical', $incident['severity']['value']);
        }
    }
}
