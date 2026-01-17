import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { v4 as uuidv4 } from 'uuid'
import jwt from 'jsonwebtoken'
const { sendPushToUser } = require('@/lib/push')
const { emitToUser } = require('@/lib/socket-server')

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
        const priorityMap = {
            urgent: 'high',
            high: 'medium',
            normal: 'low'
        }
        const notifPriority = priorityMap[newAnnouncement.priority] || 'medium'
        let recipientIds = []

        if (newAnnouncement.audience === 'all') {
            const users = await db.collection('users').find({
                schoolId: user.schoolId,
                active: true
            }).project({ id: 1 }).toArray()
            recipientIds = users.map(u => u.id)
        } else if (newAnnouncement.audience === 'teachers') {
            const users = await db.collection('users').find({
                schoolId: user.schoolId,
                role: 'teacher',
                active: true
            }).project({ id: 1 }).toArray()
            recipientIds = users.map(u => u.id)
        } else if (newAnnouncement.audience === 'parents') {
            const users = await db.collection('users').find({
                schoolId: user.schoolId,
                role: 'parent',
                active: true
            }).project({ id: 1 }).toArray()
            recipientIds = users.map(u => u.id)
        } else if (newAnnouncement.audience === 'class' && newAnnouncement.classId) {
            const students = await db.collection('students').find({
                schoolId: user.schoolId,
                classId: newAnnouncement.classId,
                active: true
            }).project({ parentId: 1 }).toArray()
            const parentIds = students.map(s => s.parentId).filter(Boolean)
            const teacherAssignments = await db.collection('teacher_assignments').find({
                schoolId: user.schoolId,
                classId: newAnnouncement.classId
            }).project({ teacherId: 1 }).toArray()
            const teacherIds = teacherAssignments.map(t => t.teacherId).filter(Boolean)
            recipientIds = [...parentIds, ...teacherIds]
        }

        const uniqueRecipients = [...new Set(recipientIds)]
        if (uniqueRecipients.length > 0) {
            const notifications = uniqueRecipients.map(recipientId => ({
                id: uuidv4(),
                schoolId: user.schoolId,
                recipientId,
                senderId: user.id,
                title: newAnnouncement.title,
                message: newAnnouncement.message,
                type: 'announcement',
                priority: notifPriority,
                read: false,
                metadata: { announcementId: newAnnouncement.id },
                createdAt: new Date().toISOString()
            }))

            await db.collection('notifications').insertMany(notifications)
            for (const notification of notifications) {
                emitToUser(notification.recipientId, 'notification', notification)
                await sendPushToUser(
                    notification.recipientId,
                    user.schoolId,
                    {
                        title: notification.title,
                        body: notification.message,
                        url: '/?openNotifications=1'
                    },
                    db
                )
            }
        }
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
