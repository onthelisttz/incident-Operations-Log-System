<?php

namespace Database\Factories;

use App\Enums\IncidentPriority;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Incident>
 */
class IncidentFactory extends Factory
{
    protected $model = Incident::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // 'incident_number' => Incident::generateIncidentNumber(), // Handled by model boot
            'title' => fake()->sentence(6),
            'description' => fake()->paragraphs(2, true),
            'severity' => fake()->randomElement(IncidentSeverity::values()),
            'status' => IncidentStatus::OPEN,
            'priority' => fake()->randomElement(IncidentPriority::values()),
            'category' => fake()->randomElement(array_keys(Incident::getCategories())),
            'reported_by' => User::factory(),
            'assigned_to' => null,
            'due_date' => fake()->optional()->dateTimeBetween('now', '+30 days'),
            'impact_description' => fake()->optional()->paragraph(),
            'affected_systems' => fake()->optional()->randomElements(['Web Server', 'Database', 'Network', 'Email'], 2),
        ];
    }

    /**
     * Indicate the incident is investigating.
     */
    public function investigating(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IncidentStatus::INVESTIGATING,
            'assigned_to' => User::factory()->operator(),
        ]);
    }

    /**
     * Indicate the incident is resolved.
     */
    public function resolved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IncidentStatus::RESOLVED,
            'assigned_to' => User::factory()->operator(),
            'resolved_at' => now(),
            'resolution_notes' => fake()->paragraph(),
        ]);
    }

    /**
     * Indicate the incident is closed.
     */
    public function closed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => IncidentStatus::CLOSED,
            'assigned_to' => User::factory()->operator(),
            'resolved_at' => now()->subDay(),
            'closed_at' => now(),
            'resolution_notes' => fake()->paragraph(),
        ]);
    }

    /**
     * Indicate the incident is critical.
     */
    public function critical(): static
    {
        return $this->state(fn (array $attributes) => [
            'severity' => IncidentSeverity::CRITICAL,
            'priority' => IncidentPriority::URGENT,
        ]);
    }
}
