import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

import serviceAccount from '../../firebase/serviceAccountKey.json';

initializeApp({
    credential: cert(serviceAccount as ServiceAccount),
});

export const db = getFirestore();