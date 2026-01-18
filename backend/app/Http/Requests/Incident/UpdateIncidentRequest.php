<?php

namespace App\Http\Requests\Incident;

use App\Enums\IncidentPriority;
use App\Enums\IncidentSeverity;
use App\Models\Incident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Operators and admins can update incidents
        return $this->user()->canManageIncidents();
    }

    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'severity' => ['sometimes', 'string', Rule::in(IncidentSeverity::values())],
            'priority' => ['sometimes', 'string', Rule::in(IncidentPriority::values())],
            'category' => ['sometimes', 'string', Rule::in(array_keys(Incident::getCategories()))],
            'impact_description' => ['nullable', 'string'],
            'affected_systems' => ['nullable', 'array'],
            'affected_systems.*' => ['string'],
            'due_date' => ['nullable', 'date'],
            'resolution_notes' => ['nullable', 'string'],
        ];
    }
}
