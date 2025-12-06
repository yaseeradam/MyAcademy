import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

async function connectToDatabase() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  return client.db(DB_NAME)
}

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

export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { feeId } = body

    if (!feeId) {
      return NextResponse.json({ error: 'Fee ID is required' }, { status: 400 })
    }

    const db = await connectToDatabase()
    const fee = await db.collection('fee_payments').findOne({ id: feeId })

    if (!fee) {
      return NextResponse.json({ error: 'Fee record not found' }, { status: 404 })
    }

    if (fee.status === 'paid') {
      return NextResponse.json({ error: 'Fee is already paid' }, { status: 400 })
    }

    // Initialize Paystack Transaction
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: user.email,
        amount: Math.round(fee.amount * 100), // Paystack expects kobo
        reference: `fee_${feeId}_${Date.now()}`,
        metadata: {
            custom_fields: [
                {
                    display_name: "Fee Type",
                    variable_name: "fee_type",
                    value: fee.purpose
                }
            ],
            schoolId: fee.schoolId,
            feeId: feeId,
            studentId: fee.studentId,
            paymentType: 'school_fees'
        },
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/parent/fees/verify`
      })
    })

    const data = await response.json()

    if (!data.status) {
      return NextResponse.json({ error: 'Paystack initialization failed', details: data.message }, { status: 400 })
    }

    return NextResponse.json({ 
        authorizationUrl: data.data.authorization_url, 
        reference: data.data.reference,
        accessCode: data.data.access_code,
        amount: Math.round(fee.amount * 100),
        email: user.email
    })

  } catch (error) {
    console.error('Error initializing fee payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
