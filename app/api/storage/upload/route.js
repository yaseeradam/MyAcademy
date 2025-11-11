import { NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'
import { initializeApp } from 'firebase/app'
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { getAuth } from 'firebase/auth'

const MONGO_URL = process.env.MONGO_URL
const DB_NAME = process.env.DB_NAME || 'school_management'
const JWT_SECRET = process.env.JWT_SECRET

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const storage = getStorage(app)

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

// POST /api/storage/upload - Upload file to Firebase Storage
export async function POST(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file')
    const fileType = formData.get('fileType') || 'general' // 'profile', 'document', 'assignment', 'general'
    const entityId = formData.get('entityId') // studentId, teacherId, etc.
    const entityType = formData.get('entityType') // 'student', 'teacher', 'school', etc.

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size too large (max 10MB)' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = {
      image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
      general: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf']
    }

    const allowedMimeTypes = allowedTypes[fileType] || allowedTypes.general
    if (!allowedMimeTypes.includes(file.type)) {
      return NextResponse.json({ error: 'File type not allowed' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Generate unique filename
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`

    // Create storage path based on school and entity
    const storagePath = `schools/${user.schoolId}/${fileType}/${entityType}/${entityId || 'general'}/${fileName}`

    // Upload to Firebase Storage
    const storageRef = ref(storage, storagePath)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)

    // Save file metadata to database
    const fileRecord = {
      id: require('crypto').randomUUID(),
      schoolId: user.schoolId,
      userId: user.id,
      fileName: file.name,
      storageName: fileName,
      storagePath,
      downloadURL,
      fileType,
      entityType,
      entityId,
      mimeType: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString()
    }

    await db.collection('files').insertOne(fileRecord)

    // Update entity with file URL if it's a profile picture
    if (fileType === 'profile' && entityType && entityId) {
      const collectionName = entityType === 'student' ? 'students' :
                           entityType === 'teacher' ? 'teachers' :
                           entityType === 'school' ? 'schools' : null

      if (collectionName) {
        const updateField = entityType === 'school' ? 'logo' : 'profilePicture'
        await db.collection(collectionName).updateOne(
          { id: entityId, schoolId: user.schoolId },
          { $set: { [updateField]: downloadURL, updatedAt: new Date().toISOString() } }
        )
      }
    }

    return NextResponse.json({
      success: true,
      file: fileRecord
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/storage/upload - Get files for entity
export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const entityId = searchParams.get('entityId')
    const entityType = searchParams.get('entityType')
    const fileType = searchParams.get('fileType')

    const query = { schoolId: user.schoolId }
    if (entityId) query.entityId = entityId
    if (entityType) query.entityType = entityType
    if (fileType) query.fileType = fileType

    const files = await db.collection('files')
      .find(query)
      .sort({ uploadedAt: -1 })
      .toArray()

    return NextResponse.json({ files })

  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/storage/upload - Delete file
export async function DELETE(request) {
  try {
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) {
      return NextResponse.json({ error: 'File ID required' }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get file record
    const fileRecord = await db.collection('files').findOne({
      id: fileId,
      schoolId: user.schoolId
    })

    if (!fileRecord) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    // Delete from Firebase Storage
    const storageRef = ref(storage, fileRecord.storagePath)
    await deleteObject(storageRef)

    // Delete from database
    await db.collection('files').deleteOne({ id: fileId })

    // Update entity if it was a profile picture
    if (fileRecord.fileType === 'profile' && fileRecord.entityType && fileRecord.entityId) {
      const collectionName = fileRecord.entityType === 'student' ? 'students' :
                           fileRecord.entityType === 'teacher' ? 'teachers' :
                           fileRecord.entityType === 'school' ? 'schools' : null

      if (collectionName) {
        const updateField = fileRecord.entityType === 'school' ? 'logo' : 'profilePicture'
        await db.collection(collectionName).updateOne(
          { id: fileRecord.entityId, schoolId: user.schoolId },
          { $unset: { [updateField]: 1 }, $set: { updatedAt: new Date().toISOString() } }
        )
      }
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
