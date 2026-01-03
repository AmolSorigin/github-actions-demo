# FCM Push Notification Test Page

This page allows you to:

1. Get FCM token from your web browser
2. Display the token on the UI
3. Send push notifications using the SNS API

## Setup Instructions

### 1. Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings → Your apps → Add app (Web app)
4. Copy the Firebase configuration object (looks like this):

```json
{
  "apiKey": "AIza...",
  "authDomain": "your-project.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project.appspot.com",
  "messagingSenderId": "123456789",
  "appId": "1:123456789:web:abcdef",
  "vapidKey": "BK..."
}
```

5. Go to Project Settings → Cloud Messaging → Web Push certificates
6. Generate a new key pair or copy the existing VAPID key
7. Add the `vapidKey` to your Firebase config JSON

### 2. AWS SNS Configuration

For web push notifications with AWS SNS, you have two options:

#### Option A: Use FCM Platform Application (if supported)

- Create an FCM Platform Application in AWS SNS
- Upload your FCM Server Key from Firebase Console
- Use the Platform Application ARN in the test page

#### Option B: Use Web Push Platform Application (Recommended for web)

- Create a Web Push Platform Application in AWS SNS
- You'll need to upload your VAPID key pair
- Use the Platform Application ARN in the test page

**Note:** The current SNS implementation might be optimized for mobile FCM. For web browsers, you may need to ensure your AWS SNS Platform Application supports web push tokens.

### 3. Service Worker Setup

The service worker file (`firebase-messaging-sw.js`) is required for receiving background notifications. Update it with your Firebase config if needed, or the page will use the config you provide.

### 4. Usage

1. Start your server: `npm run dev` or `npm start`
2. Open your browser and go to: `http://localhost:3000`
3. Paste your Firebase configuration JSON
4. Click "Initialize Firebase"
5. Click "Get FCM Token" (browser will ask for notification permission)
6. Copy the displayed FCM token
7. Enter your AWS SNS Platform Application ARN
8. Enter your notification message and optional fields
9. Click "Send Push Notification"

### Important Notes

- **HTTPS Required for Production:** Web push notifications require HTTPS (except for localhost)
- **Service Worker:** The service worker must be served from the root or same origin
- **Browser Support:** Modern browsers support FCM web push (Chrome, Firefox, Edge, Safari)
- **Permissions:** Users must grant notification permissions

### Troubleshooting

- **Token not generated:** Check browser console for errors, ensure Firebase config is correct
- **Notifications not received:** Verify Platform Application ARN matches your AWS SNS setup
- **Service Worker errors:** Ensure firebase-messaging-sw.js is accessible at the root
