import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import crypto from 'crypto'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

function calculateSubscriptionDates(interval) {
  const startDate = new Date()
  const endDate = new Date(startDate)
  
  // Default interval Logic
  if (interval === 'monthly') {
    endDate.setMonth(endDate.getMonth() + 1)
  } else if (interval === 'termly') {
    endDate.setMonth(endDate.getMonth() + 4) // 4 months per term
  } else if (interval === 'yearly') {
    endDate.setFullYear(endDate.getFullYear() + 1)
  } else {
    // Default 1 month if unknown
    endDate.setMonth(endDate.getMonth() + 1)
  }

  // Grace period = End Date + 3 days
  const gracePeriodDate = new Date(endDate)
  gracePeriodDate.setDate(gracePeriodDate.getDate() + 3)

  return { startDate, endDate, gracePeriodDate }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const headers = request.headers
    const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY).update(JSON.stringify(body)).digest('hex')

    if (hash !== headers.get('x-paystack-signature')) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const event = body
    if (event.event === 'charge.success') {
      const db = await connectToDatabase()
      const { metadata, reference } = event.data
      
      // Handle School Subscription
      if (metadata.paymentType === 'subscription') {
         const { schoolId, planId, durationMonths } = metadata
         
         // Calculate dates
         // If durationMonths is passed, use it, otherwise fallback
         // But planId map logic is safer if passed implicitly, or use what we saved in metadata
         
         const startDate = new Date()
         const endDate = new Date(startDate)
         
         if (durationMonths) {
             endDate.setMonth(endDate.getMonth() + parseInt(durationMonths))
         } else {
             endDate.setMonth(endDate.getMonth() + 1) // fallback
         }

         const gracePeriodDate = new Date(endDate)
         gracePeriodDate.setDate(gracePeriodDate.getDate() + 3) // 3 days grace

         await db.collection('schools').updateOne(
             { id: schoolId },
             {
                 $set: {
                     subscriptionStatus: 'active',
                     subscriptionPlanId: planId,
                     subscriptionStartDate: startDate.toISOString(),
                     subscriptionEndDate: endDate.toISOString(),
                     gracePeriodEndDate: gracePeriodDate.toISOString(),
                     lastPaymentDate: startDate.toISOString(),
                     paymentProvider: 'paystack',
                     active: true // Ensure school is active
                 }
             }
         )

         // Update Payment Record
         await db.collection('payments').updateOne(
             { reference: reference }, // or match by ID if we used ref as ID
             { 
                 $set: { 
                     status: 'completed', 
                     paidAt: new Date().toISOString(),
                     paystackData: event.data 
                 }
             }
         )

      } 
      // Handle School Fees
      else if (metadata.paymentType === 'school_fees') {
          const { feeId } = metadata
          
          await db.collection('fee_payments').updateOne(
              { id: feeId },
              {
                  $set: {
                      status: 'paid',
                      paidDate: new Date().toISOString(),
                      paystackReference: reference,
                      paymentProvider: 'paystack'
                  }
              }
          )
      }
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
