import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

// Database connection
async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

// GET /api/payments/verify-paystack - Verify Paystack payment
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference parameter required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Find the payment record
    const payment = await db.collection('payments').findOne({
      paystackReference: reference
    })

    if (!payment) {
      return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
    }

    // Verify payment with Paystack
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    })

    const paystackData = await paystackResponse.json()

    if (!paystackData.status || paystackData.data.status !== 'success') {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Update payment status
    await db.collection('payments').updateOne(
      { id: payment.id },
      {
        $set: {
          status: 'completed',
          paystackTransactionId: paystackData.data.id,
          completedAt: new Date().toISOString()
        }
      }
    )

    // Update subscription in schools collection
    const plan = await db.collection('subscription_plans').findOne({ id: payment.planId })
    if (plan) {
      const subscriptionEndDate = new Date()
      subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + plan.duration)

      await db.collection('schools').updateOne(
        { id: payment.schoolId },
        {
          $set: {
            subscriptionStatus: 'active',
            subscriptionPlanId: plan.id,
            subscriptionStartDate: new Date().toISOString(),
            subscriptionEndDate: subscriptionEndDate.toISOString(),
            lastPaymentDate: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        }
      )
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        planName: payment.planName,
        amount: payment.amount,
        currency: payment.currency
      }
    })

  } catch (error) {
    console.error('Paystack verification error:', error)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
