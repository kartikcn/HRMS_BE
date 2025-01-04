<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Leave Application</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
            border: 1px solid #ddd;
            border-radius: 5px;
        }
        .header {
            text-align: center;
            padding: 10px;
            background-color: #4CAF50;
            color: #ffffff;
            border-radius: 5px 5px 0 0;
        }
        .header h1 {
            margin: 0;
        }
        .content {
            padding: 20px;
        }
        .content h2 {
            color: #4CAF50;
        }
        .content p {
            margin: 10px 0;
        }
        .footer {
            text-align: center;
            padding: 10px;
            font-size: 12px;
            color: #666;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Leave Application</h1>
        </div>
        <div class="content">
            <h2>Hello, ${reporting_manager_name}</h2>
            <p>Employee <strong>${employee_name}</strong> has submitted a leave application. Here are the details:</p>
            <p><strong>Leave Code:</strong> ${leave_code}</p>
            <p><strong>Leave Dates:</strong> From ${from_date} to ${to_date}</p>
            <p><strong>Leave Reason:</strong> ${leave_reason}</p>
           
            <p>Please review the application and take appropriate action.</p>
            <p>Best regards,</p>
            <p><strong>Your HRMS Team</strong></p>
        </div>
         
    </div>
</body>
</html>
