<?php

namespace App\Models;

use App\Enums\IncidentPriority;
use App\Enums\IncidentSeverity;
use App\Enums\IncidentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Incident extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'incident_number',
        'title',
        'description',
        'severity',
        'status',
        'priority',
        'category',
        'reported_by',
        'assigned_to',
        'due_date',
        'resolved_at',
        'closed_at',
        'resolution_notes',
        'impact_description',
        'affected_systems',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'due_date' => 'date',
            'resolved_at' => 'datetime',
            'closed_at' => 'datetime',
            'affected_systems' => 'array',
            'severity' => IncidentSeverity::class,
            'status' => IncidentStatus::class,
            'priority' => IncidentPriority::class,
        ];
    }

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::creating(function (Incident $incident) {
            if (empty($incident->incident_number)) {
                $incident->incident_number = static::generateIncidentNumber();
            }
        });
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the user who reported this incident.
     */
    public function reporter(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reported_by');
    }

    /**
     * Get the operator assigned to this incident.
     */
    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the updates/activity log for this incident.
     */
    public function updates(): HasMany
    {
        return $this->hasMany(IncidentUpdate::class)->orderBy('created_at', 'desc');
    }

    /**
     * Get the attachments for this incident.
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(IncidentAttachment::class);
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if incident is open.
     */
    public function isOpen(): bool
    {
        return $this->status === IncidentStatus::OPEN;
    }

    /**
     * Check if incident is closed.
     */
    public function isClosed(): bool
    {
        return $this->status === IncidentStatus::CLOSED;
    }

    /**
     * Check if incident is resolved or closed.
     */
    public function isResolved(): bool
    {
        return in_array($this->status, [IncidentStatus::RESOLVED, IncidentStatus::CLOSED]);
    }

    /**
     * Check if incident is critical.
     */
    public function isCritical(): bool
    {
        return $this->severity === IncidentSeverity::CRITICAL;
    }

    /**
     * Check if incident is urgent.
     */
    public function isUrgent(): bool
    {
        return $this->priority === IncidentPriority::URGENT;
    }

    /**
     * Check if a user can view this incident.
     */
    public function canBeViewedBy(User $user): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($user->isOperator() && $this->assigned_to === $user->id) {
            return true;
        }

        if ($this->reported_by === $user->id) {
            return true;
        }

        return false;
    }

    /**
     * Check if status can transition to target status.
     */
    public function canTransitionTo(IncidentStatus $targetStatus): bool
    {
        return $this->status->canTransitionTo($targetStatus);
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include incidents with a specific status.
     */
    public function scopeStatus($query, IncidentStatus|string $status)
    {
        $statusValue = $status instanceof IncidentStatus ? $status->value : $status;
        return $query->where('status', $statusValue);
    }

    /**
     * Scope a query to only include incidents with a specific severity.
     */
    public function scopeSeverity($query, IncidentSeverity|string $severity)
    {
        $severityValue = $severity instanceof IncidentSeverity ? $severity->value : $severity;
        return $query->where('severity', $severityValue);
    }

    /**
     * Scope a query to only include incidents with a specific priority.
     */
    public function scopePriority($query, IncidentPriority|string $priority)
    {
        $priorityValue = $priority instanceof IncidentPriority ? $priority->value : $priority;
        return $query->where('priority', $priorityValue);
    }

    /**
     * Scope a query to only include incidents in a specific category.
     */
    public function scopeCategory($query, string $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope a query to only include open incidents.
     */
    public function scopeOpen($query)
    {
        return $query->where('status', IncidentStatus::OPEN->value);
    }

    /**
     * Scope a query to only include unresolved incidents.
     */
    public function scopeUnresolved($query)
    {
        return $query->whereNotIn('status', [
            IncidentStatus::RESOLVED->value,
            IncidentStatus::CLOSED->value,
        ]);
    }

    /**
     * Scope a query to only include incidents assigned to a user.
     */
    public function scopeAssignedTo($query, int $userId)
    {
        return $query->where('assigned_to', $userId);
    }

    /**
     * Scope a query to only include incidents reported by a user.
     */
    public function scopeReportedBy($query, int $userId)
    {
        return $query->where('reported_by', $userId);
    }

    /**
     * Scope a query to search by title or description.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('title', 'like', "%{$search}%")
              ->orWhere('description', 'like', "%{$search}%")
              ->orWhere('incident_number', 'like', "%{$search}%");
        });
    }

    /**
     * Scope a query for incidents created within a date range.
     */
    public function scopeDateRange($query, ?string $from = null, ?string $to = null)
    {
        // If only "from" date is provided, filter by that specific date only (exact match)
        if (!empty($from) && empty($to)) {
            return $query->whereDate('created_at', $from);
        }

        if ($from) {
            $query->whereDate('created_at', '>=', $from);
        }
        if ($to) {
            $query->whereDate('created_at', '<=', $to);
        }
        return $query;
    }

    /**
     * Scope for incidents that are at risk of SLA breach.
     */
    public function scopeAtRisk($query, int $hoursWithoutUpdate = 24)
    {
        return $query->unresolved()
            ->where('updated_at', '<', now()->subHours($hoursWithoutUpdate));
    }

    // ==================== STATIC METHODS ====================

    /**
     * Generate a unique incident number.
     */
    public static function generateIncidentNumber(): string
    {
        $date = now()->format('Ymd');
        $prefix = "INC-{$date}-";
        
        $lastIncident = static::where('incident_number', 'like', "{$prefix}%")
            ->orderBy('incident_number', 'desc')
            ->first();

        if ($lastIncident) {
            $lastNumber = (int) substr($lastIncident->incident_number, -4);
            $newNumber = $lastNumber + 1;
        } else {
            $newNumber = 1;
        }

        return $prefix . str_pad($newNumber, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Get available categories.
     */
    public static function getCategories(): array
    {
        return [
            'network' => 'Network',
            'security' => 'Security',
            'hardware' => 'Hardware',
            'software' => 'Software',
            'database' => 'Database',
            'application' => 'Application',
            'infrastructure' => 'Infrastructure',
            'other' => 'Other',
        ];
    }
}
