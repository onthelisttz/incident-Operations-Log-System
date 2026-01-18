# Backend Plan - Incident & Operations Log System

## Tech Stack
- **Framework:** Laravel 11
- **Authentication:** Laravel Sanctum (Token-based API authentication)
- **Database:** MySQL
- **API Style:** RESTful API
- **API Documentation:** Laravel Scribe
- **Architecture:** Clean Architecture with SOLID principles
- **Email:** Laravel Mail (SMTP)

---

## Database Schema Design

### 1. Users Table
```sql
users
├── id (bigint, PK, auto-increment)
├── name (varchar 255)
├── email (varchar 255, unique)
├── password (varchar 255)
├── role (enum: 'reporter', 'operator', 'admin')
├── phone (varchar 20, nullable)
├── avatar (varchar 255, nullable)
├── is_active (boolean, default: true)
├── is_first_login (boolean, default: true) -- NEW: Track first login
├── default_password (varchar 255, nullable) -- NEW: Store hashed default password for email
├── last_login_at (timestamp, nullable)
├── email_verified_at (timestamp, nullable)
├── remember_token (varchar 100, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### 2. Incidents Table
```sql
incidents
├── id (bigint, PK, auto-increment)
├── incident_number (varchar 50, unique) -- Auto-generated: INC-YYYYMMDD-XXXX
├── title (varchar 255)
├── description (text)
├── severity (enum: 'low', 'medium', 'high', 'critical')
├── status (enum: 'open', 'investigating', 'resolved', 'closed')
├── priority (enum: 'low', 'normal', 'high', 'urgent')
├── category (varchar 100) -- e.g., 'network', 'security', 'hardware', 'software', 'other'
├── reported_by (bigint, FK -> users.id)
├── assigned_to (bigint, FK -> users.id, nullable)
├── due_date (date, nullable)
├── resolved_at (timestamp, nullable)
├── closed_at (timestamp, nullable)
├── resolution_notes (text, nullable)
├── impact_description (text, nullable)
├── affected_systems (json, nullable) -- Array of affected systems/services
├── created_at (timestamp)
└── updated_at (timestamp)
```

### 3. Incident Updates (Audit Trail / Activity Log)
```sql
incident_updates
├── id (bigint, PK, auto-increment)
├── incident_id (bigint, FK -> incidents.id)
├── user_id (bigint, FK -> users.id)
├── action_type (enum: 'status_change', 'comment', 'assignment', 'priority_change', 'severity_change', 'edit')
├── previous_value (varchar 255, nullable)
├── new_value (varchar 255, nullable)
├── comment (text, nullable)
├── is_internal (boolean, default: false) -- Internal notes visible only to operators/admins
├── created_at (timestamp)
└── updated_at (timestamp)
```

### 4. Incident Attachments (Extended Feature)
```sql
incident_attachments
├── id (bigint, PK, auto-increment)
├── incident_id (bigint, FK -> incidents.id)
├── uploaded_by (bigint, FK -> users.id)
├── file_name (varchar 255)
├── file_path (varchar 500)
├── file_type (varchar 100)
├── file_size (bigint) -- in bytes
├── created_at (timestamp)
└── updated_at (timestamp)
```

### 5. Notifications Table (Extended Feature)
```sql
notifications
├── id (uuid, PK)
├── user_id (bigint, FK -> users.id)
├── type (varchar 255)
├── notifiable_type (varchar 255)
├── notifiable_id (bigint)
├── data (json) -- Contains notification payload
├── read_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

### 6. Password Reset Tokens
```sql
password_reset_tokens
├── email (varchar 255, PK)
├── token (varchar 255)
└── created_at (timestamp, nullable)
```

### 7. Personal Access Tokens (Sanctum)
```sql
personal_access_tokens
├── id (bigint, PK, auto-increment)
├── tokenable_type (varchar 255)
├── tokenable_id (bigint)
├── name (varchar 255)
├── token (varchar 64, unique)
├── abilities (text, nullable)
├── last_used_at (timestamp, nullable)
├── expires_at (timestamp, nullable)
├── created_at (timestamp)
└── updated_at (timestamp)
```

---

