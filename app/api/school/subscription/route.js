import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
const { buildCacheKey, getCache, setCache, shouldBypassCache } = require('@/lib/api-cache')

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
    const bypassCache = shouldBypassCache(request)
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }

    const db = await connectToDatabase()

    // Get school details with subscription info
    const school = await db.collection('schools').findOne({ id: user.schoolId })
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 })
    }

    // Define plans locally since they are hardcoded in the plans API
    const plans = [
      {
        id: 'standard_monthly',
        name: 'Standard (Monthly)',
        price: 15000,
        currency: 'NGN',
        features: ['Automated Result Compilation', 'Digital Fee Management', 'Portals', 'Analytics', 'Attendance', 'Unlimited Storage'],
        maxUsers: 10000,
        maxStorage: 10240
      },
      {
        id: 'standard_termly',
        name: 'Standard (Termly)',
        price: 40000,
        currency: 'NGN',
        features: ['Automated Result Compilation', 'Digital Fee Management', 'Portals', 'Analytics', 'Attendance', 'Unlimited Storage'],
        maxUsers: 10000,
        maxStorage: 10240
      },
      {
        id: 'standard_yearly',
        name: 'Standard (Yearly)',
        price: 150000,
        currency: 'NGN',
        features: ['Automated Result Compilation', 'Digital Fee Management', 'Portals', 'Analytics', 'Attendance', 'Unlimited Storage'],
        maxUsers: 10000,
        maxStorage: 10240
      }
    ]

    // Get current subscription plan details
    let planDetails = null
    console.log(`Fetching subscription for school: ${user.schoolId}, Plan ID: ${school.subscriptionPlanId}, Status: ${school.subscriptionStatus}`)

    if (school.subscriptionPlanId) {
      // Try to find in hardcoded list first (source of truth currently)
      planDetails = plans.find(p => p.id === school.subscriptionPlanId)
      
      // Fallback to DB if not found in hardcoded list
      if (!planDetails) {
         planDetails = await db.collection('subscription_plans').findOne({ id: school.subscriptionPlanId })
      }
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

    const payload = { subscription }
    if (!bypassCache) setCache(buildCacheKey(request, user), payload, 60000)
    return NextResponse.json(payload)

  } catch (error) {
    console.error('Error fetching school subscription:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
