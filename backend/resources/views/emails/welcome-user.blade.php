<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{ $appName }}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .header h1 {
            color: #2563eb;
            margin: 0;
        }
        .credentials {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            padding: 20px;
            margin: 20px 0;
        }
        .credentials-item {
            margin: 10px 0;
        }
        .credentials-label {
            font-weight: bold;
            color: #64748b;
        }
        .credentials-value {
            font-family: monospace;
            font-size: 16px;
            color: #1e293b;
            background-color: #e2e8f0;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .button {
            display: inline-block;
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: bold;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #1d4ed8;
        }
        .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            color: #92400e;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #64748b;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to {{ $appName }}</h1>
        </div>

        <p>Hello <strong>{{ $name }}</strong>,</p>

        <p>Your account has been created in the {{ $appName }}. You have been assigned the role of <strong>{{ $role }}</strong>.</p>

        <p>Here are your login credentials:</p>

        <div class="credentials">
            <div class="credentials-item">
                <span class="credentials-label">Email:</span>
                <span class="credentials-value">{{ $email }}</span>
            </div>
            <div class="credentials-item">
                <span class="credentials-label">Password:</span>
                <span class="credentials-value">{{ $password }}</span>
            </div>
        </div>

        <div class="warning">
            <strong>⚠️ Important:</strong> For security reasons, you will be required to change your password when you first log in.
        </div>

        <p style="text-align: center;">
            <a href="{{ $loginUrl }}" class="button">Login to Your Account</a>
        </p>

        <p>If you have any questions or need assistance, please contact the system administrator.</p>

        <div class="footer">
            <p>This is an automated message from {{ $appName }}.</p>
            <p>Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>