## Directory Structure (Clean Architecture)

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── AuthController.php
│   │       ├── UserController.php
│   │       ├── IncidentController.php
│   │       ├── IncidentUpdateController.php
│   │       ├── DashboardController.php
│   │       ├── AttachmentController.php
│   │       ├── NotificationController.php
│   │       └── ExportController.php          # NEW: Handle CSV exports
│   ├── Middleware/
│   │   ├── RoleMiddleware.php
│   │   ├── EnsureUserIsActive.php
│   │   └── CheckFirstLogin.php               # NEW: Force password change on first login
│   ├── Requests/
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   ├── ResetPasswordRequest.php
│   │   │   ├── ForgotPasswordRequest.php
│   │   │   ├── ChangePasswordRequest.php
│   │   │   └── FirstLoginPasswordRequest.php # NEW: First login password change
│   │   ├── Incident/
│   │   │   ├── StoreIncidentRequest.php
│   │   │   ├── UpdateIncidentRequest.php
│   │   │   ├── UpdateStatusRequest.php
│   │   │   └── AssignIncidentRequest.php
│   │   ├── User/
│   │   │   ├── StoreUserRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   └── Export/
│   │       └── ExportRequest.php             # NEW: Export filter validation
│   └── Resources/
│       ├── UserResource.php
│       ├── IncidentResource.php
│       ├── IncidentCollection.php
│       ├── IncidentUpdateResource.php
│       ├── DashboardResource.php
│       └── PaginatedResource.php             # NEW: Standardized pagination response
├── Models/
│   ├── User.php
│   ├── Incident.php
│   ├── IncidentUpdate.php
│   ├── IncidentAttachment.php
│   └── Notification.php
├── Services/
│   ├── AuthService.php
│   ├── IncidentService.php
│   ├── IncidentStatusService.php
│   ├── NotificationService.php
│   ├── DashboardService.php
│   ├── UserService.php                       # NEW: Handle user creation with email
│   └── ExportService.php                     # NEW: Handle CSV exports
├── Repositories/
│   ├── Interfaces/
│   │   ├── UserRepositoryInterface.php
│   │   ├── IncidentRepositoryInterface.php
│   │   └── IncidentUpdateRepositoryInterface.php
│   └── Eloquent/
│       ├── UserRepository.php
│       ├── IncidentRepository.php
│       └── IncidentUpdateRepository.php
├── Policies/
│   ├── IncidentPolicy.php
│   └── UserPolicy.php
├── Observers/
│   └── IncidentObserver.php
├── Enums/
│   ├── UserRole.php
│   ├── IncidentStatus.php
│   ├── IncidentSeverity.php
│   ├── IncidentPriority.php
│   └── ActionType.php
├── Events/
│   ├── IncidentCreated.php
│   ├── IncidentStatusChanged.php
│   ├── IncidentAssigned.php
│   └── UserCreated.php                       # NEW: Trigger welcome email
├── Listeners/
│   ├── SendIncidentCreatedNotification.php
│   ├── SendStatusChangeNotification.php
│   ├── SendAssignmentNotification.php
│   └── SendWelcomeEmail.php                  # NEW: Send welcome email with password
├── Mail/
│   └── WelcomeUserMail.php                   # NEW: Welcome email template
├── Exports/
│   ├── UsersExport.php                       # NEW: User CSV export
│   ├── IncidentsExport.php                   # NEW: Incident CSV export
│   └── BaseExport.php                        # NEW: Base export class
└── Exceptions/
    ├── InvalidStatusTransitionException.php
    └── UnauthorizedActionException.php
