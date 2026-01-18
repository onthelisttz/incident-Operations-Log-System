<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'incident_number' => $this->incident_number,
            'title' => $this->title,
            'description' => $this->description,
            'severity' => [
                'value' => $this->severity->value,
                'label' => $this->severity->label(),
                'color' => $this->severity->color(),
            ],
            'status' => [
                'value' => $this->status->value,
                'label' => $this->status->label(),
                'color' => $this->status->color(),
            ],
            'priority' => [
                'value' => $this->priority->value,
                'label' => $this->priority->label(),
                'color' => $this->priority->color(),
            ],
            'category' => $this->category,
            'reporter' => $this->whenLoaded('reporter', function () {
                return [
                    'id' => $this->reporter->id,
                    'name' => $this->reporter->name,
                    'email' => $this->reporter->email,
                ];
            }),
            'assigned_to' => $this->whenLoaded('assignedTo', function () {
                if (!$this->assignedTo) {
                    return null;
                }
                return [
                    'id' => $this->assignedTo->id,
                    'name' => $this->assignedTo->name,
                    'email' => $this->assignedTo->email,
                ];
            }),
            'due_date' => $this->due_date?->format('Y-m-d'),
            'impact_description' => $this->impact_description,
            'affected_systems' => $this->affected_systems,
            'resolution_notes' => $this->resolution_notes,
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'closed_at' => $this->closed_at?->toIso8601String(),
            'created_at' => $this->created_at->toIso8601String(),
            'updated_at' => $this->updated_at->toIso8601String(),
            'attachments_count' => $this->whenCounted('attachments'),
            'updates_count' => $this->whenCounted('updates'),
        ];
    }
}
