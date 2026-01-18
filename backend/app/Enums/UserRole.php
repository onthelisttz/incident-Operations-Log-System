<?php

namespace App\Enums;

enum UserRole: string
{
    case REPORTER = 'reporter';
    case OPERATOR = 'operator';
    case ADMIN = 'admin';

    public function label(): string
    {
        return match($this) {
            self::REPORTER => 'Reporter',
            self::OPERATOR => 'Operator',
            self::ADMIN => 'Administrator',
        };
    }

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
