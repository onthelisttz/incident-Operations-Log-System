<?php

namespace App\Http\Requests\Incident;

use App\Enums\IncidentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->canManageIncidents();
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(IncidentStatus::values())],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'status.in' => 'Invalid status. Must be one of: ' . implode(', ', IncidentStatus::values()),
        ];
    }
}
