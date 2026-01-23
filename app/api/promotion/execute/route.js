import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

let cachedDb = null

async function connectDB() {
    if (cachedDb) return cachedDb
    const client = new MongoClient(MONGO_URL)
    await client.connect()
    cachedDb = client.db(DB_NAME)
    return cachedDb
}

function verifyToken(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null
        const token = authHeader.slice(7)
        return jwt.verify(token, JWT_SECRET)
    } catch {
        return null
    }
}

// POST - Execute promotion
export async function POST(request) {
    try {
        const user = verifyToken(request)
        if (!user || user.role !== 'school_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { fromAcademicYear, toAcademicYear, students: studentActions } = body

        if (!fromAcademicYear || !toAcademicYear || !studentActions) {
            return NextResponse.json({
                error: 'From year, to year, and student actions are required'
            }, { status: 400 })
        }

        const db = await connectDB()

        // Get all classes for reference
        const classes = await db.collection('classes')
            .find({ schoolId: user.schoolId })
            .toArray()
        const classMap = new Map(classes.map(c => [c.id, c]))

        // Track results
        const results = {
            promoted: 0,
            repeated: 0,
            graduated: 0,
            errors: []
        }

        const promotionRecords = []

        // Process each student
        for (const { studentId, action } of studentActions) {
            try {
                const student = await db.collection('students').findOne({
                    id: studentId,
                    schoolId: user.schoolId
                })

                if (!student) {
                    results.errors.push({ studentId, error: 'Student not found' })
                    continue
                }

                const currentClass = classMap.get(student.classId)
                const currentClassName = currentClass?.name || 'Unknown'
                let newClassId = student.classId
                let newClassName = currentClassName
                let newStatus = student.status || 'active'

                if (action === 'promote') {
                    if (currentClass?.nextClassId) {
                        newClassId = currentClass.nextClassId
                        newClassName = classMap.get(newClassId)?.name || 'Unknown'
                    }
                    results.promoted++
                } else if (action === 'repeat') {
                    // Keep same class
                    results.repeated++
                } else if (action === 'graduate') {
                    newStatus = 'graduated'
                    results.graduated++
                }

                // Build class history entry
                const historyEntry = {
                    classId: student.classId,
                    className: currentClassName,
                    academicYear: fromAcademicYear,
                    status: action,
                    promotedAt: new Date().toISOString()
                }

                // Update student
                await db.collection('students').updateOne(
                    { id: studentId, schoolId: user.schoolId },
                    {
                        $set: {
                            classId: newClassId,
                            currentAcademicYear: toAcademicYear,
                            status: newStatus,
                            updatedAt: new Date().toISOString()
                        },
                        $push: {
                            classHistory: historyEntry
                        }
                    }
                )

                promotionRecords.push({
                    studentId,
                    studentName: student.name,
                    fromClassId: student.classId,
                    fromClassName: currentClassName,
                    toClassId: newClassId,
                    toClassName: newClassName,
                    status: action
                })
            } catch (err) {
                results.errors.push({ studentId, error: err.message })
            }
        }

        // Create promotion record
        const promotionRecord = {
            id: uuidv4(),
            schoolId: user.schoolId,
            fromAcademicYear,
            toAcademicYear,
            promotedAt: new Date().toISOString(),
            promotedBy: user.id,
            summary: {
                totalStudents: studentActions.length,
                promoted: results.promoted,
                repeated: results.repeated,
                graduated: results.graduated,
                errors: results.errors.length
            },
            records: promotionRecords
        }

        await db.collection('promotion_records').insertOne(promotionRecord)

        // Create or update academic year
        const existingYear = await db.collection('academic_years').findOne({
            schoolId: user.schoolId,
            name: toAcademicYear
        })

        if (!existingYear) {
            // Create new academic year
            const now = new Date()
            const startDate = new Date(now.getFullYear(), 8, 1).toISOString() // September 1st
            const endDate = new Date(now.getFullYear() + 1, 6, 31).toISOString() // July 31st next year

            await db.collection('academic_years').insertOne({
                id: uuidv4(),
                schoolId: user.schoolId,
                name: toAcademicYear,
                startDate,
                endDate,
                status: 'active',
                terms: [
                    { name: 'First Term', startDate: null, endDate: null, completed: false },
                    { name: 'Second Term', startDate: null, endDate: null, completed: false },
                    { name: 'Third Term', startDate: null, endDate: null, completed: false }
                ],
                createdAt: new Date().toISOString(),
                createdBy: user.id
            })
        } else {
            // Set as active
            await db.collection('academic_years').updateOne(
                { id: existingYear.id },
                { $set: { status: 'active' } }
            )
        }

        // Mark old year as completed
        await db.collection('academic_years').updateOne(
            { schoolId: user.schoolId, name: fromAcademicYear },
            { $set: { status: 'completed' } }
        )

        return NextResponse.json({
            success: true,
            promotionId: promotionRecord.id,
            summary: results
        })
    } catch (error) {
        console.error('Promotion execution error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
