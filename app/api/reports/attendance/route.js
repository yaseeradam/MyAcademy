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

// GET /api/reports/attendance - Generate attendance reports
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const reportType = searchParams.get('type') || 'summary' // 'summary', 'detailed', 'student', 'class'
    const classId = searchParams.get('classId')
    const studentId = searchParams.get('studentId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const format = searchParams.get('format') || 'json' // 'json', 'csv', 'pdf'

    // Build date filter
    const dateFilter = {}
    if (startDate) dateFilter.$gte = new Date(startDate)
    if (endDate) dateFilter.$lte = new Date(endDate)

    let reportData

    switch (reportType) {
      case 'summary':
        reportData = await generateAttendanceSummary(db, user.schoolId, dateFilter, classId)
        break
      case 'detailed':
        reportData = await generateDetailedAttendance(db, user.schoolId, dateFilter, classId)
        break
      case 'student':
        if (!studentId) {
          return NextResponse.json({ error: 'Student ID required for student report' }, { status: 400 })
        }
        reportData = await generateStudentAttendance(db, user.schoolId, studentId, dateFilter)
        break
      case 'class':
        if (!classId) {
          return NextResponse.json({ error: 'Class ID required for class report' }, { status: 400 })
        }
        reportData = await generateClassAttendance(db, user.schoolId, classId, dateFilter)
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
          'Content-Disposition': `attachment; filename="attendance_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else if (format === 'pdf') {
      // For PDF, we'll return JSON for now - PDF generation would require additional setup
      return NextResponse.json({
        ...reportData,
        note: 'PDF format requires additional PDF generation library setup'
      })
    }

    return NextResponse.json(reportData)

  } catch (error) {
    console.error('Error generating attendance report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Generate attendance summary report
async function generateAttendanceSummary(db, schoolId, dateFilter, classId) {
  const matchFilter = { schoolId }
  if (classId) matchFilter.classId = classId
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.date = dateFilter
  }

  const attendanceStats = await db.collection('attendance').aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: {
          classId: '$classId',
          status: '$status'
        },
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: '$_id.classId',
        totalPresent: {
          $sum: { $cond: [{ $eq: ['$_id.status', 'present'] }, '$count', 0] }
        },
        totalAbsent: {
          $sum: { $cond: [{ $eq: ['$_id.status', 'absent'] }, '$count', 0] }
        },
        totalLate: {
          $sum: { $cond: [{ $eq: ['$_id.status', 'late'] }, '$count', 0] }
        },
        totalExcused: {
          $sum: { $cond: [{ $eq: ['$_id.status', 'excused'] }, '$count', 0] }
        },
        totalRecords: { $sum: '$count' }
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: '_id',
        foreignField: 'id',
        as: 'class'
      }
    },
    {
      $unwind: {
        path: '$class',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        classId: '$_id',
        className: '$class.name',
        totalPresent: 1,
        totalAbsent: 1,
        totalLate: 1,
        totalExcused: 1,
        totalRecords: 1,
        attendanceRate: {
          $multiply: [
            { $divide: ['$totalPresent', '$totalRecords'] },
            100
          ]
        }
      }
    },
    { $sort: { attendanceRate: -1 } }
  ]).toArray()

  return {
    reportType: 'attendance_summary',
    generatedAt: new Date().toISOString(),
    schoolId,
    data: attendanceStats,
    summary: {
      totalClasses: attendanceStats.length,
      averageAttendanceRate: attendanceStats.length > 0
        ? attendanceStats.reduce((sum, cls) => sum + cls.attendanceRate, 0) / attendanceStats.length
        : 0
    }
  }
}

// Generate detailed attendance report
async function generateDetailedAttendance(db, schoolId, dateFilter, classId) {
  const matchFilter = { schoolId }
  if (classId) matchFilter.classId = classId
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.date = dateFilter
  }

  const attendanceRecords = await db.collection('attendance').aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: 'students',
        localField: 'studentId',
        foreignField: 'id',
        as: 'student'
      }
    },
    {
      $lookup: {
        from: 'classes',
        localField: 'classId',
        foreignField: 'id',
        as: 'class'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'markedBy',
        foreignField: 'id',
        as: 'teacher'
      }
    },
    {
      $unwind: { path: '$student', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        date: 1,
        status: 1,
        notes: 1,
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        studentId: '$student.admissionNumber',
        className: '$class.name',
        teacherName: '$teacher.name',
        markedAt: 1
      }
    },
    { $sort: { date: -1, studentName: 1 } }
  ]).toArray()

  return {
    reportType: 'attendance_detailed',
    generatedAt: new Date().toISOString(),
    schoolId,
    data: attendanceRecords,
    summary: {
      totalRecords: attendanceRecords.length,
      presentCount: attendanceRecords.filter(r => r.status === 'present').length,
      absentCount: attendanceRecords.filter(r => r.status === 'absent').length,
      lateCount: attendanceRecords.filter(r => r.status === 'late').length,
      excusedCount: attendanceRecords.filter(r => r.status === 'excused').length
    }
  }
}

// Generate student-specific attendance report
async function generateStudentAttendance(db, schoolId, studentId, dateFilter) {
  const matchFilter = { schoolId, studentId }
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.date = dateFilter
  }

  const attendanceRecords = await db.collection('attendance').aggregate([
    { $match: matchFilter },
    {
      $lookup: {
        from: 'classes',
        localField: 'classId',
        foreignField: 'id',
        as: 'class'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'markedBy',
        foreignField: 'id',
        as: 'teacher'
      }
    },
    {
      $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
    },
    {
      $sort: { date: -1 }
    }
  ]).toArray()

  // Calculate attendance statistics
  const totalDays = attendanceRecords.length
  const presentDays = attendanceRecords.filter(r => r.status === 'present').length
  const absentDays = attendanceRecords.filter(r => r.status === 'absent').length
  const lateDays = attendanceRecords.filter(r => r.status === 'late').length
  const excusedDays = attendanceRecords.filter(r => r.status === 'excused').length

  const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0

  // Get student info
  const student = await db.collection('students').findOne({ id: studentId, schoolId })

  return {
    reportType: 'student_attendance',
    generatedAt: new Date().toISOString(),
    schoolId,
    student: {
      id: student?.id,
      name: `${student?.firstName} ${student?.lastName}`,
      admissionNumber: student?.admissionNumber,
      class: student?.classId
    },
    data: attendanceRecords,
    summary: {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      excusedDays,
      attendanceRate: Math.round(attendanceRate * 100) / 100
    }
  }
}

// Generate class-specific attendance report
async function generateClassAttendance(db, schoolId, classId, dateFilter) {
  const matchFilter = { schoolId, classId }
  if (Object.keys(dateFilter).length > 0) {
    matchFilter.date = dateFilter
  }

  // Get all students in the class
  const students = await db.collection('students')
    .find({ schoolId, classId })
    .project({ id: 1, firstName: 1, lastName: 1, admissionNumber: 1 })
    .toArray()

  // Get attendance records for the date range
  const attendanceRecords = await db.collection('attendance')
    .find(matchFilter)
    .sort({ date: 1 })
    .toArray()

  // Group by student
  const studentAttendance = {}

  students.forEach(student => {
    studentAttendance[student.id] = {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      admissionNumber: student.admissionNumber,
      attendance: {}
    }
  })

  // Fill in attendance data
  attendanceRecords.forEach(record => {
    const dateStr = record.date.split('T')[0]
    if (studentAttendance[record.studentId]) {
      studentAttendance[record.studentId].attendance[dateStr] = record.status
    }
  })

  // Get unique dates
  const dates = [...new Set(attendanceRecords.map(r => r.date.split('T')[0]))].sort()

  // Get class info
  const classInfo = await db.collection('classes').findOne({ id: classId, schoolId })

  return {
    reportType: 'class_attendance',
    generatedAt: new Date().toISOString(),
    schoolId,
    class: {
      id: classInfo?.id,
      name: classInfo?.name,
      capacity: classInfo?.capacity
    },
    dates,
    data: Object.values(studentAttendance),
    summary: {
      totalStudents: students.length,
      totalDays: dates.length,
      averageAttendance: Object.values(studentAttendance).length > 0
        ? Object.values(studentAttendance).reduce((sum, student) => {
            const presentDays = Object.values(student.attendance).filter(status => status === 'present').length
            return sum + (presentDays / dates.length)
          }, 0) / Object.values(studentAttendance).length * 100
        : 0
    }
  }
}

// Convert data to CSV format
function convertToCSV(data) {
  if (!data.data || !Array.isArray(data.data)) {
    return 'No data available'
  }

  const headers = Object.keys(data.data[0] || {}).join(',')
  const rows = data.data.map(row =>
    Object.values(row).map(value =>
      typeof value === 'string' && value.includes(',') ? `"${value}"` : value
    ).join(',')
  )

  return [headers, ...rows].join('\n')
}
