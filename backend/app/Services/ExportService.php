<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\User;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ExportService
{
    /**
     * Export incidents to CSV.
     */
    public function exportIncidents(array $filters = [], ?User $user = null): StreamedResponse
    {
        return response()->streamDownload(function () use ($filters, $user) {
            $handle = fopen('php://output', 'w');

            // Write headers
            fputcsv($handle, [
                'Incident Number',
                'Title',
                'Description',
                'Severity',
                'Status',
                'Priority',
                'Category',
                'Reporter',
                'Assigned To',
                'Impact Description',
                'Resolution Notes',
                'Created At',
                'Resolved At',
                'Closed At',
            ]);

            // Build query
            $query = Incident::query()
                ->with(['reporter:id,name,email', 'assignedTo:id,name,email']);

            // Apply user-based filtering
            if ($user) {
                if ($user->role === UserRole::REPORTER) {
                    $query->where('reported_by', $user->id);
                } elseif ($user->role === UserRole::OPERATOR) {
                    $query->where(function ($q) use ($user) {
                        $q->where('assigned_to', $user->id)
                          ->orWhere('reported_by', $user->id);
                    });
                }
            }

            // Apply filters
            $this->applyIncidentFilters($query, $filters);

            // Stream data in chunks
            $query->orderBy('created_at', 'desc')
                ->chunk(1000, function ($incidents) use ($handle) {
                    foreach ($incidents as $incident) {
                        fputcsv($handle, [
                            $incident->incident_number,
                            $incident->title,
                            $incident->description,
                            $incident->severity->value,
                            $incident->status->value,
                            $incident->priority->value,
                            $incident->category,
                            $incident->reporter->name ?? '',
                            $incident->assignedTo->name ?? 'Unassigned',
                            $incident->impact_description ?? '',
                            $incident->resolution_notes ?? '',
                            $incident->created_at->format('Y-m-d H:i:s'),
                            $incident->resolved_at?->format('Y-m-d H:i:s') ?? '',
                            $incident->closed_at?->format('Y-m-d H:i:s') ?? '',
                        ]);
                    }
                });

            fclose($handle);
        }, 'incidents-' . now()->format('Y-m-d-His') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Export users to CSV.
     */
    public function exportUsers(array $filters = []): StreamedResponse
    {
        return response()->streamDownload(function () use ($filters) {
            $handle = fopen('php://output', 'w');

            // Write headers
            fputcsv($handle, [
                'ID',
                'Name',
                'Email',
                'Role',
                'Phone',
                'Status',
                'Last Login',
                'Created At',
            ]);

            // Build query
            $query = User::query();

            // Apply filters
            $this->applyUserFilters($query, $filters);

            // Stream data in chunks
            $query->orderBy('created_at', 'desc')
                ->chunk(1000, function ($users) use ($handle) {
                    foreach ($users as $user) {
                        fputcsv($handle, [
                            $user->id,
                            $user->name,
                            $user->email,
                            $user->role->value,
                            $user->phone ?? '',
                            $user->is_active ? 'Active' : 'Inactive',
                            $user->last_login_at?->format('Y-m-d H:i:s') ?? 'Never',
                            $user->created_at->format('Y-m-d H:i:s'),
                        ]);
                    }
                });

            fclose($handle);
        }, 'users-' . now()->format('Y-m-d-His') . '.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    /**
     * Apply incident filters to query.
     */
    protected function applyIncidentFilters($query, array $filters): void
    {
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['severity'])) {
            $query->where('severity', $filters['severity']);
        }

        if (!empty($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (!empty($filters['category'])) {
            $query->where('category', $filters['category']);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%")
                  ->orWhere('incident_number', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['from_date'])) {
            $query->whereDate('created_at', '>=', $filters['from_date']);
        }

        if (!empty($filters['to_date'])) {
            $query->whereDate('created_at', '<=', $filters['to_date']);
        }

        if (!empty($filters['assigned_to'])) {
            $query->where('assigned_to', $filters['assigned_to']);
        }

        if (!empty($filters['reported_by'])) {
            $query->where('reported_by', $filters['reported_by']);
        }
    }

    /**
     * Apply user filters to query.
     */
    protected function applyUserFilters($query, array $filters): void
    {
        if (!empty($filters['role'])) {
            $query->where('role', $filters['role']);
        }

        if (isset($filters['status'])) {
            $isActive = $filters['status'] === 'active';
            $query->where('is_active', $isActive);
        }

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }
    }
}
