import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

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

export async function DELETE(request, { params }) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = params
    const db = await connect()
    const conv = await db.collection('chat_conversations').findOne({ id, schoolId: user.schoolId })
    if (!conv) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (!conv.participants?.includes(user.id)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await db.collection('chat_messages').deleteMany({ conversationId: id, schoolId: user.schoolId })
    await db.collection('chat_conversations').deleteOne({ id })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
