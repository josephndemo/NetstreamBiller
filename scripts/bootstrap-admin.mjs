import { applicationDefault, cert, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const email = process.argv[2];
if (!email) throw new Error('Usage: npm run bootstrap-admin -- admin@example.com');

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  : null;

initializeApp({ credential: serviceAccount ? cert(serviceAccount) : applicationDefault() });

const user = await getAuth().getUserByEmail(email);
await getAuth().setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: true });
await getFirestore().collection('users').doc(user.uid).set({ role: 'admin', updatedAt: new Date() }, { merge: true });
console.log(`${email} is now an administrator. They must sign out and back in to receive the new access token.`);
