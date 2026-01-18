# Incident & Operations Log System

## Overview

A web-based system for reporting, tracking, and resolving operational incidents. Built with **Laravel** (backend) and **React** (frontend), it enables organizations to manage incidents efficiently with role-based access, real-time notifications, and analytics.

---

## User Roles

| Role       | Description                                      |
|------------|--------------------------------------------------|
| **Admin**  | Full access - manages users, settings, all data  |
| **Operator** | Handles incidents - updates status, resolves    |
| **Reporter** | Creates incidents - views own submissions       |

---

## Core Flows

### 1. User Registration Flow (Admin Creates User)

```
Admin → Create User Form → Submit
                              ↓
                    Backend validates data
                              ↓
                    Create user with:
                    - Temporary password (auto-generated)
                    - is_first_login = true
                              ↓
                    Send Welcome Email with credentials
                              ↓
User receives email → Clicks Login Link → Enters credentials
                              ↓
                    System detects is_first_login = true
                              ↓
                    Redirect to "Change Password" page
                              ↓
User sets new password → is_first_login = false → Dashboard
```

### 2. Login Flow

```
Landing Page → Click "Login" → Login Page
                                    ↓
                        Enter email & password
                                    ↓
                        POST /api/auth/login
                                    ↓
              ┌─────────────────────┴─────────────────────┐
              ↓                                           ↓
    is_first_login = true                      is_first_login = false
              ↓                                           ↓
    Redirect to /first-login              Redirect to /dashboard
    (Force password change)
```

### 3. Forgot Password Flow

```
Login Page → Click "Forgot Password" → Forgot Password Page
                                              ↓
                                    Enter email → Submit
                                              ↓
                                    POST /api/auth/forgot-password
                                              ↓
                                    Generate reset token (60 min expiry)
                                    Store hashed token in DB
                                              ↓
                                    Send email with reset link
                                              ↓
User clicks link → Reset Password Page → Enter new password
                                              ↓
                                    POST /api/auth/reset-password
                                    (token + email + new password)
                                              ↓
                                    Validate token → Update password
                                    Delete used token
                                              ↓
                                    Redirect to Login → Success
```

### 4. Incident Lifecycle Flow

```
Reporter creates incident
         ↓
    ┌────────────┐
    │   OPEN     │  ← Initial state
    └─────┬──────┘
          ↓ (Operator picks up)
    ┌────────────────┐
    │ INVESTIGATING  │  ← Work in progress
    └───────┬────────┘
            ↓ (Issue fixed)
    ┌────────────┐
    │  RESOLVED  │  ← Awaiting confirmation
    └─────┬──────┘
          ↓ (Confirmed fixed)
    ┌────────────┐
    │   CLOSED   │  ← Final state
    └────────────┘

Note: Status can move backward if issue reoccurs
```

### 5. Incident Reporting Flow

```
Reporter → Click "New Incident" → Incident Form
                                       ↓
                            Fill details:
                            - Title, Description
                            - Category, Priority
                            - Attachments (optional)
                                       ↓
                            POST /api/incidents
                                       ↓
                            Incident created (status: OPEN)
                                       ↓
                            Notify operators/admins
                                       ↓
                            Redirect to incident detail
```

### 6. Incident Resolution Flow

```
Operator views incident → Updates status to INVESTIGATING
                                    ↓
                        Add update notes (what's being done)
                                    ↓
                        Issue fixed → Status to RESOLVED
                                    ↓
                        Reporter notified
                                    ↓
            ┌───────────────────────┴───────────────────────┐
            ↓                                               ↓
    Reporter confirms fix                          Issue persists
            ↓                                               ↓
    Admin closes incident                    Reopen → back to OPEN
    Status → CLOSED
```

### 7. CSV Export Flow

