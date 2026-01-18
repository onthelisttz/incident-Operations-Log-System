<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use App\Services\IncidentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Dashboard
 *
 * APIs for dashboard statistics and analytics
 */
class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $dashboardService,
        protected IncidentService $incidentService
    ) {}

    /**
     * Get Dashboard Stats
     *
     * Get summary statistics for the dashboard.
     */
    public function stats(Request $request): JsonResponse
    {
        $stats = $this->dashboardService->getStats($request->user());

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    /**
     * Get Recent Incidents
     *
     * Get the most recent incidents.
     *
     * @queryParam limit integer Number of incidents to return. Example: 10
     */
    public function recentIncidents(Request $request): JsonResponse
    {
        $limit = $request->input('limit', 10);
        $incidents = $this->incidentService->getRecent($limit, $request->user());

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\IncidentResource::collection($incidents),
        ]);
    }

    /**
     * Get My Assigned Incidents
     *
     * Get incidents assigned to the current user.
     *
     * @queryParam limit integer Number of incidents to return.
     */
    public function myAssigned(Request $request): JsonResponse
    {
        $limit = $request->input('limit');
        $incidents = $this->incidentService->getAssignedTo($request->user()->id, $limit);

        return response()->json([
            'success' => true,
            'data' => \App\Http\Resources\IncidentResource::collection($incidents),
        ]);
    }

    /**
     * Get Severity Breakdown
     *
     * Get incident counts by severity for charts.
     */
    public function severityBreakdown(): JsonResponse
    {
        $breakdown = $this->dashboardService->getSeverityBreakdown();

        return response()->json([
            'success' => true,
            'data' => $breakdown,
        ]);
    }

    /**
     * Get Status Distribution
     *
     * Get incident counts by status for charts.
     */
    public function statusDistribution(): JsonResponse
    {
        $distribution = $this->dashboardService->getStatusDistribution();

        return response()->json([
            'success' => true,
            'data' => $distribution,
        ]);
    }

    /**
     * Get Category Breakdown
     *
     * Get incident counts by category.
     */
    public function categoryBreakdown(): JsonResponse
    {
        $breakdown = $this->dashboardService->getCategoryBreakdown();

        return response()->json([
            'success' => true,
            'data' => $breakdown,
        ]);
    }

    /**
     * Get Trends
     *
     * Get incident creation trends over time.
     *
     * @queryParam days integer Number of days to look back. Example: 30
     */
    public function trends(Request $request): JsonResponse
    {
        $days = $request->input('days', 30);
        $trends = $this->dashboardService->getTrends($days);

        return response()->json([
            'success' => true,
            'data' => $trends,
        ]);
    }

    /**
     * Get MTTR
     *
     * Get Mean Time To Resolution statistics (Admin only).
     */
    public function mttr(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $mttr = $this->dashboardService->getMTTR();

        return response()->json([
            'success' => true,
            'data' => $mttr,
        ]);
    }

    /**
     * Get Operator Performance
     *
     * Get operator performance metrics (Admin only).
     */
    public function operatorPerformance(Request $request): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $performance = $this->dashboardService->getOperatorPerformance();

        return response()->json([
            'success' => true,
            'data' => $performance,
        ]);
    }

    /**
     * Get Escalation Alerts
     *
     * Get incidents at risk of SLA breach.
     *
     * @queryParam hours integer Hours threshold for at-risk. Example: 24
     */
    public function escalationAlerts(Request $request): JsonResponse
    {
        if (!$request->user()->canManageIncidents()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied.',
            ], 403);
        }

        $hours = $request->input('hours', 24);
        $alerts = $this->dashboardService->getEscalationAlerts($hours);

        return response()->json([
            'success' => true,
            'data' => $alerts,
        ]);
    }
}
