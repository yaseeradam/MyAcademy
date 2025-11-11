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

// GET /api/search - Global search across multiple collections
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'all' // 'all', 'students', 'teachers', 'parents', 'attendance', 'classes'
    const limit = parseInt(searchParams.get('limit')) || 20
    const offset = parseInt(searchParams.get('offset')) || 0

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 })
    }

    const searchRegex = new RegExp(query, 'i')
    const results = {}

    // Search based on user role and type
    const searchFilters = {
      schoolId: user.role === 'developer' ? undefined : user.schoolId
    }

    switch (type) {
      case 'students':
        results.students = await searchStudents(db, searchRegex, searchFilters, limit, offset)
        break
      case 'teachers':
        results.teachers = await searchTeachers(db, searchRegex, searchFilters, limit, offset)
        break
      case 'parents':
        results.parents = await searchParents(db, searchRegex, searchFilters, limit, offset)
        break
      case 'attendance':
        results.attendance = await searchAttendance(db, searchRegex, searchFilters, limit, offset)
        break
      case 'classes':
        results.classes = await searchClasses(db, searchRegex, searchFilters, limit, offset)
        break
      case 'all':
      default:
        // Search all relevant collections
        const [students, teachers, parents, attendance, classes] = await Promise.all([
          searchStudents(db, searchRegex, searchFilters, Math.ceil(limit/5), 0),
          searchTeachers(db, searchRegex, searchFilters, Math.ceil(limit/5), 0),
          searchParents(db, searchRegex, searchFilters, Math.ceil(limit/5), 0),
          searchAttendance(db, searchRegex, searchFilters, Math.ceil(limit/5), 0),
          searchClasses(db, searchRegex, searchFilters, Math.ceil(limit/5), 0)
        ])

        results.students = students
        results.teachers = teachers
        results.parents = parents
        results.attendance = attendance
        results.classes = classes
        break
    }

    return NextResponse.json({
      query,
      type,
      results,
      total: Object.values(results).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    })

  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Search students
async function searchStudents(db, searchRegex, filters, limit, offset) {
  const matchConditions = {
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { admissionNumber: searchRegex },
      { phoneNumber: searchRegex }
    ],
    active: true
  }

  if (filters.schoolId) matchConditions.schoolId = filters.schoolId

  const students = await db.collection('students').aggregate([
    { $match: matchConditions },
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
        localField: 'parentId',
        foreignField: 'id',
        as: 'parent'
      }
    },
    {
      $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$parent', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        admissionNumber: 1,
        phoneNumber: 1,
        className: '$class.name',
        parentName: '$parent.name',
        profileImage: 1,
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: offset },
    { $limit: limit }
  ]).toArray()

  return students
}

// Search teachers
async function searchTeachers(db, searchRegex, filters, limit, offset) {
  const matchConditions = {
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { email: searchRegex },
      { employeeId: searchRegex },
      { phoneNumber: searchRegex },
      { specialization: searchRegex }
    ],
    active: true
  }

  if (filters.schoolId) matchConditions.schoolId = filters.schoolId

  const teachers = await db.collection('teachers').aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'teacher_assignments',
        localField: 'id',
        foreignField: 'teacherId',
        as: 'assignments'
      }
    },
    {
      $project: {
        id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        employeeId: 1,
        phoneNumber: 1,
        specialization: 1,
        qualification: 1,
        profileImage: 1,
        assignmentCount: { $size: '$assignments' },
        subjects: {
          $map: {
            input: '$assignments',
            in: '$$this.subjectName'
          }
        },
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: offset },
    { $limit: limit }
  ]).toArray()

  return teachers
}

// Search parents
async function searchParents(db, searchRegex, filters, limit, offset) {
  const matchConditions = {
    $or: [
      { name: searchRegex },
      { email: searchRegex },
      { phoneNumber: searchRegex }
    ],
    role: 'parent'
  }

  if (filters.schoolId) matchConditions.schoolId = filters.schoolId

  const parents = await db.collection('users').aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'students',
        localField: 'id',
        foreignField: 'parentId',
        as: 'children'
      }
    },
    {
      $project: {
        id: 1,
        name: 1,
        email: 1,
        phoneNumber: 1,
        childrenCount: { $size: '$children' },
        children: {
          $map: {
            input: { $slice: ['$children', 3] }, // Show up to 3 children
            in: {
              name: { $concat: ['$$this.firstName', ' ', '$$this.lastName'] },
              className: '$$this.className'
            }
          }
        },
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: offset },
    { $limit: limit }
  ]).toArray()

  return parents
}

// Search attendance records
async function searchAttendance(db, searchRegex, filters, limit, offset) {
  // Search by student name, admission number, or status
  const studentMatch = {
    $or: [
      { firstName: searchRegex },
      { lastName: searchRegex },
      { admissionNumber: searchRegex }
    ]
  }

  if (filters.schoolId) studentMatch.schoolId = filters.schoolId

  const attendanceRecords = await db.collection('attendance').aggregate([
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
      $unwind: '$student'
    },
    {
      $unwind: { path: '$class', preserveNullAndEmptyArrays: true }
    },
    {
      $unwind: { path: '$teacher', preserveNullAndEmptyArrays: true }
    },
    {
      $match: {
        $and: [
          filters.schoolId ? { 'student.schoolId': filters.schoolId } : {},
          {
            $or: [
              { 'student.firstName': searchRegex },
              { 'student.lastName': searchRegex },
              { 'student.admissionNumber': searchRegex },
              { status: searchRegex },
              { remarks: searchRegex }
            ]
          }
        ]
      }
    },
    {
      $project: {
        id: 1,
        date: 1,
        status: 1,
        remarks: 1,
        studentName: { $concat: ['$student.firstName', ' ', '$student.lastName'] },
        studentId: '$student.admissionNumber',
        className: '$class.name',
        teacherName: '$teacher.name',
        createdAt: 1
      }
    },
    { $sort: { date: -1 } },
    { $skip: offset },
    { $limit: limit }
  ]).toArray()

  return attendanceRecords
}

// Search classes
async function searchClasses(db, searchRegex, filters, limit, offset) {
  const matchConditions = {
    $or: [
      { name: searchRegex },
      { description: searchRegex }
    ],
    active: true
  }

  if (filters.schoolId) matchConditions.schoolId = filters.schoolId

  const classes = await db.collection('classes').aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'students',
        localField: 'id',
        foreignField: 'classId',
        as: 'students'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'classTeacherId',
        foreignField: 'id',
        as: 'classTeacher'
      }
    },
    {
      $lookup: {
        from: 'teacher_assignments',
        localField: 'id',
        foreignField: 'classId',
        as: 'assignments'
      }
    },
    {
      $unwind: { path: '$classTeacher', preserveNullAndEmptyArrays: true }
    },
    {
      $project: {
        id: 1,
        name: 1,
        description: 1,
        capacity: 1,
        academicYear: 1,
        studentCount: { $size: '$students' },
        classTeacherName: '$classTeacher.name',
        subjectCount: { $size: '$assignments' },
        utilizationRate: {
          $multiply: [
            { $divide: [{ $size: '$students' }, '$capacity'] },
            100
          ]
        },
        createdAt: 1
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: offset },
    { $limit: limit }
  ]).toArray()

  return classes
}
