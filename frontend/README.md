# IOLS - Frontend

The frontend application for the Incident & Operations Log System, built with **React**, **TypeScript**, and **Tailwind CSS**.

## Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v16.0.0 or higher

## Installation

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    *Skip this if `.env` is already present.*
    ```bash
    cp .env.example .env
    ```
    *Note: If `.env.example` does not exist, create a `.env` file with the following content:*
    ```env
    VITE_API_BASE_URL=http://localhost:8000/api
    ```

## Running the Application

### Development Server
To start the development server with Hot Module Replacement (HMR):
```bash
npm run dev
```
The application will be available at `http://localhost:5173`.

### Production Build
To build the application for production:
```bash
npm run build
```
The build artifacts will be stored in the `dist/` directory.

### Linting
To run the linter:
```bash
npm run lint
```

## Project Structure

- `src/api`: API client and endpoint definitions.
- `src/components`: Reusable UI components.
- `src/contexts`: React Context providers (Auth, Theme, etc.).
- `src/hooks`: Custom React hooks.
- `src/pages`: Page components corresponding to routes.
- `src/routes`: Routing configuration.
- `src/types`: TypeScript type definitions.
- `src/utils`: Helper functions and utilities.
