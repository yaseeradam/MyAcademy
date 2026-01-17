import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import fs from 'fs/promises'
import path from 'path'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

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

function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '')
}

export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileName = sanitizeFileName(searchParams.get('file') || '')
    if (!fileName || !fileName.endsWith('.json')) {
      return NextResponse.json({ error: 'Invalid file' }, { status: 400 })
    }

    const filePath = path.join(process.cwd(), 'backups', user.schoolId, fileName)
    const buffer = await fs.readFile(filePath)

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${fileName}"`
      }
    })
  } catch (error) {
    console.error('Backup download error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
