import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

async function connectToDatabase() {
    const client = new MongoClient(MONGO_URL)
    await client.connect()
    return client.db(DB_NAME)
}

function verifyToken(request) {
    try {
        const authHeader = request.headers.get('authorization')
        if (!authHeader || !authHeader.startsWith('Bearer ')) return null
        const token = authHeader.substring(7)
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

export async function GET(request) {
    try {
        const user = verifyToken(request)
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const db = await connectToDatabase()
        const announcements = await db.collection('announcements')
            .find({ schoolId: user.schoolId })
            .sort({ createdAt: -1 })
            .toArray()

        return NextResponse.json(announcements)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const user = verifyToken(request)
        if (!user || user.role !== 'school_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await request.json()
        const db = await connectToDatabase()

        const newAnnouncement = {
            id: uuidv4(),
            ...body,
            schoolId: user.schoolId,
            sentBy: user.name || 'Admin',
            createdAt: new Date().toISOString()
        }

        await db.collection('announcements').insertOne(newAnnouncement)
        return NextResponse.json(newAnnouncement)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

export async function DELETE(request) {
    try {
        const user = verifyToken(request)
        if (!user || user.role !== 'school_admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

        const db = await connectToDatabase()
        await db.collection('announcements').deleteOne({ id, schoolId: user.schoolId })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
