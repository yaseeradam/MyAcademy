import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { searchParams } = new URL(request.url)
    const conversationId = searchParams.get('conversationId')
    
    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 })
    }

    const db = await connectDB()
    
    const messages = await db.collection('messages')
      .find({
        schoolId: decoded.schoolId,
        conversationId
      })
      .sort({ createdAt: 1 })
      .toArray()

    return NextResponse.json(messages)
  } catch (error) {
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
    
    const message = {
      id: `msg_${Date.now()}`,
      schoolId: decoded.schoolId,
      conversationId: body.conversationId,
      senderId: decoded.userId,
      senderName: decoded.name,
      messageType: body.messageType || 'text',
      content: body.content,
      createdAt: new Date().toISOString(),
      read: false,
      readBy: []
    }

    await db.collection('messages').insertOne(message)
    
    // Update conversation last message time
    await db.collection('conversations').updateOne(
      { id: body.conversationId },
      { $set: { lastMessageAt: message.createdAt } }
    )

    return NextResponse.json(message)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
