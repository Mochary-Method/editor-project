import admin from 'firebase-admin'
import { getFirestore } from 'firebase-admin/firestore'

import serviceAccount from './serviceAccountKey.json'

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

export default getFirestore()