```

---

## API Documentation (Scribe)

### Setup
```bash
composer require knuckleswtf/scribe
php artisan vendor:publish --tag=scribe-config
```

### Configuration
```php
// config/scribe.php
return [
    'title' => 'Incident & Operations Log System API',
    'description' => 'API documentation for the Incident Management System',
    'base_url' => env('APP_URL'),
    'routes' => [
        [
            'match' => [
                'prefixes' => ['api/*'],
            ],
            'apply' => [
                'headers' => [
                    'Authorization' => 'Bearer {token}',
                ],
            ],
        ],
    ],
    'type' => 'static', // or 'laravel' for blade views
    'static' => [
        'output_path' => 'public/docs',
    ],
    'postman' => [
        'enabled' => true,
    ],
    'openapi' => [
        'enabled' => true,
    ],
];
```

### Generate Documentation
```bash
php artisan scribe:generate
```

### Access Points
- **HTML Docs:** `/docs`
- **Postman Collection:** `/docs/collection.json`
- **OpenAPI Spec:** `/docs/openapi.yaml`

---

## API Endpoints

### Public (Landing Page Info)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/public/info` | Get public system info for landing page | Public |

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Authenticated |
| POST | `/api/auth/forgot-password` | Request password reset | Public |
| POST | `/api/auth/reset-password` | Reset password with token | Public |
| POST | `/api/auth/change-password` | Change password (logged in) | Authenticated |
| POST | `/api/auth/first-login-password` | Change password on first login | Authenticated (First Login) |
| GET | `/api/auth/me` | Get current user profile | Authenticated |
| PUT | `/api/auth/profile` | Update user profile | Authenticated |

### Users (Admin Only)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/users` | List all users (paginated) | Admin |
| POST | `/api/users` | Create new user (sends welcome email) | Admin |
| GET | `/api/users/{id}` | Get user details | Admin |
| PUT | `/api/users/{id}` | Update user | Admin |
| DELETE | `/api/users/{id}` | Delete/deactivate user | Admin |
| GET | `/api/users/operators` | List operators (for assignment) | Admin |
| GET | `/api/users/export` | Export users to CSV (with filters) | Admin |

### Incidents
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/incidents` | List incidents (paginated, filtered by role) | Authenticated |
| POST | `/api/incidents` | Create new incident | Reporter, Admin |
| GET | `/api/incidents/{id}` | Get incident details | Owner/Assigned/Admin |
| PUT | `/api/incidents/{id}` | Update incident | Operator, Admin |
| DELETE | `/api/incidents/{id}` | Delete incident | Admin |
| PATCH | `/api/incidents/{id}/status` | Update incident status | Operator, Admin |
| PATCH | `/api/incidents/{id}/assign` | Assign incident to operator | Admin |
| GET | `/api/incidents/{id}/updates` | Get incident activity log | Owner/Assigned/Admin |
| POST | `/api/incidents/{id}/comments` | Add comment to incident | Owner/Assigned/Admin |
| GET | `/api/incidents/export` | Export incidents to CSV (with filters) | Authenticated |

### Attachments
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/incidents/{id}/attachments` | Upload attachment | Owner/Assigned/Admin |
| GET | `/api/incidents/{id}/attachments` | List attachments | Owner/Assigned/Admin |
| DELETE | `/api/attachments/{id}` | Delete attachment | Uploader/Admin |

### Dashboard (Extended Features Included)
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | Authenticated |
| GET | `/api/dashboard/recent-incidents` | Get recent incidents | Authenticated |
| GET | `/api/dashboard/my-assigned` | Get user's assigned incidents | Operator, Admin |
| GET | `/api/dashboard/severity-breakdown` | Get severity distribution | Authenticated |
| GET | `/api/dashboard/status-distribution` | Get status distribution | Authenticated |
| GET | `/api/dashboard/trends` | Get incident trends (weekly/monthly) | Authenticated |
| GET | `/api/dashboard/mttr` | Get Mean Time To Resolution | Admin |
| GET | `/api/dashboard/operator-performance` | Get operator metrics | Admin |
| GET | `/api/dashboard/escalation-alerts` | Get SLA breach warnings | Operator, Admin |
| GET | `/api/dashboard/category-breakdown` | Get incidents by category | Authenticated |

### Notifications
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/notifications` | Get user notifications | Authenticated |
| PATCH | `/api/notifications/{id}/read` | Mark notification as read | Authenticated |
| PATCH | `/api/notifications/read-all` | Mark all as read | Authenticated |

---

## User Creation with Welcome Email

### Flow
1. Admin creates user via `/api/users` POST
2. System generates random default password
3. Password is hashed and stored in `password` field
4. Plain-text password is temporarily stored for email
5. `UserCreated` event is dispatched
6. `SendWelcomeEmail` listener sends email with credentials
7. User logs in with default password
8. System detects `is_first_login = true`
9. API returns `requires_password_change: true` in login response
10. Frontend redirects to password change screen
11. After changing password, `is_first_login` is set to `false`

### UserService.php
```php
class UserService
{
    public function createUser(array $data): User
    {
        // Generate random default password
        $defaultPassword = Str::random(12);
        
        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($defaultPassword),
            'role' => $data['role'],
            'phone' => $data['phone'] ?? null,
            'is_active' => true,
            'is_first_login' => true,
        ]);
        
        // Dispatch event with plain password for email
        event(new UserCreated($user, $defaultPassword));
        
        return $user;
    }
}
```

### WelcomeUserMail.php
```php
class WelcomeUserMail extends Mailable
{
    public function __construct(
        public User $user,
        public string $defaultPassword
    ) {}
    
