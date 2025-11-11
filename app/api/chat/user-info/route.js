import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'

const client = new MongoClient(process.env.MONGO_URL)
let cachedDb = null

async function connectDB() {
  if (cachedDb) return cachedDb
  await client.connect()
  cachedDb = client.db(process.env.DB_NAME || 'school_management')
  return cachedDb
}

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    jwt.verify(token, process.env.JWT_SECRET)
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const db = await connectDB()
    const user = await db.collection('users').findOne({ id: userId })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture || '',
      bio: user.bio || '',
      lastSeen: user.lastSeen || null,
      isOnline: user.isOnline || false
    })
  } catch (error) {
    console.error('User info error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
