# Incident & Operations Log System (IOLS) - Backend

## Overview

IOLS is a robust incident management system designed to track, manage, and resolve operational incidents efficiently. This repository contains the backend API built with Laravel 12.

## Key Features

- **Authentication**: Secure token-based auth using Laravel Sanctum.
- **Role-Based Access Control (RBAC)**: Admin, Operator, and Reporter roles with granular permissions.
- **Incident Management**: complete lifecycle management (Open -> Investigating -> Resolved -> Closed).
- **Dashboard & Analytics**: Real-time statistics, MTTR tracking, and operator performance metrics.
- **Audit Logging**: Comprehensive activity logs for all incident changes.
- **Notifications**: In-app notifications for status changes and assignments.

## Tech Stack

- **Framework**: Laravel 12
- **Database**: MySQL
- **API Documentation**: Scribe
- **Testing**: PHPUnit

## Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- MySQL

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   composer install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   Configure your database settings in `.env`.

4. **Database Setup**
   ```bash
   php artisan migrate:fresh --seed
   ```
   This will create the tables and seed default users:
   - **Admin**: `admin@iols.local` / `password`
   - **Operator**: `john.operator@iols.local` / `password`
   - **Reporter**: `alice.reporter@iols.local` / `password`

5. **Serve the Application**
   ```bash
   php artisan serve
   ```

## API Documentation

The API documentation is available at `/docs` when the server is running.
To regenerate documentation:
```bash
php artisan scribe:generate
```

## Running Tests

```bash
php artisan test
```
