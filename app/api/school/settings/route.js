import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET

// Database connection
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

// Verify JWT token
function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const jwt = require('jsonwebtoken')
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Get school settings
    let schoolSettings = await db.collection('school_settings').findOne({
      schoolId: user.schoolId
    })

    // If no settings exist, create default ones
    if (!schoolSettings) {
      schoolSettings = {
        schoolId: user.schoolId,
        schoolName: '',
        logo: '',
        primaryColor: '#3b82f6',
        secondaryColor: '#64748b',
        address: '',
        phoneNumber: '',
        email: '',
        website: '',
        timezone: 'Africa/Lagos',
        academicYear: new Date().getFullYear().toString(),
        updatedAt: new Date().toISOString()
      }

      await db.collection('school_settings').insertOne(schoolSettings)
    }

    return NextResponse.json(schoolSettings)
  } catch (error) {
    console.error('Error fetching school settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const body = await request.json()

    // Update or create school settings
    const schoolSettings = {
      schoolId: user.schoolId,
      schoolName: body.schoolName || '',
      logo: body.logo || '',
      primaryColor: body.primaryColor || '#3b82f6',
      secondaryColor: body.secondaryColor || '#64748b',
      address: body.address || '',
      phoneNumber: body.phoneNumber || '',
      email: body.email || '',
      website: body.website || '',
      timezone: body.timezone || 'Africa/Lagos',
      academicYear: body.academicYear || new Date().getFullYear().toString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection('school_settings').updateOne(
      { schoolId: user.schoolId },
      { $set: schoolSettings },
      { upsert: true }
    )

    // If school name changed, update the school record too
    if (body.schoolName) {
      await db.collection('schools').updateOne(
        { id: user.schoolId },
        {
          $set: {
            name: body.schoolName,
            updatedAt: new Date().toISOString()
          }
        }
      )
    }

    return NextResponse.json(schoolSettings)
  } catch (error) {
    console.error('Error saving school settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
