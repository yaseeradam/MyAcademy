import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'
import { ensureBackupScheduler } from '@/lib/backup-scheduler'
import { logBackupEvent, getRetentionPreview } from '@/lib/backup-utils'

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

    const db = await connectDB()
    const setting = await db.collection('backup_settings').findOne({ schoolId: user.schoolId })
    const preview = await getRetentionPreview(user.schoolId, setting?.maxBackups || 10, setting?.maxBackupDays || 0)

    return NextResponse.json({
      enabled: setting?.enabled || false,
      intervalHours: setting?.intervalHours || 24,
      maxBackups: setting?.maxBackups || 10,
      maxBackupDays: setting?.maxBackupDays || 0,
      lastRun: setting?.lastRun || null,
      nextRun: setting?.nextRun || null,
      preview
    })
  } catch (error) {
    console.error('Backup schedule fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const enabled = Boolean(body?.enabled)
    const intervalHours = Math.max(1, Number(body?.intervalHours || 24))
    const maxBackups = Math.max(1, Number(body?.maxBackups || 10))
    const maxBackupDays = Math.max(0, Number(body?.maxBackupDays || 0))

    const nextRun = new Date()
    nextRun.setHours(nextRun.getHours() + intervalHours)

    const db = await connectDB()
    await db.collection('backup_settings').updateOne(
      { schoolId: user.schoolId },
      {
        $set: {
          enabled,
          intervalHours,
          maxBackups,
          maxBackupDays,
          nextRun: nextRun.toISOString()
        },
        $setOnInsert: {
          schoolId: user.schoolId,
          createdAt: new Date().toISOString()
        }
      },
      { upsert: true }
    )

    await logBackupEvent(db, {
      schoolId: user.schoolId,
      userId: user.id,
      userRole: user.role,
      action: 'backup_schedule_update',
      details: `Schedule ${enabled ? 'enabled' : 'disabled'} · every ${intervalHours} hour(s) · keep ${maxBackups} backups · ${maxBackupDays ? `${maxBackupDays} day retention` : 'no day limit'}`,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      meta: { enabled, intervalHours, maxBackups, maxBackupDays }
    })

    const preview = await getRetentionPreview(user.schoolId, maxBackups, maxBackupDays)
    await ensureBackupScheduler()

    return NextResponse.json({
      enabled,
      intervalHours,
      maxBackups,
      maxBackupDays,
      nextRun: nextRun.toISOString(),
      preview
    })
  } catch (error) {
    console.error('Backup schedule update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
