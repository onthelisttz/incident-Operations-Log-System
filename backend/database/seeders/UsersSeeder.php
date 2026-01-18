<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create Admin user
        User::create([
            'name' => 'System Administrator',
            'email' => 'admin@iols.local',
            'password' => Hash::make('password'),
            'role' => UserRole::ADMIN,
            'phone' => '+1234567890',
            'is_active' => true,
            'is_first_login' => false, // Test user, no need for password change
            'email_verified_at' => now(),
        ]);

        // Create Operator users
        $operators = [
            ['name' => 'John Operator', 'email' => 'john.operator@iols.local'],
            ['name' => 'Jane Operator', 'email' => 'jane.operator@iols.local'],
            ['name' => 'Mike Handler', 'email' => 'mike.handler@iols.local'],
        ];

        foreach ($operators as $operator) {
            User::create([
                'name' => $operator['name'],
                'email' => $operator['email'],
                'password' => Hash::make('password'),
                'role' => UserRole::OPERATOR,
                'is_active' => true,
                'is_first_login' => false,
                'email_verified_at' => now(),
            ]);
        }

        // Create Reporter users
        $reporters = [
            ['name' => 'Alice Reporter', 'email' => 'alice.reporter@iols.local'],
            ['name' => 'Bob Reporter', 'email' => 'bob.reporter@iols.local'],
            ['name' => 'Carol User', 'email' => 'carol.user@iols.local'],
            ['name' => 'David Staff', 'email' => 'david.staff@iols.local'],
            ['name' => 'Eve Employee', 'email' => 'eve.employee@iols.local'],
        ];

        foreach ($reporters as $reporter) {
            User::create([
                'name' => $reporter['name'],
                'email' => $reporter['email'],
                'password' => Hash::make('password'),
                'role' => UserRole::REPORTER,
                'is_active' => true,
                'is_first_login' => false,
                'email_verified_at' => now(),
            ]);
        }

        // Create one inactive user for testing
        User::create([
            'name' => 'Inactive User',
            'email' => 'inactive@iols.local',
            'password' => Hash::make('password'),
            'role' => UserRole::REPORTER,
            'is_active' => false,
            'is_first_login' => true,
        ]);

        $this->command->info('Created 10 test users (1 admin, 3 operators, 5 reporters, 1 inactive)');
    }
}
