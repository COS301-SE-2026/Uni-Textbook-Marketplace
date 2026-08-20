import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

if (!serviceAccountKey) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not configured');
}

const serviceAccount = JSON.parse(serviceAccountKey) as ServiceAccount;

initializeApp({
  credential: cert(serviceAccount),
});

export const db = getFirestore();
