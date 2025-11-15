import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'

async function connect() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

function verify(request) {
  try {
    const auth = request.headers.get('authorization')
    if (!auth || !auth.startsWith('Bearer ')) return null
    const token = auth.slice(7)
    const secret = process.env.JWT_SECRET
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

export async function GET(request) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const db = await connect()
    const conversations = await db.collection('chat_conversations').find({
      schoolId: user.schoolId,
      participants: user.id
    }).sort({ lastMessageAt: -1 }).toArray()
    const unreadCounts = await Promise.all(conversations.map(async (c) => {
      const count = await db.collection('chat_messages').countDocuments({
        conversationId: c.id,
        schoolId: user.schoolId,
        senderId: { $ne: user.id },
        readBy: { $nin: [user.id] }
      })
      return { id: c.id, count }
    }))
    const byId = new Map(unreadCounts.map(x => [x.id, x.count]))
    const result = conversations.map(c => ({ ...c, unreadCount: byId.get(c.id) || 0 }))
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { type, name, participants = [], initialMessage } = body
    const db = await connect()
    let conv
    if (type === 'private') {
      const otherId = participants[0]
      if (!otherId) return NextResponse.json({ error: 'Target user required' }, { status: 400 })
      const existing = await db.collection('chat_conversations').findOne({
        schoolId: user.schoolId,
        type: 'private',
        participants: { $all: [user.id, otherId] }
      })
      if (existing) return NextResponse.json(existing)
      conv = {
        id: uuidv4(),
        schoolId: user.schoolId,
        type: 'private',
        name: null,
        participants: [user.id, otherId],
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString()
      }
    } else if (type === 'group') {
      if (!name || !Array.isArray(participants) || participants.length === 0) {
        return NextResponse.json({ error: 'Invalid group data' }, { status: 400 })
      }
      const unique = Array.from(new Set([user.id, ...participants]))
      conv = {
        id: uuidv4(),
        schoolId: user.schoolId,
        type: 'group',
        name,
        participants: unique,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString()
      }
    } else {
      return NextResponse.json({ error: 'Invalid conversation type' }, { status: 400 })
    }
    await db.collection('chat_conversations').insertOne(conv)
    const { emitToUser } = require('@/lib/socket-server')
    for (const pid of conv.participants) {
      if (pid !== user.id) {
        emitToUser(pid, 'new_conversation', conv)
      }
    }
    if (initialMessage && type === 'private') {
      const message = {
        id: uuidv4(),
        conversationId: conv.id,
        schoolId: user.schoolId,
        senderId: user.id,
        senderName: user.name,
        messageType: 'text',
        content: initialMessage,
        readBy: [user.id],
        createdAt: new Date().toISOString()
      }
      await db.collection('chat_messages').insertOne(message)
      await db.collection('chat_conversations').updateOne({ id: conv.id }, { $set: { lastMessageAt: new Date().toISOString(), lastMessage: message } })
      const { emitToConversation } = require('@/lib/socket-server')
      emitToConversation(conv.id, 'new_message', message)
    }
    return NextResponse.json(conv)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
