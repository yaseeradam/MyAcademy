import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import Stripe from 'stripe'
import crypto from 'crypto'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const JWT_SECRET = process.env.JWT_SECRET

// Initialize Stripe
const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null

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

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit

    // Get payments for the user's school
    const payments = await db.collection('payments')
      .find({ schoolId: user.schoolId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection('payments').countDocuments({ schoolId: user.schoolId })

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/payments - Create payment intent or initialize payment
export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, currency = 'usd', paymentMethod, planId, provider = 'stripe' } = body

    if (!amount || !planId) {
      return NextResponse.json({ error: 'Amount and planId are required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get plan details
    const plan = await db.collection('subscription_plans').findOne({ id: planId })
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Create payment record
    const paymentId = crypto.randomUUID()
    const payment = {
      id: paymentId,
      schoolId: user.schoolId,
      userId: user.id,
      amount,
      currency,
      planId,
      planName: plan.name,
      provider,
      status: 'pending',
      metadata: body.metadata || {},
      createdAt: new Date().toISOString()
    }

    await db.collection('payments').insertOne(payment)

    let authorizationUrl = null

    if (provider === 'stripe' && stripe) {
      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency,
            product_data: {
              name: plan.name,
              description: plan.description
            },
            unit_amount: Math.round(amount * 100) // Convert to cents
          },
          quantity: 1
        }],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        metadata: {
          paymentId,
          schoolId: user.schoolId,
          planId
        },
        customer_email: user.email
      })

      authorizationUrl = session.url

      // Update payment with Stripe session ID
      await db.collection('payments').updateOne(
        { id: paymentId },
        {
          $set: {
            stripeSessionId: session.id,
            authorizationUrl: session.url
          }
        }
      )

    } else if (provider === 'paystack') {
      // Initialize Paystack payment
      const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Convert to kobo
          email: user.email,
          reference: paymentId,
          metadata: {
            paymentId,
            schoolId: user.schoolId,
            planId
          },
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success`
        })
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        return NextResponse.json({ error: 'Payment initialization failed' }, { status: 400 })
      }

      authorizationUrl = paystackData.data.authorization_url

      // Update payment with Paystack reference
      await db.collection('payments').updateOne(
        { id: paymentId },
        {
          $set: {
            paystackReference: paystackData.data.reference,
            paystackAccessCode: paystackData.data.access_code,
            authorizationUrl: paystackData.data.authorization_url
          }
        }
      )
    }

    return NextResponse.json({
      paymentId,
      authorizationUrl
    })

  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
