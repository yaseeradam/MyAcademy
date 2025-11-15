import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'

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
    const secret = process.env.JWT_SECRET
    return jwt.verify(token, secret)
  } catch {
    return null
  }
}

export async function GET(request) {
  try {
    const user = verify(request)
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
    const db = await connect()
    const fromUsers = await db.collection('users').findOne({ id: userId, schoolId: user.schoolId })
    if (fromUsers) {
      return NextResponse.json({ id: fromUsers.id, name: fromUsers.name, email: fromUsers.email, profilePicture: fromUsers.profilePicture || null, isOnline: false, lastSeen: null })
    }
    const fromParents = await db.collection('parents').findOne({ id: userId, schoolId: user.schoolId })
    if (fromParents) {
      return NextResponse.json({ id: fromParents.id, name: fromParents.name, email: fromParents.email || null, profilePicture: fromParents.profilePicture || null, isOnline: false, lastSeen: null })
    }
    const fromTeachers = await db.collection('teachers').findOne({ id: userId, schoolId: user.schoolId })
    if (fromTeachers) {
      return NextResponse.json({ id: fromTeachers.id, name: `${fromTeachers.firstName} ${fromTeachers.lastName}`, email: fromTeachers.email || null, profilePicture: fromTeachers.profilePicture || null, isOnline: false, lastSeen: null })
    }
    return NextResponse.json({ id: userId, name: 'User', email: null, profilePicture: null, isOnline: false, lastSeen: null })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
