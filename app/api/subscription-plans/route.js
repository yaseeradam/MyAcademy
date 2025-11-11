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

// GET /api/subscription-plans - Get all available subscription plans
export async function GET(request) {
  try {
    const db = await connectToDatabase()

    const plans = await db.collection('subscription_plans')
      .find({ active: true })
      .sort({ price: 1 })
      .toArray()

    return NextResponse.json({ plans })

  } catch (error) {
    console.error('Error fetching subscription plans:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/subscription-plans - Create new subscription plan (Admin only)
export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'developer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, price, currency, duration, features, maxUsers, maxStorage } = body

    if (!name || !price || !duration) {
      return NextResponse.json({ error: 'Name, price, and duration are required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    const plan = {
      id: require('crypto').randomUUID(),
      name,
      description,
      price: parseFloat(price),
      currency: currency || 'usd',
      duration: parseInt(duration), // in months
      features: features || [],
      maxUsers: maxUsers || 100,
      maxStorage: maxStorage || 1000, // in MB
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await db.collection('subscription_plans').insertOne(plan)

    return NextResponse.json({ plan }, { status: 201 })

  } catch (error) {
    console.error('Error creating subscription plan:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
