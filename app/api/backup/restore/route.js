import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'
import { readBackupFile, restoreBackupPayload, logBackupEvent } from '@/lib/backup-utils'

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

export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contentType = request.headers.get('content-type') || ''
    let payload = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('file')
      if (!file) {
        return NextResponse.json({ error: 'No file provided' }, { status: 400 })
      }
      const bytes = await file.arrayBuffer()
      payload = JSON.parse(Buffer.from(bytes).toString('utf8'))
    } else {
      const body = await request.json()
      if (body?.fileName) {
        payload = await readBackupFile(user.schoolId, body.fileName)
      } else if (body?.data) {
        payload = body.data
      }
    }

    if (!payload || payload?.meta?.schoolId !== user.schoolId) {
      return NextResponse.json({ error: 'Invalid backup payload' }, { status: 400 })
    }

    const db = await connectDB()
    await restoreBackupPayload(db, user.schoolId, payload)
    await logBackupEvent(db, {
      schoolId: user.schoolId,
      userId: user.id,
      userRole: user.role,
      action: 'backup_restore',
      details: 'Backup restored',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      meta: { source: payload?.meta?.createdAt || 'unknown' }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Backup restore error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
