import { setGlobalOptions } from 'firebase-functions/v2';
import { onUserCreated } from 'firebase-functions/v2/identity';
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

initializeApp();
setGlobalOptions({ region: 'us-central1', maxInstances: 10 });

const db = getFirestore();

export const createUserProfile = onUserCreated(async (event) => {
  const user = event.data;
  await db.collection('users').doc(user.uid).set({
    displayName: user.displayName || '',
    email: user.email || '',
    photoURL: user.photoURL || '',
    role: 'user',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
});

export const setUserRole = onCall(async (request) => {
  if (!request.auth?.token.admin) {
    throw new HttpsError('permission-denied', 'Administrator access is required.');
  }

  const { uid, role } = request.data || {};
  if (typeof uid !== 'string' || !['admin', 'user'].includes(role)) {
    throw new HttpsError('invalid-argument', 'A user ID and a valid role are required.');
  }

  const account = await getAuth().getUser(uid);
  const claims = { ...(account.customClaims || {}) };
  if (role === 'admin') claims.admin = true;
  else delete claims.admin;

  await getAuth().setCustomUserClaims(uid, claims);
  await db.collection('users').doc(uid).update({ role, updatedAt: FieldValue.serverTimestamp() });
  return { uid, role };
});
