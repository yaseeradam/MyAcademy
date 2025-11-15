import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

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

export async function DELETE(request, { params }) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = params
    const db = await connect()
    const message = await db.collection('chat_messages').findOne({ id, schoolId: user.schoolId })
    if (!message) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (message.senderId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    await db.collection('chat_messages').deleteOne({ id })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}