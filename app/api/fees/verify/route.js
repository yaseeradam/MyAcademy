import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

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

    const { feeId } = verifyData.data.metadata
    
    if (!feeId) {
        return NextResponse.json({ error: 'Invalid transaction metadata' }, { status: 400 })
    }

    // 2. Update Fee Record in DB
    const db = await connectToDatabase()
    
    await db.collection('fee_payments').updateOne(
        { id: feeId },
        { 
            $set: { 
                status: 'paid', 
                paidAt: new Date().toISOString(),
                paymentReference: reference,
                paystackId: verifyData.data.id,
                channel: verifyData.data.channel,
                updatedAt: new Date().toISOString()
            } 
        }
    )

    return NextResponse.json({ success: true, message: 'Fee payment verified' })

  } catch (error) {
    console.error('Fee verification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
