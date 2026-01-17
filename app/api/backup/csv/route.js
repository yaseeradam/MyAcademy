import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'
import { listBackupCollections, toCsv } from '@/lib/backup-utils'

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

function getCollectionFilter(name, sampleDoc, schoolId) {
  if (name === 'schools') return { id: schoolId }
  if (name === 'users') return { schoolId }
  if (sampleDoc && Object.prototype.hasOwnProperty.call(sampleDoc, 'schoolId')) {
    return { schoolId }
  }
  return null
}

export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const collectionName = searchParams.get('collection')
    if (!collectionName) {
      return NextResponse.json({ error: 'Collection is required' }, { status: 400 })
    }

    const db = await connectDB()
    const allowedCollections = await listBackupCollections(db, user.schoolId)
    if (!allowedCollections.includes(collectionName)) {
      return NextResponse.json({ error: 'Collection not available' }, { status: 400 })
    }

    const sampleDoc = await db.collection(collectionName).findOne()
    const filter = getCollectionFilter(collectionName, sampleDoc, user.schoolId)
    if (!filter) {
      return NextResponse.json({ error: 'Collection not available' }, { status: 400 })
    }

    const docs = await db.collection(collectionName).find(filter).toArray()
    const csv = toCsv(docs)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${collectionName}.csv"`
      }
    })
  } catch (error) {
    console.error('Backup CSV export error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
