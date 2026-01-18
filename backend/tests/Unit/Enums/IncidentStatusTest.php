<?php

namespace Tests\Unit\Enums;

use App\Enums\IncidentStatus;
use PHPUnit\Framework\TestCase;

class IncidentStatusTest extends TestCase
{
    public function test_status_has_correct_values(): void
    {
        $this->assertEquals('open', IncidentStatus::OPEN->value);
        $this->assertEquals('investigating', IncidentStatus::INVESTIGATING->value);
        $this->assertEquals('resolved', IncidentStatus::RESOLVED->value);
        $this->assertEquals('closed', IncidentStatus::CLOSED->value);
    }

    public function test_status_has_labels(): void
    {
        $this->assertEquals('Open', IncidentStatus::OPEN->label());
        $this->assertEquals('Investigating', IncidentStatus::INVESTIGATING->label());
        $this->assertEquals('Resolved', IncidentStatus::RESOLVED->label());
        $this->assertEquals('Closed', IncidentStatus::CLOSED->label());
    }

    public function test_status_has_colors(): void
    {
        $this->assertNotEmpty(IncidentStatus::OPEN->color());
        $this->assertNotEmpty(IncidentStatus::INVESTIGATING->color());
        $this->assertNotEmpty(IncidentStatus::RESOLVED->color());
        $this->assertNotEmpty(IncidentStatus::CLOSED->color());
    }

    public function test_open_can_transition_to_investigating(): void
    {
        $this->assertTrue(
            IncidentStatus::OPEN->canTransitionTo(IncidentStatus::INVESTIGATING)
        );
    }

    public function test_open_cannot_skip_to_resolved(): void
    {
        $this->assertFalse(
            IncidentStatus::OPEN->canTransitionTo(IncidentStatus::RESOLVED)
        );
    }

    public function test_open_cannot_skip_to_closed(): void
    {
        $this->assertFalse(
            IncidentStatus::OPEN->canTransitionTo(IncidentStatus::CLOSED)
        );
    }

    public function test_investigating_can_transition_to_resolved(): void
    {
        $this->assertTrue(
            IncidentStatus::INVESTIGATING->canTransitionTo(IncidentStatus::RESOLVED)
        );
    }

    public function test_investigating_cannot_go_back_to_open(): void
    {
        $this->assertFalse(
            IncidentStatus::INVESTIGATING->canTransitionTo(IncidentStatus::OPEN)
        );
    }

    public function test_resolved_can_transition_to_closed(): void
    {
        $this->assertTrue(
            IncidentStatus::RESOLVED->canTransitionTo(IncidentStatus::CLOSED)
        );
    }

    public function test_closed_cannot_transition_anywhere(): void
    {
        $this->assertEmpty(IncidentStatus::CLOSED->validTransitions());
    }

    public function test_values_returns_all_status_values(): void
    {
        $values = IncidentStatus::values();
        
        $this->assertContains('open', $values);
        $this->assertContains('investigating', $values);
        $this->assertContains('resolved', $values);
        $this->assertContains('closed', $values);
        $this->assertCount(4, $values);
    }
}
