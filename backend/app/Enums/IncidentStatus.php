<?php

namespace App\Enums;

enum IncidentStatus: string
{
    case OPEN = 'open';
    case INVESTIGATING = 'investigating';
    case RESOLVED = 'resolved';
    case CLOSED = 'closed';

    public function label(): string
    {
        return match($this) {
            self::OPEN => 'Open',
            self::INVESTIGATING => 'Investigating',
            self::RESOLVED => 'Resolved',
            self::CLOSED => 'Closed',
        };
    }

    public function color(): string
    {
        return match($this) {
            self::OPEN => 'red',
            self::INVESTIGATING => 'yellow',
            self::RESOLVED => 'blue',
            self::CLOSED => 'green',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get valid transitions from this status
     */
    public function validTransitions(): array
    {
        return match($this) {
            self::OPEN => [self::INVESTIGATING],
            self::INVESTIGATING => [self::RESOLVED],
            self::RESOLVED => [self::CLOSED],
            self::CLOSED => [],
        };
    }

    /**
     * Check if transition to target status is valid
     */
    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->validTransitions());
    }
}
