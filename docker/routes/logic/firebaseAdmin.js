const admin = require('firebase-admin')
const serviceAccount = require('../../.secret/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://bmin-faf7e.firebaseio.com'
})

const db = admin.firestore()
const storage = admin.storage()

module.exports = { db, storage }
