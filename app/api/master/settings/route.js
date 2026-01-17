import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
const { buildCacheKey, getCache, setCache, shouldBypassCache } = require('@/lib/api-cache')

const JWT_SECRET = process.env.JWT_SECRET

function verifyToken(request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }
    const token = authHeader.substring(7)
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

export async function GET(request) {
  try {
    const user = verifyToken(request)
    if (!user || user.role !== 'developer') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bypassCache = shouldBypassCache(request)
    if (!bypassCache) {
      const cached = getCache(buildCacheKey(request, user))
      if (cached) return NextResponse.json(cached)
    }

    const settings = {
      systemName: 'My Academy',
      systemEmail: 'admin@myacademy.com',
      defaultCurrency: 'NGN',
      timezone: 'Africa/Lagos',
      maintenanceMode: false,
      allowRegistration: true,
      maxSchools: 1000,
      systemVersion: '1.0.0'
    }

    if (!bypassCache) {
      setCache(buildCacheKey(request, user), settings, 60000)
    }
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching master settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