    public function content(): Content
    {
        return new Content(
            view: 'emails.welcome-user',
            with: [
                'name' => $this->user->name,
                'email' => $this->user->email,
                'password' => $this->defaultPassword,
                'loginUrl' => config('app.frontend_url') . '/login',
            ]
        );
    }
}
```

### Login Response
```json
{
    "success": true,
    "data": {
        "user": { ... },
        "token": "...",
        "requires_password_change": true  // true if is_first_login
    }
}
```

---

## Pagination Response Format

### Standard Paginated Response
```json
{
    "success": true,
    "data": [
        { "id": 1, ... },
        { "id": 2, ... }
    ],
    "meta": {
        "current_page": 1,
        "per_page": 15,
        "total": 150,
        "total_pages": 10,
        "from": 1,
        "to": 15,
        "has_next_page": true,
        "has_previous_page": false
    },
    "links": {
        "first": "/api/incidents?page=1",
        "last": "/api/incidents?page=10",
        "prev": null,
        "next": "/api/incidents?page=2"
    }
}
```

### PaginatedResource.php
```php
class PaginatedResource
{
    public static function format(LengthAwarePaginator $paginator, $resourceClass): array
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
}
```

---

## CSV Export System

### Export Endpoint Pattern
Exports accept the same filter parameters as list endpoints, exporting only the filtered data.

### Example: Incidents Export
```
GET /api/incidents/export?status=open&severity=critical&search=server
```

### ExportService.php
```php
class ExportService
{
    public function exportIncidents(array $filters): StreamedResponse
    {
        return response()->streamDownload(function () use ($filters) {
            $handle = fopen('php://output', 'w');
            
            // Headers
            fputcsv($handle, [
                'Incident Number', 'Title', 'Severity', 'Status', 
                'Priority', 'Category', 'Reporter', 'Assigned To', 
                'Created At', 'Resolved At'
            ]);
            
            // Apply same filters as list endpoint
            Incident::query()
                ->when($filters['status'] ?? null, fn($q, $s) => $q->where('status', $s))
                ->when($filters['severity'] ?? null, fn($q, $s) => $q->where('severity', $s))
                ->when($filters['search'] ?? null, fn($q, $s) => $q->where('title', 'like', "%{$s}%"))
                ->with(['reporter', 'assignedTo'])
                ->chunk(1000, function ($incidents) use ($handle) {
                    foreach ($incidents as $incident) {
                        fputcsv($handle, [
                            $incident->incident_number,
                            $incident->title,
                            $incident->severity,
                            $incident->status,
                            $incident->priority,
                            $incident->category,
                            $incident->reporter->name,
                            $incident->assignedTo?->name ?? 'Unassigned',
                            $incident->created_at->format('Y-m-d H:i:s'),
                            $incident->resolved_at?->format('Y-m-d H:i:s') ?? '',
                        ]);
                    }
                });
            
            fclose($handle);
        }, 'incidents-' . now()->format('Y-m-d') . '.csv');
    }
    
