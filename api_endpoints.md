# IOLS API Endpoints Documentation

**Base URL**: `http://localhost:8000/api`

---

## 1. Authentication

### Login
**POST** `/auth/login`

Authenticate a user and retrieve an API token.

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful.",
    "data": {
        "user": {
            "id": 1,
            "name": "Admin User",
            "email": "admin@iols.local",
            "role": "admin",
            "avatar": null,
            "is_first_login": false
        },
        "token": "1|laravel_sanctum_token...",
        "requires_password_change": false
    }
}
```

### Logout
**POST** `/auth/logout`
**Headers**: `Authorization: Bearer {token}`

Invalidate the current token.

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Logged out successfully."
}
```

### Get Current User
**GET** `/auth/me`
**Headers**: `Authorization: Bearer {token}`

Get the authenticated user's profile.

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "name": "Admin User",
        "email": "admin@iols.local",
        "role": "admin",
        "phone": "+1234567890",
        "avatar": null,
        "is_active": true,
        "last_login_at": "2026-01-18T10:00:00.000000Z",
        "created_at": "2026-01-18T09:00:00.000000Z"
    }
}
```

### Change Password
**POST** `/auth/change-password`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `current_password` | string | Yes | Current password |
| `password` | string | Yes | New password (min 8 chars, mixed case, numbers, symbols) |
| `password_confirmation` | string | Yes | Confirm new password |

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password changed successfully."
}
```

---

## 2. Incidents

### List Incidents
**GET** `/incidents`
**Headers**: `Authorization: Bearer {token}`

Retrieve a paginated list of incidents.

**Query Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `per_page` | integer | No | Items per page (default: 15) |
| `status` | string | No | Filter by status (`open`, `investigating`, `resolved`, `closed`) |
| `severity` | string | No | Filter by severity (`low`, `medium`, `high`, `critical`) |
| `priority` | string | No | Filter by priority (`low`, `normal`, `high`, `urgent`) |
| `search` | string | No | Search in title or description |

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "incident_number": "INC-20260118-0001",
            "title": "Server Outage",
            "description": "Main production server is unreachable.",
            "status": {
                "value": "open",
                "label": "Open",
                "color": "red"
            },
            "severity": {
                "value": "critical",
                "label": "Critical",
                "color": "red"
            },
            "priority": {
                "value": "urgent",
                "label": "Urgent",
                "color": "red"
            },
            "category": "Infrastructure",
            "reported_by": {
                "id": 5,
                "name": "Alice Reporter"
            },
            "assigned_to": null,
            "created_at_formatted": "Jan 18, 2026 10:30 AM",
            "time_elapsed": "2 hours ago"
        }
    ],
    "meta": {
        "current_page": 1,
        "total": 50,
        "per_page": 15
    },
    "links": { ... }
}
```

### Create Incident
**POST** `/incidents`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Incident title (max 255 chars) |
| `description` | string | Yes | Detailed description |
| `severity` | string | Yes | `low`, `medium`, `high`, `critical` |
| `priority` | string | Yes | `low`, `normal`, `high`, `urgent` |
| `category` | string | Yes | Incident category |
| `due_date` | date | No | Format: YYYY-MM-DD |
| `impact_description` | string | No | Description of impact |
| `affected_systems` | array | No | List of strings |

**Response (201 Created):**
```json
{
    "success": true,
    "message": "Incident created successfully.",
    "data": {
        "id": 1,
        "incident_number": "INC-20260118-0001",
        "title": "Server Outage",
        ...
    }
}
```

### Show Incident
**GET** `/incidents/{id}`
**Headers**: `Authorization: Bearer {token}`

Get detailed information about a specific incident.

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "incident_number": "INC-20260118-0001",
        "title": "Server Outage",
        "description": "...",
        "attachments": [],
        "updates": [],
        ...
    }
}
```

