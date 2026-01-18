<?php

namespace Tests\Unit\Enums;

use App\Enums\UserRole;
use PHPUnit\Framework\TestCase;

class UserRoleTest extends TestCase
{
    public function test_role_has_correct_values(): void
    {
        $this->assertEquals('reporter', UserRole::REPORTER->value);
        $this->assertEquals('operator', UserRole::OPERATOR->value);
        $this->assertEquals('admin', UserRole::ADMIN->value);
    }

    public function test_role_has_labels(): void
    {
        $this->assertEquals('Reporter', UserRole::REPORTER->label());
        $this->assertEquals('Operator', UserRole::OPERATOR->label());
        $this->assertEquals('Administrator', UserRole::ADMIN->label());
    }

    public function test_values_returns_all_role_values(): void
    {
        $values = UserRole::values();
        
        $this->assertContains('reporter', $values);
        $this->assertContains('operator', $values);
        $this->assertContains('admin', $values);
        $this->assertCount(3, $values);
    }
}