    public function exportUsers(array $filters): StreamedResponse
    {
        return response()->streamDownload(function () use ($filters) {
            $handle = fopen('php://output', 'w');
            
            fputcsv($handle, [
                'ID', 'Name', 'Email', 'Role', 'Phone', 
                'Status', 'Last Login', 'Created At'
            ]);
            
            User::query()
                ->when($filters['role'] ?? null, fn($q, $r) => $q->where('role', $r))
                ->when($filters['status'] ?? null, fn($q, $s) => $q->where('is_active', $s === 'active'))
                ->when($filters['search'] ?? null, fn($q, $s) => $q->where(function($q) use ($s) {
                    $q->where('name', 'like', "%{$s}%")
                      ->orWhere('email', 'like', "%{$s}%");
                }))
                ->chunk(1000, function ($users) use ($handle) {
                    foreach ($users as $user) {
                        fputcsv($handle, [
                            $user->id,
                            $user->name,
                            $user->email,
                            $user->role,
                            $user->phone ?? '',
                            $user->is_active ? 'Active' : 'Inactive',
                            $user->last_login_at?->format('Y-m-d H:i:s') ?? 'Never',
                            $user->created_at->format('Y-m-d H:i:s'),
                        ]);
                    }
                });
            
            fclose($handle);
        }, 'users-' . now()->format('Y-m-d') . '.csv');
    }
}
```

---

## Status Transition Rules

```
Valid Transitions:
open → investigating
investigating → resolved
resolved → closed

State Machine:
┌──────────┐    ┌───────────────┐    ┌──────────┐    ┌────────┐
│   OPEN   │───▶│ INVESTIGATING │───▶│ RESOLVED │───▶│ CLOSED │
└──────────┘    └───────────────┘    └──────────┘    └────────┘

Rules:
- Only forward transitions allowed
- No skipping states
- Each transition creates an audit log entry
- Resolved requires resolution_notes
- Closed sets closed_at timestamp
```

---

## Role-Based Access Control (RBAC)

### Reporter
- Create incidents
- View own incidents only
- Add comments to own incidents
- Upload attachments to own incidents
- View dashboard (own stats)
- Export own incidents to CSV

### Operator
- View assigned incidents
- Update incident status (following rules)
- Add comments (including internal notes)
- Upload attachments
- View dashboard (assigned stats)
- Export assigned incidents to CSV

### Admin
- Full access to all incidents
- Manage users (CRUD)
- Assign incidents to operators
- View all dashboard statistics (including extended analytics)
- Delete incidents
- Access internal notes
- Export all data to CSV
- View operator performance metrics
- View MTTR analytics

---

## Security Measures

1. **Authentication**
   - Laravel Sanctum for API tokens
   - Token expiration policy
   - Rate limiting on auth endpoints
   - First login password change enforcement

2. **Authorization**
   - Policy-based authorization
   - Role middleware
   - Gate definitions for fine-grained control

3. **Data Validation**
   - Form Request validation
   - Input sanitization
   - SQL injection prevention (Eloquent ORM)

4. **Password Security**
   - Bcrypt hashing
   - Password complexity requirements
   - Secure password reset flow
   - Forced password change on first login

5. **API Security**
   - CORS configuration
   - Rate limiting
   - Request throttling
   - HTTPS enforcement

---

## Extended Features (Best-of-Best) - Dashboard Integrated

### Feature 1: Smart Incident Escalation (Dashboard)
- Dashboard widget showing escalation alerts
- Auto-escalate incidents based on:
  - Time without status change
  - Severity level
  - SLA breach warnings
- Configurable escalation rules
- Visual indicators on dashboard for at-risk incidents

### Feature 2: Real-Time Notifications (Dashboard)
- Notification bell in header
- In-app notifications for:
  - New assignments
  - Status changes
  - Comments on incidents
  - SLA warnings
- Email notifications (optional)
- Unread count badge

### Feature 3: Analytics & Reporting (Dashboard)
- **Dashboard Widgets:**
  - MTTR (Mean Time To Resolution) card
  - Incident trends chart (weekly/monthly)
  - Severity breakdown pie chart
  - Status distribution chart
  - Category breakdown
  - Operator performance table (Admin)
- Date range selector for all analytics
- Drill-down from dashboard to filtered incident list

---

## Seeders Plan

1. **RolesSeeder** - Create default roles
2. **UsersSeeder** - Create admin, operators, reporters (with is_first_login = false for test users)
3. **IncidentsSeeder** - Sample incidents for testing
4. **IncidentUpdatesSeeder** - Sample activity logs

---

## Testing Strategy

1. **Unit Tests**
   - Service layer tests
   - Status transition logic
   - Policy tests
   - Export service tests
   - User creation email tests

2. **Feature Tests**
   - API endpoint tests
   - Authentication flow
   - Role-based access tests
   - First login password change flow
   - CSV export tests

3. **Integration Tests**
   - Full incident lifecycle
   - Notification delivery
   - Email sending
