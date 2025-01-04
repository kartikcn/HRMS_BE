<!doctype html>
<html lang="en">
  <head>
    <!-- Required meta tags -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>TSM</title>
	<style>
        /* Define the style for the button */
        #changePasswordBtn {
        	background: transparent linear-gradient(180deg, #36dae9 0%, #0090ff 100%) 0% 0% no-repeat padding-box;
			border-radius: 5px;
		
        }
    </style>
  </head>
  
  <body class="m0">
		<div style="max-width:500px; margin:auto; font-family: Arial !important; padding:30px; border:3px solid #16ADA7; border-top:8px solid #16ADA7; border-radius:0px 0px 10px 10px; font-family:roboto; text-align:left; box-shadow: 0 1.2em 2rem rgba(0,0,0,.05) !important;">
				<p style="margin-top: 0px;">
					Dear ${first_name},
				</p>
				<p style="color:#555555;">
					Thank you for registering with TSM HRMS. We are thrilled to have you onboard as a valued member of our community!
				</p>
				<p style="color:#555555;">
					Kindly click on the below button to change your password. Once you change your password, you will be able to login to the system 
				</p>
				<p><a href="${server_url}"><button id="changePasswordBtn" > Change password</button></a></p>
				<p style="color:#555555;">Thank you for choosing Stackmentalist. We look forward to serving you.</p>
				<p style="color:#555555; margin-bottom: 0px; margin-top: 30px;">Best regards,</p>
				<p style="color:#555555; margin-top: 0px; margin-bottom: 0px;">Team Stackmentalist</p>
		</div>
  </body>
</html>