import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

const client = new MongoClient(process.env.MONGO_URL)
let cachedDb = null

async function connectDB() {
  if (cachedDb) return cachedDb
  await client.connect()
  cachedDb = client.db(process.env.DB_NAME || 'school_management')
  return cachedDb
}

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const db = await connectDB()
    
    const conversations = await db.collection('chat_conversations')
      .find({
        schoolId: decoded.schoolId,
        participants: decoded.id
      })
      .sort({ lastMessageAt: -1 })
      .toArray()

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const body = await request.json()
    const db = await connectDB()
    
    const conversation = {
      id: `conv_${Date.now()}`,
      schoolId: decoded.schoolId,
      type: body.type || 'private',
      name: body.name || null,
      participants: [decoded.id, ...(body.participants || [])],
      createdBy: decoded.id,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0
    }

    await db.collection('chat_conversations').insertOne(conversation)
    return NextResponse.json(conversation)
  } catch (error) {
    console.error('Conversations POST error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
