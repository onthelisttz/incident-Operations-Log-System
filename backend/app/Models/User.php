<?php

namespace App\Models;

use App\Enums\UserRole;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'phone',
        'avatar',
        'is_active',
        'is_first_login',
        'login_attempts',
        'last_login_at',
    ];

    /**
     * Check if user is blocked.
     */
    public function isBlocked(): bool
    {
        return !$this->is_active;
    }

    /**
     * Increment login attempts.
     */
    public function incrementLoginAttempts(): void
    {
        $this->increment('login_attempts');
    }

    /**
     * Reset login attempts.
     */
    public function resetLoginAttempts(): void
    {
        $this->update(['login_attempts' => 0]);
    }

    /**
     * Block the user.
     */
    public function block(): void
    {
        $this->update(['is_active' => false]);
    }

    /**
     * Unblock the user.
     */
    public function unblock(): void
    {
        $this->update([
            'is_active' => true,
            'login_attempts' => 0,
        ]);
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'is_first_login' => 'boolean',
            'role' => UserRole::class,
        ];
    }

    // ==================== RELATIONSHIPS ====================

    /**
     * Get incidents reported by this user.
     */
    public function reportedIncidents(): HasMany
    {
        return $this->hasMany(Incident::class, 'reported_by');
    }

    /**
     * Get incidents assigned to this user.
     */
    public function assignedIncidents(): HasMany
    {
        return $this->hasMany(Incident::class, 'assigned_to');
    }

    /**
     * Get incident updates/comments by this user.
     */
    public function incidentUpdates(): HasMany
    {
        return $this->hasMany(IncidentUpdate::class);
    }

    /**
     * Get attachments uploaded by this user.
     */
    public function uploadedAttachments(): HasMany
    {
        return $this->hasMany(IncidentAttachment::class, 'uploaded_by');
    }

    // ==================== ACCESSORS ====================

    /**
     * Check if user is admin.
     */
    public function isAdmin(): bool
    {
        return $this->role === UserRole::ADMIN;
    }

    /**
     * Check if user is operator.
     */
    public function isOperator(): bool
    {
        return $this->role === UserRole::OPERATOR;
    }

    /**
     * Check if user is reporter.
     */
    public function isReporter(): bool
    {
        return $this->role === UserRole::REPORTER;
    }

    /**
     * Check if user can manage incidents (operator or admin).
     */
    public function canManageIncidents(): bool
    {
        return $this->isAdmin() || $this->isOperator();
    }

    // ==================== SCOPES ====================

    /**
     * Scope a query to only include active users.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include users with a specific role.
     */
    public function scopeRole($query, UserRole|string $role)
    {
        $roleValue = $role instanceof UserRole ? $role->value : $role;
        return $query->where('role', $roleValue);
    }

    /**
     * Scope a query to only include operators.
     */
    public function scopeOperators($query)
    {
        return $query->where('role', UserRole::OPERATOR->value);
    }

    /**
     * Scope a query to only include admins.
     */
    public function scopeAdmins($query)
    {
        return $query->where('role', UserRole::ADMIN->value);
    }

    /**
     * Scope a query to search by name or email.
     */
    public function scopeSearch($query, string $search)
    {
        return $query->where(function ($q) use ($search) {
            $q->where('name', 'like', "%{$search}%")
              ->orWhere('email', 'like', "%{$search}%");
        });
    }
}
