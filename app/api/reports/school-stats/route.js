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

// GET /api/reports/school-stats - Generate school statistics reports
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'overview' // 'overview', 'detailed', 'trends'
    const schoolId = searchParams.get('schoolId')
    const format = searchParams.get('format') || 'json' // 'json', 'csv', 'pdf'

    // Only developers can see all schools, others see their own school
    const targetSchoolId = user.role === 'developer' ? schoolId : user.schoolId

    let reportData

    switch (reportType) {
      case 'overview':
        reportData = await generateSchoolOverview(db, targetSchoolId)
        break
      case 'detailed':
        reportData = await generateDetailedStats(db, targetSchoolId)
        break
      case 'trends':
        reportData = await generateTrendsReport(db, targetSchoolId)
        break
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 })
    }

    // Format response based on requested format
    if (format === 'csv') {
      const csvData = convertToCSV(reportData)
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="school_stats_${reportType}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      return NextResponse.json({
        ...reportData,
        note: 'PDF format requires additional PDF generation library setup'
      })
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Error generating school stats report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generate school overview report
async function generateSchoolOverview(db, schoolId) {
  // Get basic counts
  const [
    totalStudents,
    totalTeachers,
    totalParents,
    totalClasses,
    totalSubjects,
    activeUsers,
    recentAttendance,
    totalRevenue,
    genderDistribution,
    newEnrollments
  ] = await Promise.all([
    db.collection('students').countDocuments({ schoolId }),
    db.collection('teachers').countDocuments({ schoolId }),
    db.collection('parents').countDocuments({ schoolId }),
    db.collection('classes').countDocuments({ schoolId }),
    db.collection('subjects').countDocuments({ schoolId }),
    db.collection('users').countDocuments({ schoolId, active: true }),
    // Recent attendance (last 30 days)
    db.collection('attendance').countDocuments({
      schoolId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    }),
    // Total revenue from completed payments
    db.collection('payments').aggregate([
      { $match: { schoolId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray().then(result => result[0]?.total || 0),
    // Gender distribution
    db.collection('students').aggregate([
      { $match: { schoolId } },
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]).toArray(),
    // New enrollments (last 30 days)
    db.collection('students').countDocuments({
      schoolId,
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
    })
  ])

  // Get attendance rate for last 30 days
  const attendanceStats = await db.collection('attendance').aggregate([
    {
      $match: {
        schoolId,
        date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]).toArray()

  const totalAttendanceRecords = attendanceStats.reduce((sum, stat) => sum + stat.count, 0)
  const presentRecords = attendanceStats.find(stat => stat._id === 'present')?.count || 0
  const attendanceRate = totalAttendanceRecords > 0 ? (presentRecords / totalAttendanceRecords) * 100 : 0

  // Get class utilization
  const classUtilization = await db.collection('classes').aggregate([
    { $match: { schoolId } },
    {
      $lookup: {
        from: 'students',
        localField: 'id',
        foreignField: 'classId',
        as: 'students'
      }
    },
    {
      $project: {
        className: '$name',
        capacity: 1,
        enrolled: { $size: '$students' },
        utilizationRate: {
          $multiply: [
            { $divide: [{ $size: '$students' }, '$capacity'] },
            100
          ]
        }
      }
    },
    { $sort: { utilizationRate: -1 } }
  ]).toArray()

  // Get school info
  const school = await db.collection('schools').findOne({ id: schoolId })

  return {
    reportType: 'school_overview',
    generatedAt: new Date().toISOString(),
    schoolId,
    school: {
      name: school?.name,
      subscriptionStatus: school?.subscriptionStatus,
      subscriptionPlan: school?.subscriptionPlanId
    },
    overview: {
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      totalSubjects,
      activeUsers,
      recentAttendanceRecords: recentAttendance,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      totalRevenue,
      genderDistribution,
      newEnrollments
    },
    classUtilization: classUtilization.slice(0, 5), // Top 5 classes by utilization
    summary: {
      studentTeacherRatio: totalTeachers > 0 ? Math.round((totalStudents / totalTeachers) * 100) / 100 : 0,
      averageClassSize: totalClasses > 0 ? Math.round((totalStudents / totalClasses) * 100) / 100 : 0,
      overallUtilization: classUtilization.length > 0
        ? Math.round(classUtilization.reduce((sum, cls) => sum + cls.utilizationRate, 0) / classUtilization.length * 100) / 100
        : 0
    }
  }
}

// Generate detailed statistics report
async function generateDetailedStats(db, schoolId) {
  // User distribution by role
  const userRoles = await db.collection('users').aggregate([
    { $match: { schoolId } },
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 },
        active: { $sum: { $cond: ['$active', 1, 0] } }
      }
    }
  ]).toArray()

  // Student distribution by class
  const studentByClass = await db.collection('classes').aggregate([
    { $match: { schoolId } },
    {
      $lookup: {
        from: 'students',
        localField: 'id',
        foreignField: 'classId',
        as: 'students'
      }
    },
    {
      $project: {
        className: '$name',
        studentCount: { $size: '$students' },
        capacity: 1,
        academicYear: 1
      }
    },
    { $sort: { studentCount: -1 } }
  ]).toArray()

  // Teacher workload (classes per teacher)
  const teacherWorkload = await db.collection('users').aggregate([
    { $match: { schoolId, role: 'teacher' } },
    {
      $lookup: {
        from: 'assignments',
        localField: 'id',
        foreignField: 'teacherId',
        as: 'assignments'
      }
    },
    {
      $project: {
        teacherName: '$name',
        assignmentCount: { $size: '$assignments' },
        subjects: {
          $map: {
            input: '$assignments',
            in: '$$this.subjectName'
          }
        }
      }
    },
    { $sort: { assignmentCount: -1 } }
  ]).toArray()

  // Monthly activity trends (last 6 months)
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const monthlyActivity = await db.collection('attendance').aggregate([
    {
      $match: {
        schoolId,
        date: { $gte: sixMonthsAgo.toISOString() }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: { $dateFromString: { dateString: '$date' } } },
          month: { $month: { $dateFromString: { dateString: '$date' } } }
        },
        totalRecords: { $sum: 1 },
        presentCount: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } }
      }
    },
    {
      $project: {
        period: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        totalRecords: 1,
        presentCount: 1,
        attendanceRate: {
          $multiply: [
            { $divide: ['$presentCount', '$totalRecords'] },
            100
          ]
        }
      }
    },
    { $sort: { period: 1 } }
  ]).toArray()

  return {
    reportType: 'school_detailed_stats',
    generatedAt: new Date().toISOString(),
    schoolId,
    userDistribution: userRoles,
    studentByClass,
    teacherWorkload,
    monthlyActivity,
    summary: {
      totalUsers: userRoles.reduce((sum, role) => sum + role.count, 0),
      activeUsers: userRoles.reduce((sum, role) => sum + role.active, 0),
      totalEnrolledStudents: studentByClass.reduce((sum, cls) => sum + cls.studentCount, 0),
      averageClassSize: studentByClass.length > 0
        ? Math.round(studentByClass.reduce((sum, cls) => sum + cls.studentCount, 0) / studentByClass.length * 100) / 100
        : 0,
      averageTeacherWorkload: teacherWorkload.length > 0
        ? Math.round(teacherWorkload.reduce((sum, teacher) => sum + teacher.assignmentCount, 0) / teacherWorkload.length * 100) / 100
        : 0
    }
  }
}

