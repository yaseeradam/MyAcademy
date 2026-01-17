const DEFAULT_TTL_MS = 30000
const cacheStore = new Map()

function shouldBypassCache(request) {
  try {
    const url = new URL(request.url)
    const cacheControl = request.headers.get('cache-control') || ''
    return url.searchParams.get('nocache') === '1' || cacheControl.includes('no-cache')
  } catch {
    return false
  }
}

function buildCacheKey(request, userData, extraKey = '') {
  const url = new URL(request.url)
  const userPart = userData
    ? `u=${userData.id || 'na'}|r=${userData.role || 'na'}|s=${userData.schoolId || 'na'}`
    : 'u=anon'
  return `${url.pathname}?${url.searchParams.toString()}|${userPart}|${extraKey}`
}

function getCache(key) {
  const entry = cacheStore.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key)
    return null
  }
  return entry.value
}

function setCache(key, value, ttlMs = DEFAULT_TTL_MS) {
  cacheStore.set(key, { value, expiresAt: Date.now() + ttlMs })
}

function clearCache() {
  cacheStore.clear()
}

module.exports = {
  DEFAULT_TTL_MS,
  shouldBypassCache,
  buildCacheKey,
  getCache,
  setCache,
  clearCache,
}
