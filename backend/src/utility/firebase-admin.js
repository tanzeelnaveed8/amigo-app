const admin = require('firebase-admin');
const { getMessaging } = require('firebase-admin/messaging');
    
let firebaseAdmin = null;

try {
  // Check if we have a service account key file
  const serviceAccount = require('../../amigo-a5a7b-firebase-adminsdk-fbsvc-ec6e5183ca.json');
  
  firebaseAdmin = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // You can also specify your project ID here if needed
    // projectId: 'your-project-id'
  });
  
  console.log('Firebase Admin SDK initialized successfully');
} catch (error) {
  console.log('Firebase Admin SDK not configured:', error.message);
  console.log('To enable Firebase Admin SDK:');
  console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.log('2. Generate new private key');
  console.log('3. Save as firebase-service-account.json in backend root');
}
const messaging = firebaseAdmin ? getMessaging(firebaseAdmin) : null;

module.exports = { firebaseAdmin, messaging };
