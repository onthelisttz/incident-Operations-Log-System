<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AttachmentResource;
use App\Models\Incident;
use App\Models\IncidentAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

/**
 * @group Attachments
 *
 * APIs for managing incident attachments
 */
class AttachmentController extends Controller
{
    /**
     * List Attachments
     *
     * Get all attachments for an incident.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     */
    public function index(Request $request, int $incident): JsonResponse
    {
        $incidentModel = Incident::find($incident);

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

        $attachments = $incidentModel->attachments()->with('uploader')->get();

        return response()->json([
            'success' => true,
            'data' => AttachmentResource::collection($attachments),
        ]);
    }

    /**
     * Upload Attachment
     *
     * Upload an attachment to an incident.
     *
     * @urlParam incident integer required The incident ID. Example: 1
     * @bodyParam file file required The file to upload.
     */
    public function store(Request $request, int $incident): JsonResponse
    {
        $request->validate([
            'file' => ['required', 'file', 'max:10240'], // 10MB max
        ]);

        $incidentModel = Incident::find($incident);

        if (!$incidentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Incident not found.',
            ], 404);
        }

        if (!$incidentModel->canBeViewedBy($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to upload to this incident.',
            ], 403);
        }

        $file = $request->file('file');
        $path = $file->store("incidents/{$incident}", 'public');

        $attachment = IncidentAttachment::create([
            'incident_id' => $incident,
            'uploaded_by' => $request->user()->id,
            'file_name' => $file->getClientOriginalName(),
            'file_path' => $path,
            'file_type' => $file->getMimeType(),
            'file_size' => $file->getSize(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Attachment uploaded successfully.',
            'data' => new AttachmentResource($attachment->load('uploader')),
        ], 201);
    }

    /**
     * Delete Attachment
     *
     * Delete an attachment.
     *
     * @urlParam attachment integer required The attachment ID. Example: 1
     */
    public function destroy(Request $request, int $attachment): JsonResponse
    {
        $attachmentModel = IncidentAttachment::find($attachment);

        if (!$attachmentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Attachment not found.',
            ], 404);
        }

        // Check permission: uploader or admin can delete
        if ($attachmentModel->uploaded_by !== $request->user()->id && !$request->user()->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to delete this attachment.',
            ], 403);
        }

        $attachmentModel->delete();

        return response()->json([
            'success' => true,
            'message' => 'Attachment deleted successfully.',
        ]);
    }

    /**
     * Download Attachment
     *
     * Download an attachment file.
     *
     * @urlParam attachment integer required The attachment ID. Example: 1
     */
    public function download(Request $request, int $attachment)
    {
        $attachmentModel = IncidentAttachment::with('incident')->find($attachment);

        if (!$attachmentModel) {
            return response()->json([
                'success' => false,
                'message' => 'Attachment not found.',
            ], 404);
        }

        if (!$attachmentModel->incident->canBeViewedBy($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have permission to download this attachment.',
            ], 403);
        }

        return Storage::disk('public')->download(
            $attachmentModel->file_path,
            $attachmentModel->file_name
        );
    }
}
