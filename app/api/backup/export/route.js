import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'
import { buildBackupPayload, writeBackupFile, pruneBackups, logBackupEvent } from '@/lib/backup-utils'
import { ensureBackupScheduler } from '@/lib/backup-scheduler'

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

    const db = await connectDB()
    const payload = await buildBackupPayload(db, user.schoolId)
    const info = await writeBackupFile(user.schoolId, payload)
    const settings = await db.collection('backup_settings').findOne({ schoolId: user.schoolId })
    const pruned = await pruneBackups(user.schoolId, settings?.maxBackups || 10, settings?.maxBackupDays || 0)
    await logBackupEvent(db, {
      schoolId: user.schoolId,
      userId: user.id,
      userRole: user.role,
      action: 'backup_export',
      details: 'Manual backup created',
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      meta: { collections: payload.meta.collections, pruned }
    })
    if (pruned > 0) {
      await logBackupEvent(db, {
        schoolId: user.schoolId,
        userId: user.id,
        userRole: user.role,
        action: 'backup_retention_prune',
        details: `Removed ${pruned} old backup file(s)`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        meta: { pruned }
      })
    }
    await ensureBackupScheduler()

    return NextResponse.json({ backup: info })
  } catch (error) {
    console.error('Backup export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
