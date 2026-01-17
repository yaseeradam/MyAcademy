import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
const { buildCacheKey, getCache, setCache, shouldBypassCache, clearCache } = require('@/lib/api-cache')

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

// GET /api/subscription-plans - Get all available subscription plans
export async function GET(request) {
  try {
    const bypassCache = shouldBypassCache(request)
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, null, 'subscription-plans'))
      if (cached) return NextResponse.json(cached)
    }
    // Return hardcoded plans for now to ensure consistency
    // In production, these could be fetched from DB and synchronized with Paystack
    const plans = [
      {
        id: 'standard_monthly',
        name: 'Standard (Monthly)',
        description: 'Monthly subscription',
        price: 15000,
        currency: 'NGN',
        interval: 'monthly',
        duration: 1, 
        features: ['Automated Result Compilation & Report Cards', 'Digital Fee Management & Online Collections', 'Parent, Teacher & Student Portals', 'Advanced Performance Analytics & Insights', 'Real-time Attendance & Behavior Tracking', 'Unlimited Cloud Storage & Backup'],
        maxUsers: 10000,
        maxStorage: 10240,
        active: true
      },
      {
        id: 'standard_termly',
        name: 'Standard (Termly)',
        description: 'Billed every 3 months',
        price: 40000, // Discounted for 3 months
        currency: 'NGN',
        interval: 'termly',
        duration: 3,
        features: ['Automated Result Compilation & Report Cards', 'Digital Fee Management & Online Collections', 'Parent, Teacher & Student Portals', 'Advanced Performance Analytics & Insights', 'Real-time Attendance & Behavior Tracking', 'Unlimited Cloud Storage & Backup'],
        maxUsers: 10000,
        maxStorage: 10240,
        active: true
      },
      {
        id: 'standard_yearly',
        name: 'Standard (Yearly)',
        description: 'Annual subscription (Best Value)',
        price: 150000, 
        currency: 'NGN',
        interval: 'yearly',
        duration: 12,
        features: ['Automated Result Compilation & Report Cards', 'Digital Fee Management & Online Collections', 'Parent, Teacher & Student Portals', 'Advanced Performance Analytics & Insights', 'Real-time Attendance & Behavior Tracking', 'Unlimited Cloud Storage & Backup'],
        maxUsers: 10000,
        maxStorage: 10240,
        active: true
      }
    ]

    const payload = { plans }
    if (!bypassCache) setCache(buildCacheKey(request, null, 'subscription-plans'), payload, 300000)
    return NextResponse.json(payload)

  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/subscription-plans - Create new subscription plan (Admin only)
export async function POST(request) {
  clearCache()
  // Disabled dynamically creating plans for now to favor the hardcoded steady structure
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}
