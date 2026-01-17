import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

let cachedDb = null

async function connectDB() {
  if (cachedDb) return cachedDb
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  cachedDb = client.db(DB_NAME)
  return cachedDb
}

function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null
    const token = authHeader.slice(7)
    return jwt.verify(token, JWT_SECRET)
  } catch {
    return null
  }
}

export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(50, Math.max(5, Number(searchParams.get('limit') || 20)))

    const db = await connectDB()
    const logs = await db.collection('audit_logs')
      .find({ schoolId: user.schoolId, action: { $regex: '^backup_' } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Backup logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
