<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Tajurba</title>
	<style>
        /* Define the style for the button */
        #changePasswordBtn {
        	background: #0000 linear-gradient(180deg, #36dae9, #0090ff) 0 0 no-repeat padding-box;
		
        }
    </style>
  </head>
  
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif;">

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td style="padding: 30px 0; text-align: center;">
                <h2 style="color: #16ADA7;">Event Reminder</h2>
            </td>
        </tr>
        <tr>
            <td style="padding: 0 30px;">
                <p>Dear ${RecipientName},</p>
                <p>Just a friendly reminder about the upcoming event you've registered for:</p>
                <ul>
                    <li><strong>Event Booking ID:</strong> ${EventBookingId}</li>
                    <li><strong>Event Name:</strong> ${EventName}</li>
                    <li><strong>Date:</strong> ${EventDate}</li>
                    <li><strong>Event Type:</strong> ${EventType}</li>
                </ul>
                <p>We look forward to seeing you there!</p>
                <p><a href="${joiningLink}"><button id="changePasswordBtn">Click here to join</button></a></p>
                <p style="color:#555555; margin-bottom: 0px; margin-top: 30px;">Best regards,</p>
				<p style="color:#555555; margin-top: 0px; margin-bottom: 0px;">Tajurba</p>
            </td>
        </tr>
    </table>

</body>
</html>