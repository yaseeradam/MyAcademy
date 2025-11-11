import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import crypto from 'crypto'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { paymentId, schoolId, parentName, amount, paymentType, studentName } = body

    const db = await connectToDatabase()

    const schoolAdmins = await db.collection('users')
      .find({ role: 'school_admin', schoolId, active: true })
      .toArray()

    const notifications = schoolAdmins.map(admin => ({
      id: crypto.randomUUID(),
      recipientId: admin.id,
      schoolId,
      title: 'Payment Received',
      message: `${parentName} has made a payment of ₦${amount.toLocaleString()} for ${studentName || 'school fees'} (${paymentType})`,
      type: 'payment_received',
      priority: 'high',
      read: false,
      metadata: { paymentId, parentName, amount, paymentType, studentName },
      createdAt: new Date().toISOString()
    }))

    if (notifications.length > 0) {
      await db.collection('notifications').insertMany(notifications)
    }

    return NextResponse.json({ success: true, notificationsSent: notifications.length })

  } catch (error) {
    console.error('Error sending payment notification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}