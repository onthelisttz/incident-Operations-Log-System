<?php

namespace Tests\Unit\Policies;

use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\User;
use App\Policies\IncidentPolicy;
use Tests\TestCase;

class IncidentPolicyTest extends TestCase
{
    protected IncidentPolicy $policy;
    protected User $admin;
    protected User $operator;
    protected User $reporter;
    protected Incident $incident;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->policy = new IncidentPolicy();
        
        $this->admin = User::factory()->create(['role' => UserRole::ADMIN]);
        $this->operator = User::factory()->create(['role' => UserRole::OPERATOR]);
        $this->reporter = User::factory()->create(['role' => UserRole::REPORTER]);
        
        $this->incident = Incident::factory()->create([
            'reported_by' => $this->reporter->id,
            'assigned_to' => $this->operator->id,
        ]);
    }

    public function test_admin_can_view_any_incident(): void
    {
        $this->assertTrue($this->policy->view($this->admin, $this->incident));
    }

    public function test_operator_can_view_assigned_incident(): void
    {
        $this->assertTrue($this->policy->view($this->operator, $this->incident));
    }

    public function test_reporter_can_view_own_incident(): void
    {
        $this->assertTrue($this->policy->view($this->reporter, $this->incident));
    }

    public function test_reporter_cannot_view_others_incident(): void
    {
        $otherReporter = User::factory()->create(['role' => UserRole::REPORTER]);
        $this->assertFalse($this->policy->view($otherReporter, $this->incident));
    }

    public function test_reporter_can_create_incident(): void
    {
        $this->assertTrue($this->policy->create($this->reporter));
    }

    public function test_admin_can_create_incident(): void
    {
        $this->assertTrue($this->policy->create($this->admin));
    }

    public function test_operator_cannot_create_incident(): void
    {
        $this->assertFalse($this->policy->create($this->operator));
    }

    public function test_admin_can_update_any_incident(): void
    {
        $this->assertTrue($this->policy->update($this->admin, $this->incident));
    }

    public function test_operator_can_update_assigned_incident(): void
    {
        $this->assertTrue($this->policy->update($this->operator, $this->incident));
    }

    public function test_operator_cannot_update_unassigned_incident(): void
    {
        $otherOperator = User::factory()->create(['role' => UserRole::OPERATOR]);
        $this->assertFalse($this->policy->update($otherOperator, $this->incident));
    }

    public function test_reporter_cannot_update_incident(): void
    {
        $this->assertFalse($this->policy->update($this->reporter, $this->incident));
    }

    public function test_only_admin_can_delete_incident(): void
    {
        $this->assertTrue($this->policy->delete($this->admin, $this->incident));
        $this->assertFalse($this->policy->delete($this->operator, $this->incident));
        $this->assertFalse($this->policy->delete($this->reporter, $this->incident));
    }

    public function test_only_admin_can_assign_incident(): void
    {
        $this->assertTrue($this->policy->assign($this->admin, $this->incident));
        $this->assertFalse($this->policy->assign($this->operator, $this->incident));
        $this->assertFalse($this->policy->assign($this->reporter, $this->incident));
    }

    public function test_viewer_can_add_comment(): void
    {
        $this->assertTrue($this->policy->addComment($this->reporter, $this->incident));
        $this->assertTrue($this->policy->addComment($this->operator, $this->incident));
        $this->assertTrue($this->policy->addComment($this->admin, $this->incident));
    }

    public function test_only_operators_and_admins_can_add_internal_notes(): void
    {
        $this->assertTrue($this->policy->addInternalNote($this->admin, $this->incident));
        $this->assertTrue($this->policy->addInternalNote($this->operator, $this->incident));
        $this->assertFalse($this->policy->addInternalNote($this->reporter, $this->incident));
    }
}
