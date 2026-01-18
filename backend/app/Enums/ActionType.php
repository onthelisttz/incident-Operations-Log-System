<?php

namespace App\Enums;

enum ActionType: string
{
    case STATUS_CHANGE = 'status_change';
    case COMMENT = 'comment';
    case ASSIGNMENT = 'assignment';
    case PRIORITY_CHANGE = 'priority_change';
    case SEVERITY_CHANGE = 'severity_change';
    case EDIT = 'edit';

    public function label(): string
    {
        return match($this) {
            self::STATUS_CHANGE => 'Status Changed',
            self::COMMENT => 'Comment Added',
            self::ASSIGNMENT => 'Assignment Changed',
            self::PRIORITY_CHANGE => 'Priority Changed',
            self::SEVERITY_CHANGE => 'Severity Changed',
            self::EDIT => 'Incident Edited',
        };
    }

    public function icon(): string
    {
        return match($this) {
            self::STATUS_CHANGE => 'arrow-right-circle',
            self::COMMENT => 'message-circle',
            self::ASSIGNMENT => 'user-plus',
            self::PRIORITY_CHANGE => 'flag',
            self::SEVERITY_CHANGE => 'alert-triangle',
            self::EDIT => 'edit',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
