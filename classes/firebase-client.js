import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import 'firebase/storage'

const config = {
  apiKey: process.env.FIREBASE_CLIENT_API_KEY,
  authDomain: process.env.FIREBASE_CLIENT_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_CLIENT_DATABASE_URL,
  messagingSenderId: process.env.FIREBASE_CLIENT_MESSAGING_SENDER_ID,
  projectId: process.env.FIREBASE_CLIENT_PROJECT_ID,
  storageBucket: process.env.FIREBASE_CLIENT_STORAGE_BUCKET
}

console.log('|||||||| firebase-client ||||||||')
console.log(config)
console.log('|||||||||||||||||||||||||||||||||')

const app = !firebase.apps.length
  ? firebase.initializeApp(config)
  : firebase.app()

export default app
export const Auth = firebase.auth()
export const db = firebase.firestore()
