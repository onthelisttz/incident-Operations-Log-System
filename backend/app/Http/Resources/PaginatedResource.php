<?php

namespace App\Http\Resources;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class PaginatedResource
{
    /**
     * Format a paginated response with consistent structure.
     */
    public static function format(LengthAwarePaginator $paginator, string $resourceClass): array
    {
        return [
            'success' => true,
            'data' => $resourceClass::collection($paginator->items()),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
                'total_pages' => $paginator->lastPage(),
                'from' => $paginator->firstItem(),
                'to' => $paginator->lastItem(),
                'has_next_page' => $paginator->hasMorePages(),
                'has_previous_page' => $paginator->currentPage() > 1,
            ],
            'links' => [
                'first' => $paginator->url(1),
                'last' => $paginator->url($paginator->lastPage()),
                'prev' => $paginator->previousPageUrl(),
                'next' => $paginator->nextPageUrl(),
            ],
        ];
    }

    /**
     * Format a simple collection response.
     */
    public static function collection($items, string $resourceClass): array
    {
        return [
            'success' => true,
            'data' => $resourceClass::collection($items),
        ];
    }

    /**
     * Format a single resource response.
     */
    public static function single($item, string $resourceClass): array
    {
        return [
            'success' => true,
            'data' => new $resourceClass($item),
        ];
    }

    /**
     * Format a success response with custom data.
     */
    public static function success(mixed $data = null, ?string $message = null): array
    {
        $response = ['success' => true];

        if ($message) {
            $response['message'] = $message;
        }

        if ($data !== null) {
            $response['data'] = $data;
        }

        return $response;
    }

    /**
     * Format an error response.
     */
    public static function error(string $message, int $code = 400, array $errors = []): array
    {
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (!empty($errors)) {
            $response['errors'] = $errors;
        }

        return $response;
    }
}
