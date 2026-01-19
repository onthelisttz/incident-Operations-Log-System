# IOLS - Backend

The backend API for the Incident & Operations Log System, built with **Laravel 10**, **PHP 8.2**, and **MySQL**.

## Prerequisites

- **PHP**: v8.2 or higher
- **Composer**
- **MySQL**: v8.0 or higher

## Installation

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Install dependencies:**
    ```bash
    composer install
    ```

3.  **Environment Configuration:**
    *Skip this if `.env` is already present.*
    ```bash
    cp .env.example .env
    ```
    *Open `.env` and update the database configuration:*
    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=iols
    DB_USERNAME=root
    DB_PASSWORD=
    ```

4.  **Generate Application Key:**
    *Skip this if `.env` already has an APP_KEY.*
    ```bash
    php artisan key:generate
    ```

5.  **Database Setup (Migrations & Seeding):**
    Run the migrations and seed the database with initial data (System Admin, roles, etc.).
    **First-time Setup (Create Database):**
    If the database does not exist yet, run this command and type `yes` when asked to create it:
    ```bash
    php artisan migrate
    ```

    **Populate Database (Seed Users):**
    Once the database exists, run this command to set up the clean schema and create default users:
    ```bash
    php artisan migrate:fresh --seed
    ```
    > **⚠️ IMPORTANT:** You **MUST** run the `--seed` flag during the initial setup. Running only `php artisan migrate` will create the tables but **will not create any user accounts**, making it impossible to log in.

    **Default Accounts Created by Seeder:**
    - **Admin**: `admin@iols.local` / `password`
    - **Operator**: `john.operator@iols.local` / `password`
    - **Reporter**: `alice.reporter@iols.local` / `password`

## Running the Application

To start the local development server:
```bash
php artisan serve
```
The API will be available at `http://127.0.0.1:8000`.

## API Documentation

The project uses **Knuckles Scribe** to generate API documentation.

### Generating Documentation
To generate or update the documentation after making changes to the API:
```bash
php artisan scribe:generate
```

### Viewing Documentation
Once the server is running, visit:
[http://localhost:8000/docs](http://localhost:8000/docs)

## Testing

To run the automated test suite:
```bash
php artisan test
```

## Useful Commands

- **Clear Cache:** `php artisan optimize:clear`