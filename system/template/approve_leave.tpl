<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f9f9f9;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      overflow: hidden;
    }
    .header {
      background-color: #0073e6;
      color: #ffffff;
      padding: 20px;
      text-align: center;
      font-size: 22px;
      font-weight: bold;
    }
    .content {
      padding: 20px 30px;
      color: #333333;
      line-height: 1.8;
    }
    .content h2 {
      color: #0073e6;
      font-size: 18px;
      margin: 0 0 15px;
    }
    .content p {
      margin: 15px 0;
    }
    .details-table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }
    .details-table th, .details-table td {
      text-align: left;
      padding: 8px 10px;
      border: 1px solid #e0e0e0;
    }
    .details-table th {
      background-color: #f4f4f4;
      font-weight: bold;
    }
    .footer {
      background-color: #f9f9f9;
      padding: 20px;
      text-align: center;
      font-size: 14px;
      color: #777777;
    }
    .footer a {
      color: #0073e6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="header">
      Leave Application Status
    </div>
    <div class="content">
      <h2>Dear ${user_name},</h2>
      <p>
        We would like to inform you that your leave application has been <strong>${status}</strong>.
      </p>
      <table class="details-table">
        <tr>
          <th>Details</th>
          <th>Value</th>
        </tr>
        <tr>
          <td>From Date</td>
          <td>${from_date}</td>
        </tr>
        <tr>
          <td>To Date</td>
          <td>${to_date}</td>
        </tr>
        <tr>
          <td>Reason</td>
          <td>${leave_reason}</td>
        </tr>
        <tr>
          <td>Leave Code</td>
          <td>${leave_code}</td>
        </tr>
      </table>
      <p>
        If you have any questions or require further clarification, please feel free to reach out to your reporting manager or the HR department.
      </p>
      <p>
        Best regards,<br>
        The HR Team
      </p>
    </div>
     
  </div>
</body>
</html>
