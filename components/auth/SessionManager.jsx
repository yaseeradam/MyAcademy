'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  LogOut,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'

function SessionManager() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [terminatingSession, setTerminatingSession] = useState(null)
  const [showTerminateAllDialog, setShowTerminateAllDialog] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/auth/sessions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) {
        throw new Error('Failed to load sessions')
      }

      const data = await response.json()
      setSessions(data.sessions || [])
    } catch (error) {
      console.error('Error loading sessions:', error)
      setError('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const terminateSession = async (sessionId) => {
    try {
      setActionLoading(true)
      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to terminate session')
      }

      // Remove terminated session from list
      setSessions(prev => prev.filter(session => session.id !== sessionId))
      setTerminatingSession(null)
    } catch (error) {
      console.error('Error terminating session:', error)
      setError(error.message || 'Failed to terminate session')
    } finally {
      setActionLoading(false)
    }
  }

  const terminateAllSessions = async () => {
    try {
      setActionLoading(true)
      const response = await fetch('/api/auth/sessions?all=true', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to terminate all sessions')
      }

      const data = await response.json()

      // Reload sessions to get the new session
      await loadSessions()
      setShowTerminateAllDialog(false)

      // Update local storage with new session ID if provided
      if (data.newSessionId) {
        localStorage.setItem('sessionId', data.newSessionId)
      }
    } catch (error) {
      console.error('Error terminating all sessions:', error)
      setError(error.message || 'Failed to terminate all sessions')
    } finally {
      setActionLoading(false)
    }
  }

  const getDeviceIcon = (deviceInfo) => {
    const type = deviceInfo?.type?.toLowerCase() || ''
    const userAgent = deviceInfo?.userAgent?.toLowerCase() || ''

    if (type.includes('mobile') || userAgent.includes('mobile')) {
      return <Smartphone className="h-5 w-5" />
    } else if (type.includes('tablet') || userAgent.includes('tablet')) {
      return <Tablet className="h-5 w-5" />
    } else {
      return <Monitor className="h-5 w-5" />
    }
  }

  const getBrowserInfo = (userAgent) => {
    if (!userAgent) return 'Unknown'

    const ua = userAgent.toLowerCase()

    if (ua.includes('chrome') && !ua.includes('edg')) return 'Chrome'
    if (ua.includes('firefox')) return 'Firefox'
    if (ua.includes('safari') && !ua.includes('chrome')) return 'Safari'
    if (ua.includes('edg')) return 'Edge'
    if (ua.includes('opera')) return 'Opera'

    return 'Unknown'
  }

  const formatDateTime = (dateString) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  }

  const isRecentActivity = (lastActivity) => {
    const now = new Date()
    const activity = new Date(lastActivity)
    const diffMinutes = (now - activity) / (1000 * 60)
    return diffMinutes < 5 // Consider active if less than 5 minutes ago
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading sessions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Session Management</h1>
          <p className="text-gray-600">Manage your active sessions across devices</p>
        </div>
        <Button
          variant="outline"
          onClick={loadSessions}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-gray-600">Currently logged in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Current Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">This device</span>
            </div>
            <p className="text-xs text-gray-600">Active now</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">Secure</span>
            </div>
            <p className="text-xs text-gray-600">All sessions monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Sessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Sessions</CardTitle>
          <CardDescription>
            View and manage all your active sessions. Terminate suspicious sessions immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device</TableHead>
                <TableHead>Browser</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => {
                const { date: createdDate, time: createdTime } = formatDateTime(session.createdAt)
                const { date: activityDate, time: activityTime } = formatDateTime(session.lastActivity)
                const isRecent = isRecentActivity(session.lastActivity)

                return (
                  <TableRow key={session.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        {getDeviceIcon(session.deviceInfo)}
                        <div>
                          <p className="font-medium">
                            {session.deviceInfo?.type || 'Unknown Device'}
                          </p>
                          <p className="text-sm text-gray-600">
                            Signed in {createdDate} at {createdTime}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Globe className="h-4 w-4 text-gray-400" />
                        <span>{getBrowserInfo(session.userAgent)}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{session.location}</span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {session.ipAddress}
                      </code>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm">{activityDate}</p>
                          <p className="text-xs text-gray-600">{activityTime}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      {session.isCurrentSession ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Current
                        </Badge>
                      ) : isRecent ? (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          Idle
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell>
                      {!session.isCurrentSession && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => setTerminatingSession(session)}
                            >
                              <LogOut className="h-4 w-4 mr-1" />
                              Terminate
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Terminate Session</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to terminate this session? The user will be logged out immediately.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                                {getDeviceIcon(session.deviceInfo)}
                                <div>
                                  <p className="font-medium">
                                    {session.deviceInfo?.type || 'Unknown Device'}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {session.location} • {session.ipAddress}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Last active: {formatDateTime(session.lastActivity).date} at {formatDateTime(session.lastActivity).time}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                variant="outline"
                                onClick={() => setTerminatingSession(null)}
                              >
                                Cancel
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => terminateSession(session.id)}
                                disabled={actionLoading}
                              >
                                {actionLoading ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Terminating...
                                  </>
                                ) : (
                                  'Terminate Session'
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>

          {sessions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No active sessions found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Terminate All Sessions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Security Actions</CardTitle>
          <CardDescription>
            Use these actions if you suspect unauthorized access to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={showTerminateAllDialog} onOpenChange={setShowTerminateAllDialog}>
            <DialogTrigger asChild>
              <Button variant="destructive" className="w-full sm:w-auto">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Terminate All Other Sessions
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Terminate All Sessions</DialogTitle>
                <DialogDescription>
                  This will log you out from all devices except the current one. You will need to log in again on other devices.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This action cannot be undone. Make sure you have access to your login credentials.
                  </AlertDescription>
                </Alert>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowTerminateAllDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={terminateAllSessions}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Terminating...
                    </>
                  ) : (
                    'Terminate All Sessions'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  )
}

export default SessionManager
