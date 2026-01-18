<?php

namespace App\Models;

use App\Enums\ActionType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IncidentUpdate extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'incident_id',
        'user_id',
        'action_type',
        'previous_value',
        'new_value',
        'comment',
        'is_internal',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_internal' => 'boolean',
            'action_type' => ActionType::class,
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get the incident this update belongs to.
     */
    public function incident(): BelongsTo
    {
        return $this->belongsTo(Incident::class);
    }

    /**
     * Get the user who made this update.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // ==================== ACCESSORS ====================

    /**
     * Get a human-readable description of the update.
     */
    public function getDescriptionAttribute(): string
    {
        $userName = $this->user->name ?? 'Someone';

        return match($this->action_type) {
            ActionType::STATUS_CHANGE => "{$userName} changed status from {$this->previous_value} to {$this->new_value}",
            ActionType::COMMENT => "{$userName} added a comment",
            ActionType::ASSIGNMENT => $this->new_value 
                ? "{$userName} assigned to {$this->new_value}"
                : "{$userName} removed assignment",
            ActionType::PRIORITY_CHANGE => "{$userName} changed priority from {$this->previous_value} to {$this->new_value}",
            ActionType::SEVERITY_CHANGE => "{$userName} changed severity from {$this->previous_value} to {$this->new_value}",
            ActionType::EDIT => "{$userName} edited the incident",
            default => "{$userName} made an update",
        };
    }

    /**
     * Check if this is a comment update.
     */
    public function isComment(): bool
    {
        return $this->action_type === ActionType::COMMENT;
    }

    /**
     * Check if this is a status change update.
     */
    public function isStatusChange(): bool
    {
        return $this->action_type === ActionType::STATUS_CHANGE;
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include updates of a specific type.
     */
    public function scopeOfType($query, ActionType|string $type)
    {
        $typeValue = $type instanceof ActionType ? $type->value : $type;
        return $query->where('action_type', $typeValue);
    }

    /**
     * Scope a query to only include comments.
     */
    public function scopeComments($query)
    {
        return $query->where('action_type', ActionType::COMMENT->value);
    }

    /**
     * Scope a query to only include public updates (not internal).
     */
    public function scopePublic($query)
    {
        return $query->where('is_internal', false);
    }

    /**
     * Scope a query to only include internal updates.
     */
    public function scopeInternal($query)
    {
        return $query->where('is_internal', true);
    }

    /**
     * Scope based on user's access level.
     * Internal updates are visible only to operators and admins.
     */
    public function scopeVisibleTo($query, User $user)
    {
        if ($user->canManageIncidents()) {
            return $query; // Can see all updates
        }
        return $query->public(); // Can only see public updates
    }
}
