<?php

namespace Database\Seeders;

use App\Enums\ActionType;
use App\Models\Incident;
use App\Models\IncidentUpdate;
use App\Models\User;
use Illuminate\Database\Seeder;

class IncidentUpdatesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $incidents = Incident::all();
        $admin = User::where('role', 'admin')->first();
        $operators = User::where('role', 'operator')->get();

        if ($incidents->isEmpty() || $operators->isEmpty()) {
            $this->command->warn('Please run UsersSeeder and IncidentsSeeder first!');
            return;
        }

        $updatesCreated = 0;

        foreach ($incidents as $incident) {
            $operator = $operators->random();

            // Add initial comment when incident was created
            IncidentUpdate::create([
                'incident_id' => $incident->id,
                'user_id' => $incident->reported_by,
                'action_type' => ActionType::COMMENT,
                'comment' => 'Incident reported and logged into the system.',
                'is_internal' => false,
                'created_at' => $incident->created_at,
            ]);
            $updatesCreated++;

            // For investigating incidents, add status change and comments
            if (in_array($incident->status->value, ['investigating', 'resolved', 'closed'])) {
                // Assignment
                if ($incident->assigned_to) {
                    $assignedUser = User::find($incident->assigned_to);
                    IncidentUpdate::create([
                        'incident_id' => $incident->id,
                        'user_id' => $admin->id,
                        'action_type' => ActionType::ASSIGNMENT,
                        'previous_value' => null,
                        'new_value' => $assignedUser->name,
                        'comment' => 'Assigned to operator for investigation.',
                        'is_internal' => false,
                        'created_at' => $incident->created_at->addMinutes(30),
                    ]);
                    $updatesCreated++;
                }

                // Status change to investigating
                IncidentUpdate::create([
                    'incident_id' => $incident->id,
                    'user_id' => $operator->id,
                    'action_type' => ActionType::STATUS_CHANGE,
                    'previous_value' => 'open',
                    'new_value' => 'investigating',
                    'comment' => 'Started investigation. Will update with findings.',
                    'is_internal' => false,
                    'created_at' => $incident->created_at->addHours(1),
                ]);
                $updatesCreated++;

                // Internal note
                IncidentUpdate::create([
                    'incident_id' => $incident->id,
                    'user_id' => $operator->id,
                    'action_type' => ActionType::COMMENT,
                    'comment' => 'Initial diagnosis complete. Root cause likely identified.',
                    'is_internal' => true,
                    'created_at' => $incident->created_at->addHours(2),
                ]);
                $updatesCreated++;
            }

            // For resolved incidents, add resolution
            if (in_array($incident->status->value, ['resolved', 'closed'])) {
                IncidentUpdate::create([
                    'incident_id' => $incident->id,
                    'user_id' => $operator->id,
                    'action_type' => ActionType::STATUS_CHANGE,
                    'previous_value' => 'investigating',
                    'new_value' => 'resolved',
                    'comment' => 'Issue has been resolved. Please verify and confirm.',
                    'is_internal' => false,
                    'created_at' => $incident->resolved_at ?? $incident->created_at->addHours(4),
                ]);
                $updatesCreated++;
            }

            // For closed incidents, add closure
            if ($incident->status->value === 'closed') {
                IncidentUpdate::create([
                    'incident_id' => $incident->id,
                    'user_id' => $admin->id,
                    'action_type' => ActionType::STATUS_CHANGE,
                    'previous_value' => 'resolved',
                    'new_value' => 'closed',
                    'comment' => 'Resolution verified. Closing incident.',
                    'is_internal' => false,
                    'created_at' => $incident->closed_at ?? $incident->created_at->addHours(6),
                ]);
                $updatesCreated++;
            }
        }

        $this->command->info("Created {$updatesCreated} incident updates/comments");
    }
}
