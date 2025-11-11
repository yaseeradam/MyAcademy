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

// GET /api/gamification/points - Get user points and achievements
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || user.id

    // Get user points
    const userPoints = await db.collection('user_points').findOne({
      userId,
      schoolId: user.schoolId
    })

    // Get user achievements
    const achievements = await db.collection('user_achievements')
      .find({
        userId,
        schoolId: user.schoolId
      })
      .sort({ earnedAt: -1 })
      .toArray()

    // Get leaderboard position
    const leaderboardPosition = await getLeaderboardPosition(db, userId, user.schoolId)

    const result = {
      points: userPoints || {
        totalPoints: 0,
        attendanceStreak: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastAttendanceDate: null
      },
      achievements,
      leaderboardPosition
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching gamification points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/gamification/points - Award points for activities
export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { userId, activityType, points, metadata = {} } = body

    if (!userId || !activityType || !points) {
      return NextResponse.json({ error: 'userId, activityType, and points are required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Record the activity
    const activity = {
      id: require('crypto').randomUUID(),
      userId,
      schoolId: user.schoolId,
      activityType,
      points: parseInt(points),
      metadata,
      awardedAt: new Date().toISOString()
    }

    await db.collection('gamification_activities').insertOne(activity)

    // Update user points
    await updateUserPoints(db, userId, user.schoolId, activityType, points, metadata)

    // Check for achievements
    await checkAchievements(db, userId, user.schoolId, activityType)

    return NextResponse.json({ success: true, activity })

  } catch (error) {
    console.error('Error awarding points:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to update user points
async function updateUserPoints(db, userId, schoolId, activityType, points, metadata) {
  const updateData = { $inc: { totalPoints: points } }

  // Special handling for attendance streaks
  if (activityType === 'attendance') {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    const existingPoints = await db.collection('user_points').findOne({ userId, schoolId })

    if (existingPoints) {
      const lastDate = existingPoints.lastAttendanceDate

      if (lastDate === yesterday) {
        // Continue streak
        updateData.$inc.currentStreak = 1
        updateData.$inc.attendanceStreak = 1
        updateData.$set = {
          lastAttendanceDate: today,
          longestStreak: Math.max(existingPoints.longestStreak || 0, (existingPoints.currentStreak || 0) + 1)
        }
      } else if (lastDate !== today) {
        // Reset streak
        updateData.$set = {
          currentStreak: 1,
          attendanceStreak: 1,
          lastAttendanceDate: today,
          longestStreak: Math.max(existingPoints.longestStreak || 0, 1)
        }
      }
    } else {
      // First attendance
      updateData.$set = {
        currentStreak: 1,
        attendanceStreak: 1,
        lastAttendanceDate: today,
        longestStreak: 1
      }
    }
  }

  await db.collection('user_points').updateOne(
    { userId, schoolId },
    updateData,
    { upsert: true }
  )
}

// Helper function to check for achievements
async function checkAchievements(db, userId, schoolId, activityType) {
  const userPoints = await db.collection('user_points').findOne({ userId, schoolId })
  if (!userPoints) return

  const achievements = []

  // Attendance streak achievements
  if (activityType === 'attendance') {
    const streak = userPoints.currentStreak || 0

    if (streak === 5 && !await hasAchievement(db, userId, schoolId, 'streak_5')) {
      achievements.push({
        id: require('crypto').randomUUID(),
        userId,
        schoolId,
        achievementType: 'streak_5',
        title: 'Attendance Champion',
        description: 'Maintained a 5-day attendance streak',
        points: 50,
        earnedAt: new Date().toISOString()
      })
    }

    if (streak === 10 && !await hasAchievement(db, userId, schoolId, 'streak_10')) {
      achievements.push({
        id: require('crypto').randomUUID(),
        userId,
        schoolId,
        achievementType: 'streak_10',
        title: 'Perfect Attendance',
        description: 'Maintained a 10-day attendance streak',
        points: 100,
        earnedAt: new Date().toISOString()
      })
    }

    if (streak === 30 && !await hasAchievement(db, userId, schoolId, 'streak_30')) {
      achievements.push({
        id: require('crypto').randomUUID(),
        userId,
        schoolId,
        achievementType: 'streak_30',
        title: 'Attendance Legend',
        description: 'Maintained a 30-day attendance streak',
        points: 500,
        earnedAt: new Date().toISOString()
      })
    }
  }

  // Points-based achievements
  const totalPoints = userPoints.totalPoints || 0

  if (totalPoints >= 100 && !await hasAchievement(db, userId, schoolId, 'points_100')) {
    achievements.push({
      id: require('crypto').randomUUID(),
      userId,
      schoolId,
      achievementType: 'points_100',
      title: 'Rising Star',
      description: 'Earned 100 points',
      points: 25,
      earnedAt: new Date().toISOString()
    })
  }

  if (totalPoints >= 500 && !await hasAchievement(db, userId, schoolId, 'points_500')) {
    achievements.push({
      id: require('crypto').randomUUID(),
      userId,
      schoolId,
      achievementType: 'points_500',
      title: 'High Achiever',
      description: 'Earned 500 points',
      points: 100,
      earnedAt: new Date().toISOString()
    })
  }

  if (totalPoints >= 1000 && !await hasAchievement(db, userId, schoolId, 'points_1000')) {
    achievements.push({
      id: require('crypto').randomUUID(),
      userId,
      schoolId,
      achievementType: 'points_1000',
      title: 'Elite Performer',
      description: 'Earned 1000 points',
      points: 250,
      earnedAt: new Date().toISOString()
    })
  }

  // Insert achievements
  if (achievements.length > 0) {
    await db.collection('user_achievements').insertMany(achievements)

    // Award achievement points
    for (const achievement of achievements) {
      await updateUserPoints(db, userId, schoolId, 'achievement', achievement.points, {
        achievementType: achievement.achievementType,
        title: achievement.title
      })
    }
  }
}

// Helper function to check if user has achievement
async function hasAchievement(db, userId, schoolId, achievementType) {
  const count = await db.collection('user_achievements').countDocuments({
    userId,
    schoolId,
    achievementType
  })
  return count > 0
}

// Helper function to get leaderboard position
async function getLeaderboardPosition(db, userId, schoolId) {
  const pipeline = [
    { $match: { schoolId } },
    { $sort: { totalPoints: -1, longestStreak: -1 } },
    {
      $group: {
        _id: null,
        users: { $push: { userId: '$userId', totalPoints: '$totalPoints' } }
      }
    }
  ]

  const result = await db.collection('user_points').aggregate(pipeline).toArray()

  if (result.length === 0) return null

  const users = result[0].users
  const position = users.findIndex(user => user.userId === userId) + 1

  return {
    position,
    totalUsers: users.length,
    points: users[position - 1]?.totalPoints || 0
  }
}
