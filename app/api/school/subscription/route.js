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

// GET /api/school/subscription - Get school subscription details
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Get school details with subscription info
    const school = await db.collection('schools').findOne({ id: user.schoolId })
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Get current subscription plan details
    let planDetails = null
    if (school.subscriptionPlanId) {
      planDetails = await db.collection('subscription_plans').findOne({ id: school.subscriptionPlanId })
    }

    // Get usage statistics
    const [totalUsers, totalStudents, totalTeachers, totalParents, totalStorage] = await Promise.all([
      db.collection('users').countDocuments({ schoolId: user.schoolId }),
      db.collection('students').countDocuments({ schoolId: user.schoolId }),
      db.collection('teachers').countDocuments({ schoolId: user.schoolId }),
      db.collection('parents').countDocuments({ schoolId: user.schoolId }),
      // For storage, we'll use a placeholder calculation
      Promise.resolve(0) // TODO: Implement actual storage calculation
    ])

    const subscription = {
      subscriptionStatus: school.subscriptionStatus || 'trial',
      subscriptionPlanId: school.subscriptionPlanId,
      planName: planDetails?.name || 'Free Trial',
      planPrice: planDetails?.price || 0,
      currency: planDetails?.currency || 'usd',
      subscriptionStartDate: school.subscriptionStartDate,
      subscriptionEndDate: school.subscriptionEndDate,
      lastPaymentDate: school.lastPaymentDate,
      maxUsers: planDetails?.maxUsers || 50,
      maxStorage: planDetails?.maxStorage || 1000,
      currentUsers: totalUsers,
      currentStudents: totalStudents,
      currentTeachers: totalTeachers,
      currentParents: totalParents,
      currentStorage: totalStorage,
      featuresUsed: 0, // TODO: Implement feature usage tracking
      totalFeatures: planDetails?.features?.length || 10
    }

    return NextResponse.json({ subscription })

  } catch (error) {
    console.error('Error fetching school subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
