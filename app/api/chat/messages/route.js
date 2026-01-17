import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
const { buildCacheKey, getCache, setCache, shouldBypassCache, clearCache } = require('@/lib/api-cache')

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function GET(request) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    const limitParam = searchParams.get('limit')
    if (!conversationId) return NextResponse.json({ error: 'conversationId required' }, { status: 400 })
    const limit = limitParam ? parseInt(limitParam, 10) : 100
    const db = await connect()
    const messages = await db.collection('chat_messages').find({
      conversationId,
      schoolId: user.schoolId
    }).sort({ createdAt: 1 }).limit(limit).toArray()
    return NextResponse.json(messages)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    clearCache()
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const { conversationId, messageType, content, fileUrl, fileName, fileSize, replyTo, clientTempId } = body
    if (!conversationId || (!content && !fileUrl)) return NextResponse.json({ error: 'Invalid message data' }, { status: 400 })
    const db = await connect()
    const conv = await db.collection('chat_conversations').findOne({ id: conversationId, schoolId: user.schoolId, participants: user.id })
    if (!conv) return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 })
    const message = {
      id: uuidv4(),
      conversationId,
      schoolId: user.schoolId,
      senderId: user.id,
      senderName: user.name,
      messageType: messageType || 'text',
      content: content || fileUrl,
      fileUrl,
      fileName,
      fileSize,
      replyTo,
      readBy: [user.id],
      clientTempId,
      createdAt: new Date().toISOString()
    }
    await db.collection('chat_messages').insertOne(message)
    const lastMessageAt = new Date().toISOString()
    await db.collection('chat_conversations').updateOne(
      { id: conversationId },
      { $set: { lastMessageAt, lastMessage: message } }
    )
    const updatedConversation = { ...conv, lastMessageAt, lastMessage: message }
    const { emitToConversation, emitToUser } = require('@/lib/socket-server')
    emitToConversation(conversationId, 'new_message', message)
    if (Array.isArray(conv.participants)) {
      for (const participantId of conv.participants) {
        emitToUser(participantId, 'conversation_updated', updatedConversation)
      }
    }
    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
