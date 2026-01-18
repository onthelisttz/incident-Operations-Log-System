<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>IOLS API</title>
        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
        <style>
            body {
                font-family: 'Figtree', sans-serif;
                background-color: #f3f4f6;
                color: #1f2937;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 100vh;
                margin: 0;
            }
            .container {
                text-align: center;
                background: white;
                padding: 3rem;
                border-radius: 1rem;
                box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
                max-width: 480px;
                width: 100%;
            }
            h1 {
                margin-top: 0;
                color: #2563eb;
                font-size: 2.25rem;
                margin-bottom: 0.5rem;
            }
            .status {
                display: inline-flex;
                align-items: center;
                background-color: #dcfce7;
                color: #166534;
                padding: 0.25rem 0.75rem;
                border-radius: 9999px;
                font-size: 0.875rem;
                font-weight: 600;
                margin-bottom: 2rem;
            }
            .status::before {
                content: '';
                display: block;
                width: 0.5rem;
                height: 0.5rem;
                background-color: #22c55e;
                border-radius: 50%;
                margin-right: 0.5rem;
            }
            p {
                margin-bottom: 1.5rem;
                line-height: 1.6;
                color: #4b5563;
            }
            .links {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }
            .btn {
                display: inline-block;
                padding: 0.75rem 1.5rem;
                border-radius: 0.5rem;
                text-decoration: none;
                font-weight: 600;
                transition: all 0.2s;
            }
            .btn-primary {
                background-color: #2563eb;
                color: white;
            }
            .btn-primary:hover {
                background-color: #1d4ed8;
            }
            .meta {
                margin-top: 2rem;
                font-size: 0.75rem;
                color: #9ca3af;
            }
        </style>
    </head>
    <body>
        <div class="container">
             <h1>IOLS API</h1>
             <div class="status">System Operational</div>
             
             <p>
                 Welcome to the Incident & Operations Log System API. 
                 This backend provides services for authentication, user management, and incident tracking.
             </p>

             <div class="links">
                 <a href="/docs" class="btn btn-primary">View API Documentation</a>
             </div>

             <div class="meta">
                 Laravel v{{ Illuminate\Foundation\Application::VERSION }} (PHP v{{ PHP_VERSION }})
             </div>
        </div>
    </body>
</html>
