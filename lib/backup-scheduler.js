import { MongoClient } from 'mongodb'
import { buildBackupPayload, writeBackupFile, pruneBackups, logBackupEvent } from '@/lib/backup-utils'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const CHECK_INTERVAL_MS = 5 * 60 * 1000

let schedulerStarted = false
let cachedDb = null

async function connectDB() {
  if (cachedDb) return cachedDb
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  cachedDb = client.db(DB_NAME)
  return cachedDb
}

async function runScheduledBackups() {
  const db = await connectDB()
  const settings = await db.collection('backup_settings')
    .find({ enabled: true })
    .toArray()

  const now = new Date()

  for (const setting of settings) {
    if (!setting.schoolId) continue
    const nextRun = setting.nextRun ? new Date(setting.nextRun) : null
    if (nextRun && nextRun > now) continue

    const payload = await buildBackupPayload(db, setting.schoolId)
    await writeBackupFile(setting.schoolId, payload)
    const pruned = await pruneBackups(setting.schoolId, setting.maxBackups || 10, setting.maxBackupDays || 0)
    await logBackupEvent(db, {
      schoolId: setting.schoolId,
      action: 'backup_auto_run',
      details: 'Automatic backup created',
      meta: { collections: payload.meta.collections, pruned }
    })
    if (pruned > 0) {
      await logBackupEvent(db, {
        schoolId: setting.schoolId,
        action: 'backup_retention_prune',
        details: `Removed ${pruned} old backup file(s)`,
        meta: { pruned }
      })
    }

    const intervalHours = Math.max(1, Number(setting.intervalHours || 24))
    const next = new Date()
    next.setHours(next.getHours() + intervalHours)

    await db.collection('backup_settings').updateOne(
      { schoolId: setting.schoolId },
      {
        $set: {
          lastRun: new Date().toISOString(),
          nextRun: next.toISOString()
        }
      }
    )
  }
}

export async function ensureBackupScheduler() {
  if (schedulerStarted) return
  schedulerStarted = true

  setInterval(() => {
    runScheduledBackups().catch((error) => {
      console.error('Scheduled backup error:', error)
    })
  }, CHECK_INTERVAL_MS)
}
