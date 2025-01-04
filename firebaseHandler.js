const admin = require('firebase-admin');

// Initialize Firebase Admin SDK with your service account credentials
const serviceAccount = require('../backend/config/tajurbanew-firebase-adminsdk-yp500-0ceedf588a.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    //databaseURL: 'https://your-project-id.firebaseio.com'
});

async function sendPushNotification(message, registrationToken, title) {
  const payload = { 
    notification: {
      title: title,
      body: message
    }
  };
  try {
  //const mockToken = await generateMockToken();
  const response = await admin.messaging().sendToDevice(registrationToken, payload)
    // .then((response) => {
    //   console.log('Push notification sent:', response);
    //   if (response.results[0].error) {
    //     const errorCode = response.results[0].error.code;
    //     const errorMessage = response.results[0].error.message;
    //     console.log(`Error code: ${errorCode}, Message: ${errorMessage}`);
    //   }
    //   console.log(response, "responsee")
    //   return response;
    // })
    // .catch((error) => {
    //     console.error('Error sending push notification:', error);
    //     return error;
    // });
    if (response && response.results && response.results[0].error) {
        const errorCode = response.results[0].error.code;
        const errorMessage = response.results[0].error.message;
        console.log(`Error code: ${errorCode}, Message: ${errorMessage}`);
      }
  
      return response; // Return the response object
    } catch (error) {
      console.error('Error sending push notification:', error);
      // throw error; // Rethrow the error to handle it in the calling code
    }

}

module.exports = {
    sendPushNotification
};
