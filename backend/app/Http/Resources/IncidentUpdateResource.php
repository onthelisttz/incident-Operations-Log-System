<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class IncidentUpdateResource extends JsonResource
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
            'action_type' => [
                'value' => $this->action_type->value,
                'label' => $this->action_type->label(),
                'icon' => $this->action_type->icon(),
            ],
            'previous_value' => $this->previous_value,
            'new_value' => $this->new_value,
            'comment' => $this->comment,
            'is_internal' => $this->is_internal,
            'description' => $this->description,
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'role' => $this->user->role->value,
                ];
            }),
            'created_at' => $this->created_at->toIso8601String(),
        ];
    }
}
