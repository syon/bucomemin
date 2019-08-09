const admin = require('firebase-admin')
const serviceAccount = require('./.secret/serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://lobine-a91c5.firebaseio.com'
})

const db = admin.firestore()
const storage = admin.storage()

module.exports = { db, storage }
