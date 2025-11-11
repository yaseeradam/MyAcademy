import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

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
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// GET /api/payments/parent - Get parent payment history
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    
    const payments = await db.collection('parent_payments')
      .find({ parentId: user.id, schoolId: user.schoolId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({ payments })

  } catch (error) {
    console.error('Error fetching parent payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/payments/parent - Create parent payment
export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { amount, paymentType, description, provider = 'paystack', studentId } = body

    if (!amount || !paymentType) {
      return NextResponse.json({ error: 'Amount and payment type are required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get parent's children if studentId not specified
    let selectedStudent = null
    if (studentId) {
      selectedStudent = await db.collection('students').findOne({ 
        id: studentId, 
        parentId: user.id, 
        schoolId: user.schoolId 
      })
    } else {
      const children = await db.collection('students')
        .find({ parentId: user.id, schoolId: user.schoolId })
        .toArray()
      
      if (children.length === 1) {
        selectedStudent = children[0]
      } else if (children.length === 0) {
        return NextResponse.json({ error: 'No children found' }, { status: 400 })
      }
    }

    // Get school details for payment
    const school = await db.collection('schools').findOne({ id: user.schoolId })
    const schoolSettings = await db.collection('school_settings').findOne({ schoolId: user.schoolId })

    // Create payment record
    const paymentId = crypto.randomUUID()
    const payment = {
      id: paymentId,
      parentId: user.id,
      parentName: user.name,
      schoolId: user.schoolId,
      studentId: selectedStudent?.id || null,
      studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : null,
      amount: parseFloat(amount),
      currency: 'NGN',
      paymentType,
      description,
      provider,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    await db.collection('parent_payments').insertOne(payment)

    let authorizationUrl = null

    if (provider === 'paystack') {
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
            parentId: user.id,
            schoolId: user.schoolId,
            studentId: selectedStudent?.id,
            paymentType,
            custom_fields: [
              {
                display_name: "School Name",
                variable_name: "school_name",
                value: school?.name || "School"
              },
              {
                display_name: "Student Name",
                variable_name: "student_name",
                value: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : "N/A"
              }
            ]
          },
          callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`
        })
      })

      const paystackData = await paystackResponse.json()

      if (!paystackData.status) {
        return NextResponse.json({ error: 'Payment initialization failed' }, { status: 400 })
      }

      authorizationUrl = paystackData.data.authorization_url

      // Update payment with Paystack reference
      await db.collection('parent_payments').updateOne(
        { id: paymentId },
        {
          $set: {
            paystackReference: paystackData.data.reference,
            paystackAccessCode: paystackData.data.access_code,
            authorizationUrl: paystackData.data.authorization_url
          }
        }
      )

      // Send notification to school admins
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            schoolId: user.schoolId,
            parentName: user.name,
            amount: parseFloat(amount),
            paymentType,
            studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : null
          })
        })
      } catch (notifError) {
        console.error('Failed to send payment notification:', notifError)
      }

      // Send notification to school admins (simulate payment completion for demo)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/notifications/payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentId,
            schoolId: user.schoolId,
            parentName: user.name,
            amount: parseFloat(amount),
            paymentType,
            studentName: selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : null
          })
        })
      } catch (notifError) {
        console.error('Failed to send payment notification:', notifError)
      }
    }

    return NextResponse.json({
      paymentId,
      authorizationUrl,
      schoolDetails: {
        name: school?.name,
        accountName: schoolSettings?.accountName || school?.name,
        accountNumber: schoolSettings?.accountNumber,
        bankName: schoolSettings?.bankName
      }
    })

  } catch (error) {
    console.error('Error creating parent payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}