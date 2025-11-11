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

// GET /api/auth/sessions - Get all active sessions for current user
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()

    // Get all active sessions for this user
    const sessions = await db.collection('user_sessions')
      .find({
        userId: user.id,
        active: true,
        expiresAt: { $gt: new Date() }
      })
      .sort({ createdAt: -1 })
      .toArray()

    // Get current session info
    const currentSessionId = request.headers.get('x-session-id') || user.sessionId

    const formattedSessions = sessions.map(session => ({
      id: session.id,
      deviceInfo: session.deviceInfo,
      ipAddress: session.ipAddress,
      location: session.location,
      userAgent: session.userAgent,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
      expiresAt: session.expiresAt,
      isCurrentSession: session.id === currentSessionId
    }))

    return NextResponse.json({ sessions: formattedSessions })

  } catch (error) {
    console.error('Error fetching sessions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/auth/sessions - Create new session (login)
export async function POST(request) {
  try {
    const { userId, deviceInfo, ipAddress, location, userAgent } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Create session ID
    const sessionId = require('crypto').randomUUID()

    // Set expiration (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const sessionData = {
      id: sessionId,
      userId,
      deviceInfo: deviceInfo || {},
      ipAddress: ipAddress || 'Unknown',
      location: location || 'Unknown',
      userAgent: userAgent || 'Unknown',
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
      expiresAt: expiresAt.toISOString(),
      active: true
    }

    await db.collection('user_sessions').insertOne(sessionData)

    // Update user's last login
    await db.collection('users').updateOne(
      { id: userId },
      {
        $set: {
          lastLogin: new Date().toISOString(),
          lastLoginIp: ipAddress,
          updatedAt: new Date().toISOString()
        }
      }
    )

    return NextResponse.json({
      sessionId,
      expiresAt: sessionData.expiresAt,
      message: 'Session created successfully'
    })

  } catch (error) {
    console.error('Error creating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/auth/sessions - Terminate session(s)
export async function DELETE(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')
    const terminateAll = searchParams.get('all') === 'true'

    const db = await connectToDatabase()

    let updateFilter = { userId: user.id, active: true }

    if (!terminateAll) {
      if (!sessionId) {
        return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
      }
      updateFilter.id = sessionId
    }

    // Don't allow terminating current session unless terminating all
    if (!terminateAll) {
      const currentSessionId = request.headers.get('x-session-id') || user.sessionId
      if (sessionId === currentSessionId) {
        return NextResponse.json({ error: 'Cannot terminate current session' }, { status: 400 })
      }
    }

    const result = await db.collection('user_sessions').updateMany(
      updateFilter,
      {
        $set: {
          active: false,
          terminatedAt: new Date().toISOString(),
          terminatedBy: user.id
        }
      }
    )

    // If terminating all sessions, create a new session for current user
    if (terminateAll) {
      const newSessionId = require('crypto').randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30)

      await db.collection('user_sessions').insertOne({
        id: newSessionId,
        userId: user.id,
        deviceInfo: { type: 'web', browser: 'Unknown' },
        ipAddress: request.headers.get('x-forwarded-for') || 'Unknown',
        location: 'Unknown',
        userAgent: request.headers.get('user-agent') || 'Unknown',
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        expiresAt: expiresAt.toISOString(),
        active: true
      })

      return NextResponse.json({
        message: 'All sessions terminated. New session created.',
        newSessionId,
        terminatedCount: result.modifiedCount
      })
    }

    return NextResponse.json({
      message: 'Session terminated successfully',
      terminatedCount: result.modifiedCount
    })

  } catch (error) {
    console.error('Error terminating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/auth/sessions - Update session activity
export async function PATCH(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()
    const targetSessionId = sessionId || request.headers.get('x-session-id') || user.sessionId

    if (!targetSessionId) {
      return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Update last activity
    const result = await db.collection('user_sessions').updateOne(
      {
        id: targetSessionId,
        userId: user.id,
        active: true,
        expiresAt: { $gt: new Date() }
      },
      {
        $set: {
          lastActivity: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Session not found or expired' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Session updated successfully' })

  } catch (error) {
    console.error('Error updating session:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
