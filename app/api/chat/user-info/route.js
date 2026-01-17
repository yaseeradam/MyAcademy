import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
const { buildCacheKey, getCache, setCache, shouldBypassCache } = require('@/lib/api-cache')

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

export async function GET(request) {
  try {
    const bypassCache = shouldBypassCache(request)
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const db = await connect()
    const fromUsers = await db.collection('users').findOne({ id: userId, schoolId: user.schoolId })
    if (fromUsers) {
      const payload = { id: fromUsers.id, name: fromUsers.name, email: fromUsers.email, profilePicture: fromUsers.profilePicture || null, isOnline: false, lastSeen: null }
      if (!bypassCache) setCache(buildCacheKey(request, user), payload, 60000)
      return NextResponse.json(payload)
    }
    const fromParents = await db.collection('parents').findOne({ id: userId, schoolId: user.schoolId })
    if (fromParents) {
      const payload = { id: fromParents.id, name: fromParents.name, email: fromParents.email || null, profilePicture: fromParents.profilePicture || null, isOnline: false, lastSeen: null }
      if (!bypassCache) setCache(buildCacheKey(request, user), payload, 60000)
      return NextResponse.json(payload)
    }
    const fromTeachers = await db.collection('teachers').findOne({ id: userId, schoolId: user.schoolId })
    if (fromTeachers) {
      const payload = { id: fromTeachers.id, name: `${fromTeachers.firstName} ${fromTeachers.lastName}`, email: fromTeachers.email || null, profilePicture: fromTeachers.profilePicture || null, isOnline: false, lastSeen: null }
      if (!bypassCache) setCache(buildCacheKey(request, user), payload, 60000)
      return NextResponse.json(payload)
    }
    const fallback = { id: userId, name: 'User', email: null, profilePicture: null, isOnline: false, lastSeen: null }
    if (!bypassCache) setCache(buildCacheKey(request, user), fallback, 30000)
    return NextResponse.json(fallback)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
