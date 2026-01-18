<?php

namespace App\Services;

use App\Enums\IncidentStatus;
use App\Enums\UserRole;
use App\Models\Incident;
use App\Models\User;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use App\Repositories\Interfaces\IncidentUpdateRepositoryInterface;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    public function __construct(
        protected IncidentRepositoryInterface $incidentRepository,
        protected IncidentUpdateRepositoryInterface $updateRepository,
        protected UserRepositoryInterface $userRepository
    ) {}

    /**
     * Get dashboard statistics based on user role.
     */
    public function getStats(User $user): array
    {
        $stats = [
            'total_incidents' => 0,
            'open_incidents' => 0,
            'investigating_incidents' => 0,
            'resolved_incidents' => 0,
            'closed_incidents' => 0,
            'critical_incidents' => 0,
            'my_assigned' => 0,
        ];

        $statusCounts = $this->incidentRepository->getCountByStatus();
        
        $stats['open_incidents'] = $statusCounts['open'] ?? 0;
        $stats['investigating_incidents'] = $statusCounts['investigating'] ?? 0;
        $stats['resolved_incidents'] = $statusCounts['resolved'] ?? 0;
        $stats['closed_incidents'] = $statusCounts['closed'] ?? 0;
        $stats['total_incidents'] = array_sum($statusCounts);

        // Critical incidents count
        $severityCounts = $this->incidentRepository->getCountBySeverity();
        $stats['critical_incidents'] = $severityCounts['critical'] ?? 0;

        // User-specific stats
        if ($user->isOperator()) {
            $stats['my_assigned'] = $this->incidentRepository->getAssignedTo($user->id)->count();
        } elseif ($user->isReporter()) {
            $stats['my_reported'] = Incident::where('reported_by', $user->id)->count();
        }

        // Admin-only stats
        if ($user->isAdmin()) {
            $stats['total_users'] = $this->userRepository->getActiveCount();
            $stats['at_risk_count'] = $this->incidentRepository->getAtRisk()->count();
        }

        return $stats;
    }

    /**
     * Get severity distribution for pie chart.
     */
    public function getSeverityBreakdown(): array
    {
        $counts = $this->incidentRepository->getCountBySeverity();
        
        return [
            ['name' => 'Low', 'value' => $counts['low'] ?? 0, 'color' => '#22c55e'],
            ['name' => 'Medium', 'value' => $counts['medium'] ?? 0, 'color' => '#eab308'],
            ['name' => 'High', 'value' => $counts['high'] ?? 0, 'color' => '#f97316'],
            ['name' => 'Critical', 'value' => $counts['critical'] ?? 0, 'color' => '#ef4444'],
        ];
    }

    /**
     * Get status distribution for charts.
     */
    public function getStatusDistribution(): array
    {
        $counts = $this->incidentRepository->getCountByStatus();
        
        return [
            ['name' => 'Open', 'value' => $counts['open'] ?? 0, 'color' => '#ef4444'],
            ['name' => 'Investigating', 'value' => $counts['investigating'] ?? 0, 'color' => '#eab308'],
            ['name' => 'Resolved', 'value' => $counts['resolved'] ?? 0, 'color' => '#3b82f6'],
            ['name' => 'Closed', 'value' => $counts['closed'] ?? 0, 'color' => '#22c55e'],
        ];
    }

    /**
     * Get category breakdown.
     */
    public function getCategoryBreakdown(): array
    {
        $counts = $this->incidentRepository->getCountByCategory();
        $categories = Incident::getCategories();

        $result = [];
        foreach ($counts as $category => $count) {
            $result[] = [
                'name' => $categories[$category] ?? ucfirst($category),
                'value' => $count,
            ];
        }

        return $result;
    }

    /**
     * Get incident trends (daily counts for last N days).
     */
    public function getTrends(int $days = 30): array
    {
        $trends = Incident::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('COUNT(*) as count')
        )
        ->where('created_at', '>=', now()->subDays($days))
        ->groupBy(DB::raw('DATE(created_at)'))
        ->orderBy('date')
        ->get()
        ->pluck('count', 'date')
        ->toArray();

        // Fill in missing dates with 0
        $result = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $result[] = [
                'date' => $date,
                'count' => $trends[$date] ?? 0,
            ];
        }

        return $result;
    }

    /**
     * Get Mean Time To Resolution (MTTR) in hours.
     */
    public function getMTTR(): array
    {
        // Calculate MTTR for resolved/closed incidents
        $incidents = Incident::whereNotNull('resolved_at')
            ->select('created_at', 'resolved_at', 'severity')
            ->get();

        if ($incidents->isEmpty()) {
            return [
                'overall' => 0,
                'by_severity' => [
                    'low' => 0,
                    'medium' => 0,
                    'high' => 0,
                    'critical' => 0,
                ],
            ];
        }

        // Calculate overall MTTR
        $totalHours = 0;
        $bySeverity = [
            'low' => ['total' => 0, 'count' => 0],
            'medium' => ['total' => 0, 'count' => 0],
            'high' => ['total' => 0, 'count' => 0],
            'critical' => ['total' => 0, 'count' => 0],
        ];

        foreach ($incidents as $incident) {
            $hours = $incident->created_at->diffInHours($incident->resolved_at);
            $totalHours += $hours;
            
            $severity = $incident->severity->value;
            $bySeverity[$severity]['total'] += $hours;
            $bySeverity[$severity]['count']++;
        }

        $averageMTTR = round($totalHours / $incidents->count(), 1);

        $mttrBySeverity = [];
        foreach ($bySeverity as $severity => $data) {
            $mttrBySeverity[$severity] = $data['count'] > 0 
                ? round($data['total'] / $data['count'], 1) 
                : 0;
        }

        return [
            'overall' => $averageMTTR,
            'by_severity' => $mttrBySeverity,
            'total_resolved' => $incidents->count(),
        ];
    }

    /**
     * Get operator performance metrics.
     */
    public function getOperatorPerformance(): array
    {
        $operators = User::where('role', UserRole::OPERATOR->value)
            ->orWhere('role', UserRole::ADMIN->value)
            ->get();

        $performance = [];

        foreach ($operators as $operator) {
            $assigned = Incident::where('assigned_to', $operator->id)->count();
            $resolved = Incident::where('assigned_to', $operator->id)
                ->whereIn('status', [IncidentStatus::RESOLVED->value, IncidentStatus::CLOSED->value])
                ->count();
            
            // Calculate average resolution time
            $resolvedIncidents = Incident::where('assigned_to', $operator->id)
                ->whereNotNull('resolved_at')
                ->get(['created_at', 'resolved_at']);
            
            $avgResolutionTime = 0;
            if ($resolvedIncidents->isNotEmpty()) {
                $totalHours = 0;
                foreach ($resolvedIncidents as $incident) {
                    $totalHours += $incident->created_at->diffInHours($incident->resolved_at);
                }
                $avgResolutionTime = round($totalHours / $resolvedIncidents->count(), 1);
            }

            $performance[] = [
                'id' => $operator->id,
                'name' => $operator->name,
                'email' => $operator->email,
                'assigned' => $assigned,
                'resolved' => $resolved,
                'resolution_rate' => $assigned > 0 ? round(($resolved / $assigned) * 100, 1) : 0,
                'avg_resolution_time_hours' => $avgResolutionTime,
            ];
        }

        // Sort by resolution rate descending
        usort($performance, fn($a, $b) => $b['resolution_rate'] <=> $a['resolution_rate']);

        return $performance;
    }

    /**
     * Get escalation alerts (at-risk incidents).
     */
    public function getEscalationAlerts(int $hoursThreshold = 24): array
    {
        $atRisk = $this->incidentRepository->getAtRisk($hoursThreshold);

        return $atRisk->map(function ($incident) use ($hoursThreshold) {
            $hoursSinceUpdate = $incident->updated_at->diffInHours(now());
            
            return [
                'id' => $incident->id,
                'incident_number' => $incident->incident_number,
                'title' => $incident->title,
                'severity' => $incident->severity->value,
                'status' => $incident->status->value,
                'assigned_to' => $incident->assignedTo?->name ?? 'Unassigned',
                'hours_since_update' => $hoursSinceUpdate,
                'risk_level' => $this->calculateRiskLevel($incident, $hoursSinceUpdate),
            ];
        })->toArray();
    }

    /**
     * Calculate risk level based on severity and time.
     */
    protected function calculateRiskLevel(Incident $incident, int $hoursSinceUpdate): string
    {
        $severityWeight = $incident->severity->weight();
        
        if ($hoursSinceUpdate > 48 || ($severityWeight >= 4 && $hoursSinceUpdate > 8)) {
            return 'critical';
        }
        
        if ($hoursSinceUpdate > 24 || ($severityWeight >= 3 && $hoursSinceUpdate > 12)) {
            return 'high';
        }
        
        return 'medium';
    }
}
