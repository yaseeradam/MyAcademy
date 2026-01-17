const webpush = require('web-push')
const { MongoClient } = require('mongodb')

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY

let vapidConfigured = false

function ensureVapidConfigured() {
  if (vapidConfigured) return true
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false
  webpush.setVapidDetails('mailto:admin@myacademy.local', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
  vapidConfigured = true
  return true
}

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return { db: client.db(DB_NAME), client }
}

async function sendPushToUser(userId, schoolId, payload, dbOverride = null) {
  if (!ensureVapidConfigured()) return
  const connection = dbOverride ? { db: dbOverride, client: null } : await connectToDatabase()
  const db = connection.db
  try {
    const preferences = await db.collection('notification_preferences').findOne({
      userId,
      schoolId
    })
    if (preferences && preferences.push === false) return

    const subscriptions = await db.collection('push_subscriptions').find({
      userId,
      schoolId
    }).toArray()

    const payloadString = JSON.stringify(payload)
    for (const sub of subscriptions) {
      try {
        await webpush.sendNotification(sub.subscription, payloadString)
      } catch (error) {
        const statusCode = error?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          await db.collection('push_subscriptions').deleteOne({ _id: sub._id })
        } else {
          console.error('Push send failed:', error)
        }
      }
    }
  } finally {
    if (!dbOverride && connection.client) {
      await connection.client.close()
    }
  }
}

module.exports = {
  sendPushToUser
}
