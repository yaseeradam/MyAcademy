import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/mongodb'
import jwt from 'jsonwebtoken'

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const db = await connectDB()
    
    const user = await db.collection('users').findOne(
      { email: decoded.email },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const { name, bio, profilePicture } = await request.json()
    
    const db = await connectDB()
    const updateData = {
      name,
      bio: bio || '',
      profilePicture: profilePicture || '',
      updatedAt: new Date()
    }

    const result = await db.collection('users').findOneAndUpdate(
      { email: decoded.email },
      { $set: updateData },
      { returnDocument: 'after', projection: { password: 0 } }
    )

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
