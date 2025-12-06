import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

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

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json({ error: 'Reference is required' }, { status: 400 })
    }

    // 1. Verify with Paystack
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    })

    const verifyData = await verifyRes.json()

    if (!verifyData.status || verifyData.data.status !== 'success') {
      return NextResponse.json({ error: 'Transaction not successful' }, { status: 400 })
    }

    // 2. Transaction is successful, update DB
    const db = await connectToDatabase()
    const metadata = verifyData.data.metadata
    const schoolId = metadata.schoolId
    const planId = metadata.planId
    const durationMonths = parseInt(metadata.durationMonths) || 1

    if (!schoolId) {
        return NextResponse.json({ error: 'Invalid transaction metadata' }, { status: 400 })
    }

    // Update Payment Record
    await db.collection('payments').updateOne(
        { reference: reference },
        { 
            $set: { 
                status: 'completed', 
                paidAt: new Date(), 
                paystackId: verifyData.data.id,
                channel: verifyData.data.channel
            } 
        }
    )

    // Calculate new expiry date
    // If renewing, check current expiry. If verified *before* expiry, add to existing. 
    // If expired, start from today/now.
    // Verify using 'id' not '_id' based on project pattern
    const school = await db.collection('schools').findOne({ id: schoolId })
    
    let startDate = new Date()
    let currentEndDate = school?.subscriptionEndDate ? new Date(school.subscriptionEndDate) : null
    
    // If current end date is in the future, add to it. Otherwise start now.
    if (currentEndDate && currentEndDate > new Date()) {
        startDate = currentEndDate
    }

    const newEndDate = new Date(startDate)
    newEndDate.setMonth(newEndDate.getMonth() + durationMonths)

    // Set Grace Period to 3 days after new expiry
    const newGraceDate = new Date(newEndDate)
    newGraceDate.setDate(newGraceDate.getDate() + 3)

    // Update School Subscription
    await db.collection('schools').updateOne(
        { id: schoolId },
        {
            $set: {
                subscriptionStatus: 'active',
                subscriptionPlanId: planId,
                subscriptionStartDate: new Date(), // Last renewal date
                subscriptionEndDate: newEndDate,
                paymentInterval: metadata.interval || 'monthly',
                gracePeriodEndDate: newGraceDate
            }
        }
    )

    return NextResponse.json({ success: true, message: 'Subscription activated' })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
