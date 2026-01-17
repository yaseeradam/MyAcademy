import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { listBackupFiles } from '@/lib/backup-utils'
import { ensureBackupScheduler } from '@/lib/backup-scheduler'

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

export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'school_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await ensureBackupScheduler()
    const backups = await listBackupFiles(user.schoolId)
    return NextResponse.json({ backups })
  } catch (error) {
    console.error('Backup list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
