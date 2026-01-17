import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
const { sendPushToUser } = require('@/lib/push')
const { emitToUser } = require('@/lib/socket-server')

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

export async function POST(request) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()
    const { title, message, targetAudience = [], priority = 'medium' } = body
    if (!title || !message || !Array.isArray(targetAudience) || targetAudience.length === 0) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const db = await connect()
    let targetUsers = []

    if (targetAudience.includes('all')) {
      const users = await db.collection('users').find({
        schoolId: user.schoolId,
        active: true
      }).project({ id: 1 }).toArray()
      targetUsers = users.map(u => u.id)
    } else {
      const queries = []

      if (targetAudience.includes('teachers')) {
        queries.push({ role: 'teacher' })
      }
      if (targetAudience.includes('parents')) {
        queries.push({ role: 'parent' })
      }
      if (targetAudience.includes('students')) {
        const students = await db.collection('students').find({
          schoolId: user.schoolId,
          active: true
        }).project({ parentId: 1 }).toArray()
        const parentIds = [...new Set(students.map(s => s.parentId).filter(Boolean))]
        if (parentIds.length) {
          queries.push({ id: { $in: parentIds } })
        }
      }

      if (queries.length > 0) {
        const users = await db.collection('users').find({
          schoolId: user.schoolId,
          active: true,
          $or: queries
        }).project({ id: 1 }).toArray()
        targetUsers = users.map(u => u.id)
      }
    }

    const uniqueTargets = [...new Set(targetUsers)]
    const notifications = uniqueTargets.map(userId => ({
      id: uuidv4(),
      schoolId: user.schoolId,
      recipientId: userId,
      senderId: user.id,
      title,
      message,
      type: 'announcement',
      priority,
      read: false,
      metadata: { broadcast: true, targetAudience },
      createdAt: new Date().toISOString()
    }))

    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications)
      for (const notification of notifications) {
        emitToUser(notification.recipientId, 'notification', notification)
        await sendPushToUser(
          notification.recipientId,
          user.schoolId,
          {
            title: notification.title,
            body: notification.message,
            url: '/?openNotifications=1'
          },
          db
        )
      }
    }

    return NextResponse.json({ success: true, count: notifications.length })
  } catch (error) {
    console.error('Broadcast notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
