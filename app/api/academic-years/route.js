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

// GET - List academic years
export async function GET(request) {
    try {
        const user = verifyToken(request)
        if (!user || !['school_admin', 'teacher'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const db = await connectDB()
        const academicYears = await db.collection('academic_years')
            .find({ schoolId: user.schoolId })
            .sort({ startDate: -1 })
            .toArray()

        return NextResponse.json(academicYears)
    } catch (error) {
        console.error('Academic years GET error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Create academic year
export async function POST(request) {
    try {
        const user = verifyToken(request)
        if (!user || user.role !== 'school_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { name, startDate, endDate, terms } = body

        if (!name || !startDate || !endDate) {
            return NextResponse.json({ error: 'Name, start date, and end date are required' }, { status: 400 })
        }

        const db = await connectDB()

        // Check for existing academic year with same name
        const existing = await db.collection('academic_years').findOne({
            schoolId: user.schoolId,
            name
        })

        if (existing) {
            return NextResponse.json({ error: 'Academic year with this name already exists' }, { status: 400 })
        }

        // Set any existing active year to completed if creating a new active one
        await db.collection('academic_years').updateMany(
            { schoolId: user.schoolId, status: 'active' },
            { $set: { status: 'completed' } }
        )

        const newAcademicYear = {
            id: uuidv4(),
            schoolId: user.schoolId,
            name,
            startDate,
            endDate,
            status: 'active',
            terms: terms || [
                { name: 'First Term', startDate: null, endDate: null, completed: false },
                { name: 'Second Term', startDate: null, endDate: null, completed: false },
                { name: 'Third Term', startDate: null, endDate: null, completed: false }
            ],
            createdAt: new Date().toISOString(),
            createdBy: user.id
        }

        await db.collection('academic_years').insertOne(newAcademicYear)

        return NextResponse.json(newAcademicYear, { status: 201 })
    } catch (error) {
        console.error('Academic years POST error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// PUT - Update academic year
export async function PUT(request) {
    try {
        const user = verifyToken(request)
        if (!user || user.role !== 'school_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({ error: 'Academic year ID is required' }, { status: 400 })
        }

        const db = await connectDB()

        // If setting to active, make sure other years are not active
        if (updates.status === 'active') {
            await db.collection('academic_years').updateMany(
                { schoolId: user.schoolId, status: 'active', id: { $ne: id } },
                { $set: { status: 'completed' } }
            )
        }

        const result = await db.collection('academic_years').updateOne(
            { id, schoolId: user.schoolId },
            { $set: { ...updates, updatedAt: new Date().toISOString() } }
        )

        if (result.matchedCount === 0) {
            return NextResponse.json({ error: 'Academic year not found' }, { status: 404 })
        }

        const updated = await db.collection('academic_years').findOne({ id, schoolId: user.schoolId })
        return NextResponse.json(updated)
    } catch (error) {
        console.error('Academic years PUT error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Delete academic year
export async function DELETE(request) {
    try {
        const user = verifyToken(request)
        if (!user || user.role !== 'school_admin') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Academic year ID is required' }, { status: 400 })
        }

        const db = await connectDB()

        // Check if there are any promotion records for this year
        const hasPromotions = await db.collection('promotion_records').findOne({
            schoolId: user.schoolId,
            $or: [{ fromAcademicYear: id }, { toAcademicYear: id }]
        })

        if (hasPromotions) {
            return NextResponse.json({
                error: 'Cannot delete academic year with promotion records'
            }, { status: 400 })
        }

        const result = await db.collection('academic_years').deleteOne({
            id,
            schoolId: user.schoolId
        })

        if (result.deletedCount === 0) {
            return NextResponse.json({ error: 'Academic year not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Academic years DELETE error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
