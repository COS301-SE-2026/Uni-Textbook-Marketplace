import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY as string,
) as ServiceAccount;

initializeApp({
    credential: cert(serviceAccount),
});

export const db = getFirestore();