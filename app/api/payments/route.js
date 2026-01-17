import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
const { buildCacheKey, getCache, setCache, shouldBypassCache, clearCache } = require('@/lib/api-cache')

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
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

// GET /api/payments - Get payment history for school
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bypassCache = shouldBypassCache(request)
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    const type = searchParams.get('type') // 'subscription' or 'fee'

    let query = { schoolId: user.schoolId }
    
    // If type is not specified or is 'subscription', show mainly subscription payments
    // But typically admins want to see EVERYTHING
    if (type) {
         query.type = type
    }

    const payments = await db.collection('payments')
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .limit(limit)
      .toArray()

    // Enrich payments with plan details
    const enrichedPayments = await Promise.all(payments.map(async (payment) => {
        if (payment.planId) {
            const plan = await db.collection('subscription_plans').findOne({ id: payment.planId })
            return { ...payment, planName: plan?.name || payment.planId }
        }
        return payment
    }))

    const total = await db.collection('payments').countDocuments(query)

    const payload = {
      payments: enrichedPayments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }

    if (!bypassCache) {
      setCache(buildCacheKey(request, user), payload, 15000)
    }
    return NextResponse.json(payload)

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/payments - Initialize School Subscription Payment
export async function POST(request) {
  try {
    clearCache()
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { planId, interval } = body // interval: 'monthly', 'termly', 'yearly'

    if (!planId) {
      return NextResponse.json({ error: 'Plan ID is required' }, { status: 400 })
    }

    // db connection is needed earlier now
    const db = await connectToDatabase()

    // Hardcoded plans as source of truth
    const plans = [
      { id: 'standard_monthly', price: 15000, duration: 1 },
      { id: 'standard_termly', price: 40000, duration: 3 },
      { id: 'standard_yearly', price: 150000, duration: 12 }
    ]

    // Fetch plan (from hardcoded list first for reliability)
    let selectedPlan = plans.find(p => p.id === planId)
    
    // If not found in hardcoded list, try DB
    if (!selectedPlan) {
        selectedPlan = await db.collection('subscription_plans').findOne({ id: planId })
    }
    
    if (!selectedPlan) {
        return NextResponse.json({ error: 'Invalid Plan ID' }, { status: 400 })
    }

    const transactionRef = `sub_${user.schoolId}_${Date.now()}`
    
    // Initialize Paystack
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: selectedPlan.price * 100, // kobo
        email: user.email,
        reference: transactionRef,
        metadata: {
          paymentType: 'subscription',
          schoolId: user.schoolId,
          planId: planId,
          durationMonths: selectedPlan.duration,
          adminId: user.id
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/` // Return to dashboard root for verification check
      })
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status) {
      return NextResponse.json({ error: 'Payment initialization failed', details: paystackData.message }, { status: 400 })
    }


    
    // Create pending payment record
    await db.collection('payments').insertOne({
        id: transactionRef, // use ref as ID for easy match
        schoolId: user.schoolId,
        userId: user.id,
        amount: selectedPlan.price,
        currency: 'NGN',
        planId: planId,
        provider: 'paystack',
        status: 'pending',
        type: 'subscription',
        reference: paystackData.data.reference,
        accessCode: paystackData.data.access_code,
        createdAt: new Date().toISOString()
    })

    return NextResponse.json({
      authorizationUrl: paystackData.data.authorization_url,
      reference: paystackData.data.reference,
      accessCode: paystackData.data.access_code,
      amount: selectedPlan.price * 100 // Return amount in kobo for frontend
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
