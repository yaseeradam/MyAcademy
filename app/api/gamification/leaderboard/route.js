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

// GET /api/gamification/leaderboard - Get leaderboard rankings
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'points' // 'points', 'attendance', 'achievements'
    const limit = parseInt(searchParams.get('limit')) || 10
    const period = searchParams.get('period') || 'all' // 'week', 'month', 'all'

    let pipeline = []

    // Base match for school
    pipeline.push({ $match: { schoolId: user.schoolId } })

    // Add time period filter if needed
    if (period !== 'all') {
      const now = new Date()
      let startDate

      if (period === 'week') {
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
      }

      if (startDate) {
        pipeline.push({
          $lookup: {
            from: 'gamification_activities',
            localField: 'userId',
            foreignField: 'userId',
            as: 'activities'
          }
        })
        pipeline.push({
          $match: {
            'activities.awardedAt': { $gte: startDate.toISOString() }
          }
        })
      }
    }

    // Sort based on type
    let sortField = 'totalPoints'
    if (type === 'attendance') {
      sortField = 'longestStreak'
    } else if (type === 'achievements') {
      // For achievements, we need to count achievements per user
      pipeline = [
        { $match: { schoolId: user.schoolId } },
        {
          $lookup: {
            from: 'user_achievements',
            localField: 'userId',
            foreignField: 'userId',
            as: 'achievements'
          }
        },
        {
          $addFields: {
            achievementCount: { $size: '$achievements' }
          }
        },
        { $sort: { achievementCount: -1, totalPoints: -1 } }
      ]
      sortField = 'achievementCount'
    } else {
      pipeline.push({ $sort: { [sortField]: -1, longestStreak: -1 } })
    }

    // Limit results
    pipeline.push({ $limit: limit })

    // Lookup user details
    pipeline.push({
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: 'id',
        as: 'user'
      }
    })

    pipeline.push({
      $unwind: {
        path: '$user',
        preserveNullAndEmptyArrays: true
      }
    })

    // Project final result
    pipeline.push({
      $project: {
        _id: 0,
        userId: 1,
        name: '$user.name',
        role: '$user.role',
        totalPoints: 1,
        currentStreak: 1,
        longestStreak: 1,
        achievementCount: type === 'achievements' ? 1 : { $size: { $ifNull: ['$achievements', []] } },
        rank: { $add: ['$rank', 1] } // This will be set after aggregation
      }
    })

    const leaderboard = await db.collection('user_points').aggregate(pipeline).toArray()

    // Add rank numbers
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1
    })

    // Get current user's position
    const userPosition = await getUserPosition(db, user.id, user.schoolId, type, period)

    return NextResponse.json({
      leaderboard,
      userPosition,
      type,
      period,
      limit
    })

  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Helper function to get user's position in leaderboard
async function getUserPosition(db, userId, schoolId, type, period) {
  let pipeline = [
    { $match: { schoolId } }
  ]

  // Add time period filter if needed
  if (period !== 'all') {
    const now = new Date()
    let startDate

    if (period === 'week') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    } else if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    if (startDate) {
      pipeline.push({
        $lookup: {
          from: 'gamification_activities',
          localField: 'userId',
          foreignField: 'userId',
          as: 'activities'
        }
      })
      pipeline.push({
        $match: {
          'activities.awardedAt': { $gte: startDate.toISOString() }
        }
      })
    }
  }

  // Sort based on type
  let sortField = 'totalPoints'
  if (type === 'attendance') {
    sortField = 'longestStreak'
  } else if (type === 'achievements') {
    pipeline = [
      { $match: { schoolId } },
      {
        $lookup: {
          from: 'user_achievements',
          localField: 'userId',
          foreignField: 'userId',
          as: 'achievements'
        }
      },
      {
        $addFields: {
          achievementCount: { $size: '$achievements' }
        }
      },
      { $sort: { achievementCount: -1, totalPoints: -1 } }
    ]
  } else {
    pipeline.push({ $sort: { [sortField]: -1, longestStreak: -1 } })
  }

  const allUsers = await db.collection('user_points').aggregate(pipeline).toArray()

  const userIndex = allUsers.findIndex(user => user.userId === userId)
  const position = userIndex + 1

  if (userIndex === -1) {
    return {
      position: null,
      totalUsers: allUsers.length,
      message: 'Not ranked yet'
    }
  }

  const userData = allUsers[userIndex]

  return {
    position,
    totalUsers: allUsers.length,
    points: userData.totalPoints || 0,
    streak: userData.longestStreak || 0,
    achievements: type === 'achievements' ? userData.achievementCount || 0 : undefined
  }
}
