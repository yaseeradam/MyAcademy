import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
let cachedDb = null

async function connectToDatabase() {
  if (cachedDb) return cachedDb
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  cachedDb = client.db(DB_NAME)
  return cachedDb
}

/**
 * Checks if a school has valid subscription access
 * @param {string} schoolId 
 * @returns {Promise<{allowed: boolean, status: string, reason: string}>}
 */
export async function checkSubscriptionAccess(schoolId) {
  if (!schoolId) return { allowed: false, status: 'error', reason: 'No school ID' }

  try {
    const db = await connectToDatabase()
    const school = await db.collection('schools').findOne({ id: schoolId })

    if (!school) return { allowed: false, status: 'error', reason: 'School not found' }
    
    // Trial logic?
    if (school.subscriptionStatus === 'trial') {
        const endDate = new Date(school.subscriptionEndDate)
        if (new Date() < endDate) return { allowed: true, status: 'trial' }
        // Trial expired
    }

    const now = new Date()
    const end = new Date(school.subscriptionEndDate)
    const grace = new Date(school.gracePeriodEndDate)

    if (now <= end) {
        return { allowed: true, status: 'active' }
    }
    
    if (now <= grace) {
        return { allowed: true, status: 'grace_period', reason: 'In grace period' }
    }

    return { allowed: false, status: 'expired', reason: 'Subscription expired' }

  } catch (error) {
    console.error('Subscription check middleware error:', error)
    return { allowed: false, status: 'error', reason: 'Internal error' }
  }
}