// Generate trends report
async function generateTrendsReport(db, schoolId) {
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  // User growth trend
  const userGrowth = await db.collection('users').aggregate([
    { $match: { schoolId, createdAt: { $gte: oneYearAgo.toISOString() } } },
    {
      $group: {
        _id: {
          year: { $year: { $dateFromString: { dateString: '$createdAt' } } },
          month: { $month: { $dateFromString: { dateString: '$createdAt' } } },
          role: '$role'
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        period: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        role: '$_id.role',
        count: 1
      }
    },
    { $sort: { period: 1, role: 1 } }
  ]).toArray()

  // Attendance trends
  const attendanceTrends = await db.collection('attendance').aggregate([
    { $match: { schoolId, date: { $gte: oneYearAgo.toISOString() } } },
    {
      $group: {
        _id: {
          year: { $year: { $dateFromString: { dateString: '$date' } } },
          month: { $month: { $dateFromString: { dateString: '$date' } } },
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $project: {
        period: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        status: '$_id.status',
        count: 1
      }
    },
    { $sort: { period: 1, status: 1 } }
  ]).toArray()

  // Revenue trends
  const revenueTrends = await db.collection('payments').aggregate([
    { $match: { schoolId, status: 'completed', createdAt: { $gte: oneYearAgo.toISOString() } } },
    {
      $group: {
        _id: {
          year: { $year: { $dateFromString: { dateString: '$createdAt' } } },
          month: { $month: { $dateFromString: { dateString: '$createdAt' } } }
        },
        totalRevenue: { $sum: '$amount' },
        transactionCount: { $sum: 1 }
      }
    },
    {
      $project: {
        period: {
          $concat: [
            { $toString: '$_id.year' },
            '-',
            {
              $cond: {
                if: { $lt: ['$_id.month', 10] },
                then: { $concat: ['0', { $toString: '$_id.month' }] },
                else: { $toString: '$_id.month' }
              }
            }
          ]
        },
        totalRevenue: 1,
        transactionCount: 1
      }
    },
    { $sort: { period: 1 } }
  ]).toArray()

  return {
    reportType: 'school_trends',
    generatedAt: new Date().toISOString(),
    schoolId,
    userGrowth,
    attendanceTrends,
    revenueTrends,
    summary: {
      userGrowthRate: calculateGrowthRate(userGrowth),
      attendanceTrend: calculateAttendanceTrend(attendanceTrends),
      revenueGrowthRate: calculateRevenueGrowth(revenueTrends)
    }
  }
}

// Helper functions for trend calculations
function calculateGrowthRate(userGrowth) {
  const periods = [...new Set(userGrowth.map(item => item.period))].sort()
  if (periods.length < 2) return 0

  const firstPeriod = periods[0]
  const lastPeriod = periods[periods.length - 1]

  const firstCount = userGrowth.filter(item => item.period === firstPeriod).reduce((sum, item) => sum + item.count, 0)
  const lastCount = userGrowth.filter(item => item.period === lastPeriod).reduce((sum, item) => sum + item.count, 0)

  return firstCount > 0 ? ((lastCount - firstCount) / firstCount) * 100 : 0
}

function calculateAttendanceTrend(attendanceTrends) {
  const periods = [...new Set(attendanceTrends.map(item => item.period))].sort()
  if (periods.length < 2) return 0

  const calculateRate = (period) => {
    const periodData = attendanceTrends.filter(item => item.period === period)
    const total = periodData.reduce((sum, item) => sum + item.count, 0)
    const present = periodData.find(item => item.status === 'present')?.count || 0
    return total > 0 ? (present / total) * 100 : 0
  }

  const firstRate = calculateRate(periods[0])
  const lastRate = calculateRate(periods[periods.length - 1])

  return lastRate - firstRate
}

function calculateRevenueGrowth(revenueTrends) {
  if (revenueTrends.length < 2) return 0

  const firstRevenue = revenueTrends[0].totalRevenue
  const lastRevenue = revenueTrends[revenueTrends.length - 1].totalRevenue

  return firstRevenue > 0 ? ((lastRevenue - firstRevenue) / firstRevenue) * 100 : 0
}

// Convert data to CSV format
function convertToCSV(data) {
  if (!data.data && !data.overview) {
    return 'No data available'
  }

  const targetData = data.data || data.overview
  if (!Array.isArray(targetData)) {
    return 'Data format not supported for CSV export'
  }

  const headers = Object.keys(targetData[0] || {}).join(',')
  const rows = targetData.map(row =>
    Object.values(row).map(value =>
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  )

  return [headers, ...rows].join('\n')
}
