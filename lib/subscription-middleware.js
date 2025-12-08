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
    
    // Trial logic
    // Check both flat field and nested object for compatibility
    if (school.subscriptionStatus === 'trial' || school.subscription?.status === 'trial') {
        const endDate = new Date(school.subscriptionEndDate || school.subscription?.endDate)
        // Check if trial is still valid
        if (new Date() < endDate) {
            return { allowed: true, status: 'trial' }
        }
        return { allowed: false, status: 'expired', reason: 'Trial period expired' }
    }

    const now = new Date()
    // Handle both flat fields and nested subscription object
    const end = new Date(school.subscriptionEndDate || school.subscription?.endDate)
    
    // Check for grace period
    let grace = null;
    if (school.gracePeriodEndDate || school.subscription?.gracePeriodEndDate) {
        grace = new Date(school.gracePeriodEndDate || school.subscription?.gracePeriodEndDate);
    }

    if (!isNaN(end.getTime()) && now <= end) {
        return { allowed: true, status: 'active' }
    }
    
    if (grace && !isNaN(grace.getTime()) && now <= grace) {
        return { allowed: true, status: 'grace_period', reason: 'In grace period' }
    }

    return { allowed: false, status: 'expired', reason: 'Subscription expired' }

  } catch (error) {
    console.error('Subscription check middleware error:', error)
    return { allowed: false, status: 'error', reason: 'Internal error' }
  }
}
