import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
const { buildCacheKey, getCache, setCache, shouldBypassCache } = require('@/lib/api-cache')

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

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
    const bypassCache = shouldBypassCache(request)
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }

    // Checking our OWN school status
    const db = await connectToDatabase()
    const school = await db.collection('schools').findOne({ id: user.schoolId })
    
    if (!school) {
        return NextResponse.json({ status: 'unknown' })
    }

    // Logic for Status
    const now = new Date()
    const endDate = new Date(school.subscriptionEndDate)
    const graceDate = new Date(school.gracePeriodEndDate)

    let status = 'active'
    let message = ''
    let daysRemaining = 0

    if (now < endDate) {
        status = 'active'
        daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))
    } else if (now < graceDate) {
        status = 'grace_period'
        daysRemaining = Math.ceil((graceDate - now) / (1000 * 60 * 60 * 24))
        message = `Subscription expired! You have ${daysRemaining} days of grace period remaining.`
    } else {
        status = 'expired'
        daysRemaining = 0
        message = 'Subscription expired. Access locked.'
    }

    // Developer bypass or free tier logic if needed?
    // For now assuming strict logic as requested.

    const payload = {
        status,
        daysRemaining,
        message,
        subscriptionEndDate: school.subscriptionEndDate,
        gracePeriodEndDate: school.gracePeriodEndDate,
        planName: school.subscriptionPlanId // could fetch plan name if needed
    }
    if (!bypassCache) setCache(buildCacheKey(request, user), payload, 15000)
    return NextResponse.json(payload)

  } catch (error) {
    console.error('Subscription check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