### Update Status
**PATCH** `/incidents/{id}/status`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `status` | string | Yes | New status (`investigating`, `resolved`, `closed`) |
| `comment` | string | Yes | Reason for status change |
| `resolution_notes` | string | Required if status is `resolved` or `closed` | |

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Incident status updated successfully."
}
```

### Add Comment
**POST** `/incidents/{id}/comments`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `comment` | string | Yes | The comment text |
| `is_internal` | boolean | No | Default `false`. If true, visible only to operators/admins |

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Comment added successfully."
}
```

---

## 3. Users (Admin Only)

### List Users
**GET** `/users`
**Headers**: `Authorization: Bearer {token}`

**Query Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `role` | string | No | `admin`, `operator`, `reporter` |
| `search` | string | No | Search name/email |

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 2,
            "name": "John Operator",
            "email": "john@iols.local",
            "role": "operator",
            "is_active": true
        }
    ],
    "meta": { ... }
}
```

### Create User
**POST** `/users`
**Headers**: `Authorization: Bearer {token}`

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's full name |
| `email` | string | Yes | Unique email address |
| `role` | string | Yes | `admin`, `operator`, `reporter` |
| `phone` | string | No | Phone number |

**Response (201 Created):**
```json
{
    "success": true,
    "message": "User created successfully. A welcome email has been sent.",
    "data": { ... }
}
```

### Reset User Password
**POST** `/users/{id}/reset-password`
**Headers**: `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
    "success": true,
    "message": "Password reset. A new password has been sent to the user."
}
```

### Toggle User Status (Block/Unblock)
**PATCH** `/users/{id}/toggle-status`
**Headers**: `Authorization: Bearer {token}`

Block or unblock a user. Admin only.

**Response (200 OK):**
```json
{
    "success": true,
    "message": "User blocked successfully.",
    "data": {
        "id": 2,
        "name": "John Operator",
        "email": "john@iols.local",
        "is_active": false
    }
}
```

---

## 4. Dashboard

### Get Stats
**GET** `/dashboard/stats`
**Headers**: `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
    "success": true,
    "data": {
        "total_incidents": 150,
        "open_incidents": 12,
        "resolved_incidents": 138,
        "avg_resolution_time": "4h 30m"
    }
}
```

### Escalation Alerts
**GET** `/dashboard/escalation-alerts`
**Headers**: `Authorization: Bearer {token}`

Get incidents at risk of SLA breach.

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": 5,
            "incident_number": "INC-...",
            "reason": "At risk of SLA breach (High Severity)",
            "hours_open": 25
        }
    ]
}
```

---

## 5. Notifications

### List Notifications
**GET** `/notifications`
**Headers**: `Authorization: Bearer {token}`

**Response (200 OK):**
```json
{
    "success": true,
    "data": [
        {
            "id": "uuid...",
            "type": "incident_assigned",
            "data": {
                "message": "You have been assigned to incident #INC-..."
            },
            "read_at": null,
            "created_at": "..."
        }
    ]
}
```



openapi: 3.0.3
info:
  title: 'IOLS API Documentation'
  description: 'Incident & Operations Log System API - Manage incidents, users, and operational workflows.'
  version: 1.0.0
servers:
  -
    url: 'http://localhost'
tags:
  -
    name: Attachments
    description: "\nAPIs for managing incident attachments"
  -
    name: Authentication
    description: "\nAPIs for user authentication and profile management"
  -
    name: Dashboard
    description: "\nAPIs for dashboard statistics and analytics"
  -
    name: 'Incident Management'
    description: "\nAPIs for managing incidents"
  -
    name: Notifications
    description: "\nAPIs for managing user notifications"
  -
    name: Public
    description: "\nPublic APIs that don't require authentication"
  -
    name: 'User Management'
    description: "\nAPIs for managing users (Admin only)"
components:
  securitySchemes:
    default:
      type: http
      scheme: bearer
      description: 'Get your token by calling POST /api/auth/login with your credentials. Include the token in the Authorization header as: Bearer {token}'
security:
  -
    default: []
