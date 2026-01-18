<?php

namespace Database\Seeders;

use App\Enums\IncidentPriority;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Database\Seeder;

class IncidentsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get users for assigning incidents
        $admin = User::where('email', 'admin@iols.local')->first();
        $operators = User::where('role', 'operator')->get();
        $reporters = User::where('role', 'reporter')->get();

        if ($reporters->isEmpty() || $operators->isEmpty()) {
            $this->command->warn('Please run UsersSeeder first!');
            return;
        }

        $incidents = [
            // Open incidents
            [
                'title' => 'Network connectivity issues in Building A',
                'description' => 'Multiple users in Building A are experiencing intermittent network connectivity issues. The problem started this morning and affects approximately 50 users.',
                'severity' => IncidentSeverity::HIGH,
                'status' => IncidentStatus::OPEN,
                'priority' => IncidentPriority::HIGH,
                'category' => 'network',
                'impact_description' => 'Productivity loss for 50+ users',
                'affected_systems' => ['LAN', 'WiFi', 'VoIP'],
            ],
            [
                'title' => 'Email server slowdown',
                'description' => 'Email sending and receiving is experiencing significant delays. Users report emails taking 10-15 minutes to arrive.',
                'severity' => IncidentSeverity::MEDIUM,
                'status' => IncidentStatus::OPEN,
                'priority' => IncidentPriority::NORMAL,
                'category' => 'software',
                'impact_description' => 'Communication delays across organization',
                'affected_systems' => ['Exchange Server', 'SMTP Gateway'],
            ],
            [
                'title' => 'Printer not working on Floor 3',
                'description' => 'The main printer on Floor 3 is not responding. Shows as offline in print queue.',
                'severity' => IncidentSeverity::LOW,
                'status' => IncidentStatus::OPEN,
                'priority' => IncidentPriority::LOW,
                'category' => 'hardware',
                'impact_description' => 'Users on Floor 3 cannot print documents',
                'affected_systems' => ['HP LaserJet Pro'],
            ],

            // Investigating incidents
            [
                'title' => 'Database performance degradation',
                'description' => 'The main production database is showing slow query performance. Some queries taking 10x longer than usual.',
                'severity' => IncidentSeverity::CRITICAL,
                'status' => IncidentStatus::INVESTIGATING,
                'priority' => IncidentPriority::URGENT,
                'category' => 'database',
                'impact_description' => 'All applications using main database affected',
                'affected_systems' => ['MySQL Cluster', 'ERP System', 'CRM'],
            ],
            [
                'title' => 'Security alert - Unusual login attempts',
                'description' => 'Multiple failed login attempts detected from unknown IP addresses targeting admin accounts.',
                'severity' => IncidentSeverity::HIGH,
                'status' => IncidentStatus::INVESTIGATING,
                'priority' => IncidentPriority::HIGH,
                'category' => 'security',
                'impact_description' => 'Potential security breach attempt',
                'affected_systems' => ['Active Directory', 'VPN Gateway'],
            ],

            // Resolved incidents
            [
                'title' => 'Application crash on startup',
                'description' => 'The inventory management application was crashing immediately on startup for all users.',
                'severity' => IncidentSeverity::HIGH,
                'status' => IncidentStatus::RESOLVED,
                'priority' => IncidentPriority::HIGH,
                'category' => 'application',
                'impact_description' => 'Warehouse operations halted',
                'affected_systems' => ['Inventory Management System'],
                'resolution_notes' => 'Identified corrupted configuration file. Restored from backup and application is now functioning normally.',
                'resolved_at' => now()->subHours(2),
            ],

            // Closed incidents
            [
                'title' => 'VPN connection failures',
                'description' => 'Remote workers were unable to establish VPN connections. Issue affected all remote access.',
                'severity' => IncidentSeverity::CRITICAL,
                'status' => IncidentStatus::CLOSED,
                'priority' => IncidentPriority::URGENT,
                'category' => 'network',
                'impact_description' => 'All remote workers unable to access company resources',
                'affected_systems' => ['Cisco AnyConnect', 'Firewall'],
                'resolution_notes' => 'VPN certificate had expired. Renewed certificate and all connections restored.',
                'resolved_at' => now()->subDays(1),
                'closed_at' => now()->subHours(12),
            ],
            [
                'title' => 'Scheduled maintenance - Server patching',
                'description' => 'Monthly security patches were applied to all production servers during the maintenance window.',
                'severity' => IncidentSeverity::LOW,
                'status' => IncidentStatus::CLOSED,
                'priority' => IncidentPriority::NORMAL,
                'category' => 'infrastructure',
                'impact_description' => 'Planned maintenance - minimal impact during off-hours',
                'affected_systems' => ['All Production Servers'],
                'resolution_notes' => 'All patches applied successfully. No issues detected.',
                'resolved_at' => now()->subDays(3),
                'closed_at' => now()->subDays(2),
            ],
        ];

        foreach ($incidents as $index => $data) {
            // Assign reporter
            $reporter = $reporters[$index % $reporters->count()];
            
            // Assign operator to non-open incidents
            $assignedTo = null;
            if ($data['status'] !== IncidentStatus::OPEN) {
                $assignedTo = $operators[$index % $operators->count()]->id;
            }

            Incident::create([
                'incident_number' => Incident::generateIncidentNumber(),
                'title' => $data['title'],
                'description' => $data['description'],
                'severity' => $data['severity'],
                'status' => $data['status'],
                'priority' => $data['priority'],
                'category' => $data['category'],
                'reported_by' => $reporter->id,
                'assigned_to' => $assignedTo,
                'impact_description' => $data['impact_description'] ?? null,
                'affected_systems' => $data['affected_systems'] ?? null,
                'resolution_notes' => $data['resolution_notes'] ?? null,
                'resolved_at' => $data['resolved_at'] ?? null,
                'closed_at' => $data['closed_at'] ?? null,
            ]);

            // Small delay to ensure unique incident numbers
            usleep(1000);
        }

        $this->command->info('Created ' . count($incidents) . ' sample incidents');
    }
}