```
User on List Page (Users/Incidents)
            ↓
    Apply filters (optional):
    - Search, Status, Date Range, etc.
            ↓
    Click "Export CSV" button
            ↓
    GET /api/{resource}/export?{current_filters}
            ↓
    Backend generates CSV with:
    - Only filtered data (what user sees)
    - All relevant columns
            ↓
    Browser downloads file
```

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐            │
│  │ Landing │  │  Auth   │  │Dashboard│  │  Lists  │            │
│  │  Page   │  │ Pages   │  │  Page   │  │ (CRUD)  │            │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘            │
│       └────────────┴────────────┴────────────┘                  │
│                          │                                      │
│                   Axios HTTP Client                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────────────┐
│                       BACKEND (Laravel)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    API Routes                            │   │
│  │  /auth/*  /incidents/*  /users/*  /dashboard/*          │   │
│  └─────────────────────────┬───────────────────────────────┘   │
│                            ↓                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Controllers │  │  Services   │  │Repositories │             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘             │
│         └────────────────┴────────────────┘                     │
│                          │                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │   Models    │  │   Events    │  │    Mail     │             │
│  └──────┬──────┘  └─────────────┘  └─────────────┘             │
│         │                                                       │
└─────────┼───────────────────────────────────────────────────────┘
          │
    ┌─────┴─────┐
    │  MySQL    │
    │ Database  │
    └───────────┘
```

---

## Page Structure

```
PUBLIC ROUTES (No Auth Required)
├── /                    → Landing Page (Home)
├── /login               → Login Page
├── /forgot-password     → Forgot Password Page
└── /reset-password      → Reset Password Page

PROTECTED ROUTES (Auth Required)
├── /first-login         → First Login Password Change
├── /dashboard           → Dashboard (with analytics widgets)
├── /incidents           → Incident List (with export)
│   ├── /incidents/new   → Create Incident
│   └── /incidents/:id   → Incident Detail
├── /users               → User List (Admin only, with export)
│   ├── /users/new       → Create User (Admin only)
│   └── /users/:id       → User Detail/Edit
├── /profile             → Current User Profile
└── /settings            → System Settings (Admin only)
```

---

## Navigation Structure (Top Header)

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]   Dashboard  Incidents  Users(admin)  │  [Bell] [User▼] │
└─────────────────────────────────────────────────────────────────┘

User Dropdown:
├── Profile
├── Settings (Admin)
└── Logout
```

---

## Key Features Summary

| Feature                  | Description                                    |
|--------------------------|------------------------------------------------|
| Role-Based Access        | Admin, Operator, Reporter permissions          |
| Incident Tracking        | Full lifecycle management                      |
| Status Workflow          | Open → Investigating → Resolved → Closed       |
| Priority Levels          | Critical, High, Medium, Low                    |
| File Attachments         | Upload evidence/screenshots                    |
| Update Timeline          | Chronological incident updates                 |
| Email Notifications      | Welcome, password reset, incident alerts       |
| CSV Export               | Export filtered data from any list             |
| Pagination               | All lists with proper navigation               |
| Dashboard Analytics      | Stats, charts, MTTR, trends                    |
| API Documentation        | Scribe-generated docs at /docs                 |

---

## Technology Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| Frontend   | React, TypeScript, Tailwind CSS      |
| Backend    | Laravel 10+, PHP 8.1+                |
| Database   | MySQL 8.0+                           |
| Auth       | Laravel Sanctum (API tokens)         |
| API Docs   | Laravel Scribe                       |
| Email      | Laravel Mail (SMTP/Mailgun/etc)      |
| Charts     | Recharts                             |
| Forms      | React Hook Form + Zod                |

---

## Quick Reference: Status Colors

| Status        | Background | Text Color |
|---------------|------------|------------|
| Open          | Red-100    | Red-600    |
| Investigating | Yellow-100 | Yellow-700 |
| Resolved      | Blue-100   | Blue-600   |
| Closed        | Green-100  | Green-600  |

## Quick Reference: Priority Colors

| Priority | Background  | Text Color  |
|----------|-------------|-------------|
| Critical | Red-100     | Red-600     |
| High     | Orange-100  | Orange-600  |
| Medium   | Yellow-100  | Yellow-700  |
| Low      | Green-100   | Green-600   |
