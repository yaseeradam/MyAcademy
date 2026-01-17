import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
const { buildCacheKey, getCache, setCache, shouldBypassCache, clearCache } = require('@/lib/api-cache')

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'

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
    const JWT_SECRET = process.env.JWT_SECRET
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function GET(request) {
  try {
    const bypassCache = shouldBypassCache(request)
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }

    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')
    const subjectId = searchParams.get('subjectId')

    if (!classId) {
      return NextResponse.json({ error: 'Class ID is required' }, { status: 400 })
    }

    const db = await connectToDatabase()
    
    // Check if user is a teacher and has access to this class/subject
    // If getting all class scores (no subjectId), teacher must have at least one assignment in this class ??
    // Actually, for report cards, usually only Admin or Form Teacher creates them.
    // For now, let's allow if user is teacher and subjectId is present, OR if user is teacher and requesting all assignments (maybe restrict this later if needed).
    // Simpler: If subjectId is missing, skip specific assignment check for now or check generic class access.
    
    if (user.role === 'teacher' && subjectId) {
      const assignment = await db.collection('teacher_assignments').findOne({
        teacherId: user.id,
        classId,
        subjectId,
        active: true
      })
      if (!assignment) {
        const hasAssignments = await db.collection('teacher_assignments').findOne({
          teacherId: user.id,
          schoolId: user.schoolId
        })
        if (hasAssignments) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      }
    }

    // Build query
    const query = {
        classId,
        schoolId: user.schoolId
    }
    if (subjectId) {
        query.subjectId = subjectId
    }

    // Get existing scores
    const scores = await db.collection('student_scores')
      .find(query)
      .toArray()

    const payload = { scores }
    if (!bypassCache) setCache(buildCacheKey(request, user), payload, 30000)
    return NextResponse.json(payload)
  } catch (error) {
    console.error('Error fetching scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    clearCache()
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { scores } = body

    if (!scores || !Array.isArray(scores)) {
      return NextResponse.json({ error: 'Invalid scores data' }, { status: 400 })
    }

    const db = await connectToDatabase()
    
    // Validate that teacher has access to this class/subject
    if (user.role === 'teacher') {
      const hasAssignments = await db.collection('teacher_assignments').findOne({
        teacherId: user.id,
        schoolId: user.schoolId
      })
      for (const score of scores) {
        const assignment = await db.collection('teacher_assignments').findOne({
          teacherId: user.id,
          classId: score.classId,
          subjectId: score.subjectId,
          active: true
        })
        if (!assignment && hasAssignments) {
          return NextResponse.json({ error: 'Access denied for some class/subject combinations' }, { status: 403 })
        }
      }
    }

    // Process each score
    const operations = scores.map(score => ({
      updateOne: {
        filter: {
          studentId: score.studentId,
          classId: score.classId,
          subjectId: score.subjectId,
          schoolId: user.schoolId
        },
        update: {
          $set: {
            id: uuidv4(),
            studentId: score.studentId,
            classId: score.classId,
            subjectId: score.subjectId,
            teacherId: score.teacherId,
            schoolId: user.schoolId,
            scores: score.scores,
            total: score.total,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        },
        upsert: true
      }
    }))

    if (operations.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No scores to save',
        modifiedCount: 0,
        upsertedCount: 0
      })
    }
    const result = await db.collection('student_scores').bulkWrite(operations)

    return NextResponse.json({ 
      success: true, 
      message: 'Scores saved successfully',
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount
    })
  } catch (error) {
    console.error('Error saving scores:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
