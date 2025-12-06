import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

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

// GET /api/fees - Get fees based on role
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')

    let query = { schoolId: user.schoolId }

    if (user.role === 'parent') {
      // Parents see fees for their children
      // First get all children IDs for this parent
      const myChildren = await db.collection('students')
        .find({ parentId: user.id, schoolId: user.schoolId })
        .project({ id: 1 })
        .toArray()
      
      const childrenIds = myChildren.map(c => c.id)
      
      if (childrenIds.length === 0) {
        return NextResponse.json({ fees: [] })
      }

      query.studentId = { $in: childrenIds }
    } else if (user.role === 'school_admin' || user.role === 'accountant') {
      // Admins see all fees, or filtered by student
      if (studentId) {
        query.studentId = studentId
      }
    } else {
      // Teachers don't typically see fees unless authorized
      return NextResponse.json({ error: 'Unauthorized to view fees' }, { status: 403 })
    }

    const fees = await db.collection('fee_payments')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray()

    // Enrich with student details for display
    const enrichedFees = await Promise.all(fees.map(async (fee) => {
      const student = await db.collection('students').findOne({ id: fee.studentId })
      return {
        ...fee,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown Student',
        studentClass: student ? student.className : 'Unknown Class'
      }
    }))

    return NextResponse.json({ fees: enrichedFees })

  } catch (error) {
    console.error('Error fetching fees:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/fees - Create new fee record (Admin only)
export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { studentId, amount, purpose, description, dueDate } = body

    if (!studentId || !amount || !purpose) {
      return NextResponse.json({ error: 'Student, amount, and purpose are required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get student info to link parent
    const student = await db.collection('students').findOne({ id: studentId })
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const fee = {
      id: require('crypto').randomUUID(),
      schoolId: user.schoolId,
      studentId,
      parentId: student.parentId || null,
      amount: parseFloat(amount),
      currency: 'NGN',
      purpose, // e.g., 'Tuition Term 1', 'Transport'
      description: description || '',
      dueDate: dueDate || null,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection('fee_payments').insertOne(fee)

    return NextResponse.json({ fee }, { status: 201 })

  } catch (error) {
    console.error('Error creating fee:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
