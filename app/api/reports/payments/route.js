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

// GET /api/reports/payments - Get payment analytics
export async function GET(request) {
  try {
    const bypassCache = shouldBypassCache(request)
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }

    const db = await connectToDatabase()

    // Get all payments for the school (including parent payments)
    const [schoolPayments, parentPayments] = await Promise.all([
      db.collection('payments').find({ schoolId: user.schoolId }).sort({ createdAt: -1 }).toArray(),
      db.collection('parent_payments').find({ schoolId: user.schoolId }).sort({ createdAt: -1 }).toArray()
    ])

    const allPayments = [...schoolPayments, ...parentPayments]

    const totalRevenue = allPayments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + (p.amount || 0), 0)

    const recentTransactions = allPayments.slice(0, 10).map(payment => ({
      ...payment,
      parentName: payment.parentName || 'School Payment',
      description: payment.description || payment.paymentType || 'Payment'
    }))

    const paymentStatusBreakdown = [
      { status: 'completed', count: allPayments.filter(p => p.status === 'completed').length },
      { status: 'pending', count: allPayments.filter(p => p.status === 'pending').length },
      { status: 'failed', count: allPayments.filter(p => p.status === 'failed').length }
    ]

    const payload = {
      totalRevenue,
      recentTransactions,
      paymentStatusBreakdown,
      monthlyRevenue: []
    }
    if (!bypassCache) setCache(buildCacheKey(request, user), payload, 60000)
    return NextResponse.json(payload)

  } catch (error) {
    console.error('Error fetching payment analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