paths:
  '/api/incidents/{incident}/attachments':
    get:
      summary: 'List Attachments'
      operationId: listAttachments
      description: 'Get all attachments for an incident.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Attachments
    post:
      summary: 'Upload Attachment'
      operationId: uploadAttachment
      description: 'Upload an attachment to an incident.'
      parameters: []
      responses: {  }
      tags:
        - Attachments
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                  description: 'The file to upload.'
              required:
                - file
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/attachments/{attachment}':
    delete:
      summary: 'Delete Attachment'
      operationId: deleteAttachment
      description: 'Delete an attachment.'
      parameters: []
      responses: {  }
      tags:
        - Attachments
    parameters:
      -
        in: path
        name: attachment
        description: 'The attachment ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/attachments/{attachment}/download':
    get:
      summary: 'Download Attachment'
      operationId: downloadAttachment
      description: 'Download an attachment file.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Attachments
    parameters:
      -
        in: path
        name: attachment
        description: 'The attachment ID.'
        example: 1
        required: true
        schema:
          type: integer
  /api/auth/login:
    post:
      summary: Login
      operationId: login
      description: 'Authenticate a user and return an API token.'
      parameters: []
      responses: {  }
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  description: "The user's email."
                  example: admin@iols.local
                password:
                  type: string
                  description: "The user's password."
                  example: password
              required:
                - email
                - password
      security: []
  /api/auth/forgot-password:
    post:
      summary: 'Forgot Password'
      operationId: forgotPassword
      description: "Send a password reset link to the user's email."
      parameters: []
      responses: {  }
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  description: "The user's email."
                  example: user@example.com
              required:
                - email
      security: []
  /api/auth/reset-password:
    post:
      summary: 'Reset Password'
      operationId: resetPassword
      description: "Reset the user's password using a reset token."
      parameters: []
      responses: {  }
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                email:
                  type: string
                  description: "The user's email."
                  example: user@example.com
                token:
                  type: string
                  description: 'The password reset token.'
                  example: architecto
                password:
                  type: string
                  description: 'The new password.'
                  example: NewPassword123
                password_confirmation:
                  type: string
                  description: 'Confirm the new password.'
                  example: NewPassword123
              required:
                - email
                - token
                - password
                - password_confirmation
      security: []
  /api/auth/logout:
    post:
      summary: Logout
      operationId: logout
      description: 'Revoke the current access token.'
      parameters: []
      responses: {  }
      tags:
        - Authentication
  /api/auth/logout-all:
    post:
      summary: 'Logout All Devices'
      operationId: logoutAllDevices
      description: 'Revoke all access tokens for the user.'
      parameters: []
      responses: {  }
      tags:
        - Authentication
  /api/auth/me:
    get:
      summary: 'Get Current User'
      operationId: getCurrentUser
      description: "Get the authenticated user's profile."
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Authentication
  /api/auth/first-login-password:
    post:
      summary: 'First Login Password Change'
      operationId: firstLoginPasswordChange
      description: 'Change password on first login (required).'
      parameters: []
      responses: {  }
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                password:
                  type: string
                  description: 'The new password.'
                  example: NewPassword123
                password_confirmation:
                  type: string
                  description: 'Confirm the new password.'
                  example: NewPassword123
              required:
                - password
                - password_confirmation
  /api/auth/change-password:
    post:
      summary: 'Change Password'
      operationId: changePassword
      description: 'Change the password for the authenticated user.'
      parameters: []
      responses: {  }
      tags:
        - Authentication
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                current_password:
                  type: string
                  description: 'The current password.'
                  example: architecto
                password:
                  type: string
                  description: 'The new password.'
                  example: NewPassword123
                password_confirmation:
                  type: string
                  description: 'Confirm the new password.'
                  example: NewPassword123
              required:
                - current_password
                - password
                - password_confirmation
  /api/auth/profile:
    put:
      summary: 'Update Profile'
      operationId: updateProfile
      description: "Update the authenticated user's profile."
      parameters: []
      responses: {  }
      tags:
        - Authentication
      requestBody:
        required: false
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: "The user's name."
                  example: architecto
                phone:
                  type: string
                  description: "The user's phone number."
                  example: architecto
                  nullable: true
                avatar:
                  type: string
                  format: binary
                  description: "The user's avatar image."
                  nullable: true
  /api/dashboard/stats:
    get:
      summary: 'Get Dashboard Stats'
      operationId: getDashboardStats
      description: 'Get summary statistics for the dashboard.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/recent-incidents:
    get:
      summary: 'Get Recent Incidents'
      operationId: getRecentIncidents
      description: 'Get the most recent incidents.'
      parameters:
        -
          in: query
          name: limit
          description: 'Number of incidents to return.'
          example: 10
          required: false
          schema:
            type: integer
            description: 'Number of incidents to return.'
            example: 10
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/my-assigned:
    get:
      summary: 'Get My Assigned Incidents'
      operationId: getMyAssignedIncidents
      description: 'Get incidents assigned to the current user.'
      parameters:
        -
          in: query
          name: limit
          description: 'Number of incidents to return.'
          example: 16
          required: false
          schema:
            type: integer
            description: 'Number of incidents to return.'
            example: 16
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/severity-breakdown:
    get:
      summary: 'Get Severity Breakdown'
      operationId: getSeverityBreakdown
      description: 'Get incident counts by severity for charts.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/status-distribution:
    get:
      summary: 'Get Status Distribution'
      operationId: getStatusDistribution
      description: 'Get incident counts by status for charts.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/category-breakdown:
    get:
      summary: 'Get Category Breakdown'
      operationId: getCategoryBreakdown
      description: 'Get incident counts by category.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/trends:
    get:
      summary: 'Get Trends'
      operationId: getTrends
      description: 'Get incident creation trends over time.'
      parameters:
        -
          in: query
          name: days
          description: 'Number of days to look back.'
          example: 30
          required: false
          schema:
            type: integer
            description: 'Number of days to look back.'
            example: 30
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/mttr:
    get:
      summary: 'Get MTTR'
      operationId: getMTTR
      description: 'Get Mean Time To Resolution statistics (Admin only).'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/operator-performance:
    get:
      summary: 'Get Operator Performance'
      operationId: getOperatorPerformance
      description: 'Get operator performance metrics (Admin only).'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/dashboard/escalation-alerts:
    get:
      summary: 'Get Escalation Alerts'
      operationId: getEscalationAlerts
      description: 'Get incidents at risk of SLA breach.'
      parameters:
        -
          in: query
          name: hours
          description: 'Hours threshold for at-risk.'
          example: 24
          required: false
          schema:
            type: integer
            description: 'Hours threshold for at-risk.'
            example: 24
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Dashboard
  /api/incidents:
    get:
      summary: 'List Incidents'
      operationId: listIncidents
      description: 'Get a paginated list of incidents based on user role.'
      parameters:
        -
          in: query
          name: search
          description: 'Search by title, description, or incident number.'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Search by title, description, or incident number.'
            example: architecto
        -
          in: query
          name: status
          description: 'Filter by status (open, investigating, resolved, closed).'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by status (open, investigating, resolved, closed).'
            example: architecto
        -
          in: query
          name: severity
          description: 'Filter by severity (low, medium, high, critical).'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by severity (low, medium, high, critical).'
            example: architecto
        -
          in: query
          name: priority
          description: 'Filter by priority (low, normal, high, urgent).'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by priority (low, normal, high, urgent).'
            example: architecto
        -
          in: query
          name: category
          description: 'Filter by category.'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by category.'
            example: architecto
        -
          in: query
          name: from_date
          description: 'Filter by start date (Y-m-d).'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by start date (Y-m-d).'
            example: architecto
        -
          in: query
          name: to_date
          description: 'Filter by end date (Y-m-d).'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by end date (Y-m-d).'
            example: architecto
        -
          in: query
          name: per_page
          description: 'Items per page.'
          example: 15
          required: false
          schema:
            type: integer
            description: 'Items per page.'
            example: 15
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'Incident Management'
    post:
      summary: 'Create Incident'
      operationId: createIncident
      description: 'Create a new incident.'
      parameters: []
      responses: {  }
      tags:
        - 'Incident Management'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  description: 'The incident title.'
                  example: 'Network outage in Building A'
                description:
                  type: string
                  description: 'The incident description.'
                  example: 'Eius et animi quos velit et.'
                severity:
                  type: string
                  description: 'The severity level.'
                  example: high
                priority:
                  type: string
                  description: 'The priority level.'
                  example: urgent
                category:
                  type: string
                  description: 'The category.'
                  example: network
                impact_description:
                  type: string
                  description: 'Description of impact.'
                  example: architecto
                  nullable: true
                affected_systems:
                  type: array
                  description: 'List of affected systems.'
                  example:
                    - architecto
                  items:
                    type: string
                due_date:
                  type: string
                  description: 'Due date (Y-m-d).'
                  example: architecto
                  nullable: true
              required:
                - title
                - description
  /api/incidents/export:
    get:
      summary: 'Export Incidents'
      operationId: exportIncidents
      description: 'Export incidents to CSV with optional filters.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'Incident Management'
  /api/incidents/categories:
    get:
      summary: 'Get Categories'
      operationId: getCategories
      description: 'Get the list of available incident categories.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'Incident Management'
  '/api/incidents/{incident}':
    get:
      summary: 'Get Incident'
      operationId: getIncident
      description: 'Get details of a specific incident.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'Incident Management'
    put:
      summary: 'Update Incident'
      operationId: updateIncident
      description: "Update an incident's details."
      parameters: []
      responses: {  }
      tags:
        - 'Incident Management'
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                title:
                  type: string
                  description: 'Must not be greater than 255 characters.'
                  example: b
                description:
                  type: string
                  description: ''
                  example: 'Eius et animi quos velit et.'
                severity:
                  type: string
                  description: ''
                  example: high
                  enum:
                    - low
                    - medium
                    - high
                    - critical
                priority:
                  type: string
                  description: ''
                  example: high
                  enum:
                    - low
                    - normal
                    - high
                    - urgent
                category:
                  type: string
                  description: ''
                  example: hardware
                  enum:
                    - network
                    - security
                    - hardware
                    - software
                    - database
                    - application
                    - infrastructure
                    - other
                impact_description:
                  type: string
                  description: ''
                  example: architecto
                  nullable: true
                affected_systems:
                  type: array
                  description: ''
                  example:
                    - architecto
                  items:
                    type: string
                due_date:
                  type: string
                  description: 'Must be a valid date.'
                  example: '2026-01-18T13:13:44'
                  nullable: true
                resolution_notes:
                  type: string
                  description: ''
                  example: architecto
                  nullable: true
    delete:
      summary: 'Delete Incident'
      operationId: deleteIncident
      description: 'Delete an incident (Admin only).'
      parameters: []
      responses: {  }
      tags:
        - 'Incident Management'
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/incidents/{incident}/status':
    patch:
      summary: 'Update Status'
      operationId: updateStatus
      description: "Update an incident's status (following transition rules)."
      parameters: []
      responses: {  }
      tags:
        - 'Incident Management'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                status:
                  type: string
                  description: 'The new status.'
                  example: investigating
                notes:
                  type: string
                  description: 'Resolution notes (required when resolving).'
                  example: architecto
                  nullable: true
              required:
                - status
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/incidents/{incident}/assign':
    patch:
      summary: 'Assign Incident'
      operationId: assignIncident
      description: 'Assign an incident to an operator (Admin only).'
      parameters: []
      responses: {  }
      tags:
        - 'Incident Management'
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                operator_id:
                  type: integer
                  description: "The operator's user ID (null to unassign)."
                  example: 16
                  nullable: true
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/incidents/{incident}/updates':
    get:
      summary: 'Get Incident Updates'
      operationId: getIncidentUpdates
      description: 'Get the activity log/updates for an incident.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'Incident Management'
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/incidents/{incident}/comments':
    post:
      summary: 'Add Comment'
      operationId: addComment
      description: 'Add a comment to an incident.'
      parameters: []
      responses: {  }
      tags:
        - 'Incident Management'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                comment:
                  type: string
                  description: 'The comment text.'
                  example: architecto
                is_internal:
                  type: boolean
                  description: 'Whether this is an internal note (operators/admins only).'
                  example: false
              required:
                - comment
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/incidents/{incident}/valid-transitions':
    get:
      summary: 'Get Valid Transitions'
      operationId: getValidTransitions
      description: 'Get valid status transitions for an incident.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'Incident Management'
    parameters:
      -
        in: path
        name: incident
        description: 'The incident ID.'
        example: 1
        required: true
        schema:
          type: integer
  /api/notifications:
    get:
      summary: 'List Notifications'
      operationId: listNotifications
      description: 'Get all notifications for the current user.'
      parameters:
        -
          in: query
          name: per_page
          description: 'Items per page.'
          example: 20
          required: false
          schema:
            type: integer
            description: 'Items per page.'
            example: 20
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Notifications
  /api/notifications/unread:
    get:
      summary: 'Get Unread Notifications'
      operationId: getUnreadNotifications
      description: 'Get unread notifications for the current user.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Notifications
  /api/notifications/unread-count:
    get:
      summary: 'Get Unread Count'
      operationId: getUnreadCount
      description: 'Get the count of unread notifications.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - Notifications
  '/api/notifications/{notification}/read':
    patch:
      summary: 'Mark Notification as Read'
      operationId: markNotificationAsRead
      description: 'Mark a single notification as read.'
      parameters: []
      responses: {  }
      tags:
        - Notifications
    parameters:
      -
        in: path
        name: notification
        description: 'The notification ID.'
        example: 550e8400-e29b-41d4-a716-446655440000
        required: true
        schema:
          type: string
  /api/notifications/read-all:
    patch:
      summary: 'Mark All as Read'
      operationId: markAllAsRead
      description: 'Mark all notifications as read.'
      parameters: []
      responses: {  }
      tags:
        - Notifications
  /api/public/info:
    get:
      summary: 'Get System Info'
      operationId: getSystemInfo
      description: 'Get public system information for the landing page.'
      parameters: []
      responses:
        200:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  success: true
                  data:
                    name: IOLS
                    description: 'Incident & Operations Log System'
                    version: 1.0.0
                    features:
                      - 'Incident Management'
                      - 'Real-time Notifications'
                      - 'Role-based Access Control'
                      - 'Analytics Dashboard'
                      - 'CSV Export'
                      - 'Activity Audit Trail'
                    support_email: msigwamb@gmail.com
                properties:
                  success:
                    type: boolean
                    example: true
                  data:
                    type: object
                    properties:
                      name:
                        type: string
                        example: IOLS
                      description:
                        type: string
                        example: 'Incident & Operations Log System'
                      version:
                        type: string
                        example: 1.0.0
                      features:
                        type: array
                        example:
                          - 'Incident Management'
                          - 'Real-time Notifications'
                          - 'Role-based Access Control'
                          - 'Analytics Dashboard'
                          - 'CSV Export'
                          - 'Activity Audit Trail'
                        items:
                          type: string
                      support_email:
                        type: string
                        example: msigwamb@gmail.com
      tags:
        - Public
      security: []
  /api/public/health:
    get:
      summary: 'Health Check'
      operationId: healthCheck
      description: 'Check if the API is operational.'
      parameters: []
      responses:
        200:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  success: true
                  message: 'API is operational.'
                  timestamp: '2026-01-18T13:13:43+00:00'
                properties:
                  success:
                    type: boolean
                    example: true
                  message:
                    type: string
                    example: 'API is operational.'
                  timestamp:
                    type: string
                    example: '2026-01-18T13:13:43+00:00'
      tags:
        - Public
      security: []
  /api/users:
    get:
      summary: 'List Users'
      operationId: listUsers
      description: 'Get a paginated list of all users.'
      parameters:
        -
          in: query
          name: search
          description: 'Search by name or email.'
          example: john
          required: false
          schema:
            type: string
            description: 'Search by name or email.'
            example: john
        -
          in: query
          name: role
          description: 'Filter by role.'
          example: operator
          required: false
          schema:
            type: string
            description: 'Filter by role.'
            example: operator
        -
          in: query
          name: status
          description: 'Filter by status (active/inactive).'
          example: active
          required: false
          schema:
            type: string
            description: 'Filter by status (active/inactive).'
            example: active
        -
          in: query
          name: per_page
          description: 'Items per page.'
          example: 15
          required: false
          schema:
            type: integer
            description: 'Items per page.'
            example: 15
        -
          in: query
          name: page
          description: 'Page number.'
          example: 1
          required: false
          schema:
            type: integer
            description: 'Page number.'
            example: 1
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'User Management'
    post:
      summary: 'Create User'
      operationId: createUser
      description: 'Create a new user. A welcome email with login credentials will be sent.'
      parameters: []
      responses: {  }
      tags:
        - 'User Management'
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: "The user's name."
                  example: 'John Doe'
                email:
                  type: string
                  description: "The user's email."
                  example: john@example.com
                role:
                  type: string
                  description: "The user's role (reporter, operator, admin)."
                  example: operator
                phone:
                  type: string
                  description: "The user's phone number."
                  example: '+1234567890'
                  nullable: true
                is_active:
                  type: boolean
                  description: 'Whether the user is active.'
                  example: true
              required:
                - name
                - email
                - role
  /api/users/operators:
    get:
      summary: 'Get Operators'
      operationId: getOperators
      description: 'Get a list of operators for assignment dropdowns.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'User Management'
  /api/users/export:
    get:
      summary: 'Export Users'
      operationId: exportUsers
      description: 'Export users to CSV with optional filters.'
      parameters:
        -
          in: query
          name: search
          description: 'Search by name or email.'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Search by name or email.'
            example: architecto
        -
          in: query
          name: role
          description: 'Filter by role.'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by role.'
            example: architecto
        -
          in: query
          name: status
          description: 'Filter by status.'
          example: architecto
          required: false
          schema:
            type: string
            description: 'Filter by status.'
            example: architecto
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'User Management'
  '/api/users/{user}':
    get:
      summary: 'Get User'
      operationId: getUser
      description: 'Get details of a specific user.'
      parameters: []
      responses:
        401:
          description: ''
          content:
            application/json:
              schema:
                type: object
                example:
                  message: Unauthenticated.
                properties:
                  message:
                    type: string
                    example: Unauthenticated.
      tags:
        - 'User Management'
    put:
      summary: 'Update User'
      operationId: updateUser
      description: "Update a user's details."
      parameters: []
      responses: {  }
      tags:
        - 'User Management'
      requestBody:
        required: false
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                  description: "The user's name."
                  example: architecto
                email:
                  type: string
                  description: "The user's email."
                  example: gbailey@example.net
                role:
                  type: string
                  description: "The user's role."
                  example: architecto
                phone:
                  type: string
                  description: "The user's phone number."
                  example: architecto
                  nullable: true
                is_active:
                  type: boolean
                  description: 'Whether the user is active.'
                  example: false
    delete:
      summary: 'Delete User'
      operationId: deleteUser
      description: 'Deactivate a user (soft delete).'
      parameters: []
      responses: {  }
      tags:
        - 'User Management'
    parameters:
      -
        in: path
        name: user
        description: 'The user ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/users/{user}/reset-password':
    post:
      summary: 'Reset User Password'
      operationId: resetUserPassword
      description: "Reset a user's password (generates new password and sends email)."
      parameters: []
      responses: {  }
      tags:
        - 'User Management'
    parameters:
      -
        in: path
        name: user
        description: 'The user ID.'
        example: 1
        required: true
        schema:
          type: integer
  '/api/users/{user}/toggle-status':
    patch:
      summary: 'Toggle User Status (Block/Unblock)'
      operationId: toggleUserStatusBlockUnblock
      description: 'Block or unblock a user. When unblocking, login attempts are reset.'
      parameters: []
      responses: {  }
      tags:
        - 'User Management'
    parameters:
      -
        in: path
        name: user
        description: 'The user ID.'
        example: 16
        required: true
        schema:
          type: integer