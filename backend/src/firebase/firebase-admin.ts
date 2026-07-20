import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { join } from 'path';

const serviceAccount = require(join(
  process.cwd(),
  'firebase',
  'serviceAccountKey.json',
));

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

export { db };