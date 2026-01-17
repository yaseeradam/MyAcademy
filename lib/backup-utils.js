import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const BASE_BACKUP_DIR = path.join(process.cwd(), 'backups')

function getSchoolDir(schoolId) {
  return path.join(BASE_BACKUP_DIR, schoolId)
}

export async function ensureBackupDir(schoolId) {
  await fs.mkdir(getSchoolDir(schoolId), { recursive: true })
}

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '')
}

function getCollectionFilter(name, sampleDoc, schoolId) {
  if (name === 'schools') return { id: schoolId }
  if (name === 'users') return { schoolId }
  if (sampleDoc && Object.prototype.hasOwnProperty.call(sampleDoc, 'schoolId')) {
    return { schoolId }
  }
  return null
}

export async function listBackupCollections(db, schoolId) {
  const collections = await db.listCollections().toArray()
  const eligible = []

  for (const collection of collections) {
    const name = collection.name
    if (name.startsWith('system.')) continue
    const sampleDoc = await db.collection(name).findOne()
    const filter = getCollectionFilter(name, sampleDoc, schoolId)
    if (filter) eligible.push(name)
  }

  return eligible.sort()
}

export async function buildBackupPayload(db, schoolId) {
  const collections = await listBackupCollections(db, schoolId)
  const data = {}

  for (const name of collections) {
    const sampleDoc = await db.collection(name).findOne()
    const filter = getCollectionFilter(name, sampleDoc, schoolId)
    if (!filter) continue
    const docs = await db.collection(name).find(filter).toArray()
    if (docs.length) {
      data[name] = docs
    }
  }

  return {
    meta: {
      schoolId,
      createdAt: new Date().toISOString(),
      collections: Object.keys(data).length
    },
    data
  }
}

export async function writeBackupFile(schoolId, payload) {
  await ensureBackupDir(schoolId)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const fileName = sanitizeFileName(`backup_${schoolId}_${stamp}.json`)
  const filePath = path.join(getSchoolDir(schoolId), fileName)
  await fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')
  const stats = await fs.stat(filePath)
  return { fileName, size: stats.size, createdAt: stats.birthtime?.toISOString?.() || payload.meta.createdAt }
}

export async function listBackupFiles(schoolId) {
  await ensureBackupDir(schoolId)
  const dir = getSchoolDir(schoolId)
  const files = await fs.readdir(dir)
  const backups = []

  for (const file of files) {
    if (!file.endsWith('.json')) continue
    const stats = await fs.stat(path.join(dir, file))
    backups.push({
      fileName: file,
      size: stats.size,
      createdAt: stats.birthtime?.toISOString?.() || stats.ctime?.toISOString?.()
    })
  }

  return backups.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
}

export async function pruneBackups(schoolId, maxBackups = 10, maxBackupDays = 0) {
  if ((!maxBackups || maxBackups < 1) && (!maxBackupDays || maxBackupDays < 1)) return 0
  const backups = await listBackupFiles(schoolId)
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  const byAge = maxBackupDays && maxBackupDays > 0
    ? backups.filter((backup) => {
        const createdAt = backup.createdAt ? Date.parse(backup.createdAt) : 0
        return createdAt > 0 && now - createdAt > maxBackupDays * dayMs
      })
    : []

  const remaining = backups.filter((backup) => !byAge.includes(backup))
  const byCount = maxBackups && maxBackups > 0 && remaining.length > maxBackups
    ? remaining.slice(maxBackups)
    : []

  const toDelete = [...byAge, ...byCount]
  for (const backup of toDelete) {
    const filePath = path.join(getSchoolDir(schoolId), backup.fileName)
    await fs.unlink(filePath)
  }
  return toDelete.length
}

export async function getRetentionPreview(schoolId, maxBackups = 10, maxBackupDays = 0) {
  if ((!maxBackups || maxBackups < 1) && (!maxBackupDays || maxBackupDays < 1)) {
    return { total: 0, byAge: 0, byCount: 0, toDelete: 0 }
  }
  const backups = await listBackupFiles(schoolId)
  const now = Date.now()
  const dayMs = 24 * 60 * 60 * 1000

  const byAge = maxBackupDays && maxBackupDays > 0
    ? backups.filter((backup) => {
        const createdAt = backup.createdAt ? Date.parse(backup.createdAt) : 0
        return createdAt > 0 && now - createdAt > maxBackupDays * dayMs
      })
    : []

  const remaining = backups.filter((backup) => !byAge.includes(backup))
  const byCount = maxBackups && maxBackups > 0 && remaining.length > maxBackups
    ? remaining.slice(maxBackups)
    : []

  const toDelete = [...byAge, ...byCount]

  return {
    total: backups.length,
    byAge: byAge.length,
    byCount: byCount.length,
    toDelete: toDelete.length
  }
}

export async function readBackupFile(schoolId, fileName) {
  const safeName = sanitizeFileName(fileName || '')
  if (!safeName || !safeName.endsWith('.json')) {
    throw new Error('Invalid backup file name')
  }
  const filePath = path.join(getSchoolDir(schoolId), safeName)
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

export async function restoreBackupPayload(db, schoolId, payload) {
  const collections = Object.keys(payload?.data || {})

  for (const name of collections) {
    const docs = payload.data[name]
    if (!Array.isArray(docs) || docs.length === 0) continue
    const sampleDoc = docs[0]
    const filter = getCollectionFilter(name, sampleDoc, schoolId)
    if (!filter) continue

    if (name === 'schools') {
      await db.collection(name).replaceOne({ id: schoolId }, docs[0], { upsert: true })
      continue
    }

    await db.collection(name).deleteMany(filter)
    await db.collection(name).insertMany(docs)
  }
}

export async function logBackupEvent(db, { schoolId, userId, userRole, action, details, ipAddress, meta }) {
  if (!db || !schoolId || !action) return
  await db.collection('audit_logs').insertOne({
    id: uuidv4(),
    schoolId,
    userId: userId || 'system',
    userRole: userRole || 'system',
    action,
    details: details || '',
    ipAddress: ipAddress || 'unknown',
    meta: meta || {},
    createdAt: new Date().toISOString()
  })
}

function csvEscape(value) {
  const raw = value == null ? '' : String(value)
  if (raw.includes('"') || raw.includes(',') || raw.includes('\n')) {
    return `"${raw.replace(/"/g, '""')}"`
  }
  return raw
}

export function toCsv(docs) {
  if (!Array.isArray(docs) || docs.length === 0) {
    return ''
  }
  const keys = Array.from(
    docs.reduce((set, doc) => {
      Object.keys(doc || {}).forEach((key) => set.add(key))
      return set
    }, new Set())
  )

  const header = keys.map(csvEscape).join(',')
  const rows = docs.map((doc) => {
    return keys.map((key) => {
      const value = doc?.[key]
      if (typeof value === 'object' && value !== null) {
        return csvEscape(JSON.stringify(value))
      }
      return csvEscape(value)
    }).join(',')
  })

  return [header, ...rows].join('\n')
}
