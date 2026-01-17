import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function connect() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return { db: client.db(DB_NAME), client }
}

function verify(request) {
  try {
    const auth = request.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) return null
    const token = auth.slice(7)
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function POST(request) {
  let client
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { subscription } = body
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
    }

    const connection = await connect()
    client = connection.client
    const db = connection.db

    await db.collection('push_subscriptions').updateOne(
      { endpoint: subscription.endpoint, userId: user.id, schoolId: user.schoolId },
      {
        $set: {
          subscription,
          userId: user.id,
          schoolId: user.schoolId,
          role: user.role,
          updatedAt: new Date().toISOString()
        },
        $setOnInsert: { createdAt: new Date().toISOString() }
      },
      { upsert: true }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push subscribe error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  } finally {
    if (client) await client.close()
  }
}
