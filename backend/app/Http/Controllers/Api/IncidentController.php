<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Incident\AddCommentRequest;
use App\Http\Requests\Incident\AssignIncidentRequest;
use App\Http\Requests\Incident\StoreIncidentRequest;
use App\Http\Requests\Incident\UpdateIncidentRequest;
use App\Http\Requests\Incident\UpdateStatusRequest;
use App\Http\Resources\IncidentResource;
use App\Http\Resources\IncidentUpdateResource;
use App\Http\Resources\PaginatedResource;
use App\Services\ExportService;
use App\Services\IncidentService;
use App\Services\IncidentStatusService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @group Incident Management
 *
 * APIs for managing incidents
 */
class IncidentController extends Controller
{
    public function __construct(
        protected IncidentService $incidentService,
        protected IncidentStatusService $statusService,
        protected ExportService $exportService
    ) {}

    /**
     * List Incidents
     *
     * Get a paginated list of incidents based on user role.
     *
     * @queryParam search string Search by title, description, or incident number.
     * @queryParam status string Filter by status (open, investigating, resolved, closed).
     * @queryParam severity string Filter by severity (low, medium, high, critical).
     * @queryParam priority string Filter by priority (low, normal, high, urgent).
     * @queryParam category string Filter by category.
     * @queryParam from_date string Filter by start date (Y-m-d).
     * @queryParam to_date string Filter by end date (Y-m-d).
     * @queryParam per_page integer Items per page. Example: 15
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only([
            'search', 'status', 'severity', 'priority', 'category',
            'from_date', 'to_date', 'assigned_to', 'reported_by',
            'sort_by', 'sort_order'
        ]);
        $perPage = $request->input('per_page', 15);

        $incidents = $this->incidentService->getPaginatedForUser(
            $request->user(),
            $filters,
            $perPage
        );

        return response()->json(
            PaginatedResource::format($incidents, IncidentResource::class)
        );
    }

    /**
     * Create Incident
     *
     * Create a new incident.
     *
     * @bodyParam title string required The incident title. Example: Network outage in Building A
     * @bodyParam description string required The incident description.
     * @bodyParam severity string The severity level. Example: high
     * @bodyParam priority string The priority level. Example: urgent
     * @bodyParam category string The category. Example: network
     * @bodyParam impact_description string Description of impact.
     * @bodyParam affected_systems array List of affected systems.
     * @bodyParam due_date string Due date (Y-m-d).
     */
    public function store(StoreIncidentRequest $request): JsonResponse
    {
        $incident = $this->incidentService->create(
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Incident created successfully.',
            'data' => new IncidentResource($incident),
        ], 201);
    }

    /**
     * Get Incident
     *
     * Get details of a specific incident.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     */
    public function show(Request $request, int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        // Check access
        if (!$incidentModel->canBeViewedBy($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this incident.',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new IncidentResource($incidentModel),
        ]);
    }

    /**
     * Update Incident
     *
     * Update an incident's details.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     */
    public function update(UpdateIncidentRequest $request, int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        $updatedIncident = $this->incidentService->update(
            $incidentModel,
            $request->validated(),
            $request->user()
        );

        return response()->json([
            'success' => true,
            'message' => 'Incident updated successfully.',
            'data' => new IncidentResource($updatedIncident),
        ]);
    }

    /**
     * Delete Incident
     *
     * Delete an incident (Admin only).
     *
     * @urlParam incident integer required The incident ID. Example: 1
     */
    public function destroy(Request $request, int $incident): JsonResponse
    {
        if (!$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Only administrators can delete incidents.',
            ], 403);
        }

        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        $this->incidentService->delete($incidentModel);

        return response()->json([
            'success' => true,
            'message' => 'Incident deleted successfully.',
        ]);
    }

    /**
     * Update Status
     *
     * Update an incident's status (following transition rules).
     *
     * @urlParam incident integer required The incident ID. Example: 1
     * @bodyParam status string required The new status. Example: investigating
     * @bodyParam notes string Resolution notes (required when resolving).
     */
    public function updateStatus(UpdateStatusRequest $request, int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        try {
            $updatedIncident = $this->statusService->updateStatus(
                $incidentModel,
                $request->status,
                $request->user(),
                $request->notes
            );

            return response()->json([
                'success' => true,
                'message' => 'Status updated successfully.',
                'data' => new IncidentResource($updatedIncident),
            ]);
        } catch (InvalidStatusTransitionException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Assign Incident
     *
     * Assign an incident to an operator (Admin only).
     *
     * @urlParam incident integer required The incident ID. Example: 1
     * @bodyParam operator_id integer The operator's user ID (null to unassign).
     */
    public function assign(AssignIncidentRequest $request, int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        $updatedIncident = $this->incidentService->assign(
            $incidentModel,
            $request->operator_id,
            $request->user()
        );

        $message = $request->operator_id
            ? 'Incident assigned successfully.'
            : 'Incident unassigned successfully.';

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => new IncidentResource($updatedIncident),
        ]);
    }

    /**
     * Get Incident Updates
     *
     * Get the activity log/updates for an incident.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     */
    public function updates(Request $request, int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        if (!$incidentModel->canBeViewedBy($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to view this incident.',
            ], 403);
        }

        $updates = $this->incidentService->getUpdates($incidentModel, $request->user());

        return response()->json([
            'success' => true,
            'data' => IncidentUpdateResource::collection($updates),
        ]);
    }

    /**
     * Add Comment
     *
     * Add a comment to an incident.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     * @bodyParam comment string required The comment text.
     * @bodyParam is_internal boolean Whether this is an internal note (operators/admins only).
     */
    public function addComment(AddCommentRequest $request, int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        if (!$incidentModel->canBeViewedBy($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to comment on this incident.',
            ], 403);
        }

        // Only operators/admins can add internal comments
        $isInternal = $request->is_internal ?? false;
        if ($isInternal && !$request->user()->canManageIncidents()) {
            $isInternal = false;
        }

        $this->incidentService->addComment(
            $incidentModel,
            $request->user(),
            $request->comment,
            $isInternal
        );

        return response()->json([
            'success' => true,
            'message' => 'Comment added successfully.',
        ]);
    }

    /**
     * Export Incidents
     *
     * Export incidents to CSV with optional filters.
     */
    public function export(Request $request)
    {
        $filters = $request->only([
            'search', 'status', 'severity', 'priority', 'category',
            'from_date', 'to_date', 'assigned_to', 'reported_by'
        ]);

        return $this->exportService->exportIncidents($filters, $request->user());
    }

    /**
     * Get Valid Transitions
     *
     * Get valid status transitions for an incident.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     */
    public function validTransitions(int $incident): JsonResponse
    {
        $incidentModel = $this->incidentService->find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'current_status' => $incidentModel->status->value,
                'valid_transitions' => $this->statusService->getValidTransitions($incidentModel),
            ],
        ]);
    }

    /**
     * Get Categories
     *
     * Get the list of available incident categories.
     */
    public function categories(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $this->incidentService->getCategories(),
        ]);
    }
}
