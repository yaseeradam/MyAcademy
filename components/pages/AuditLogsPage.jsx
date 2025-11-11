'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Search, Filter, Calendar, User, Activity, AlertTriangle } from 'lucide-react'
// Simple loading component
const Loader = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterUser, setFilterUser] = useState('')

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  const fetchAuditLogs = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/master/audit-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data)
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = !filterAction || log.action === filterAction
    const matchesUser = !filterUser || log.userId === filterUser
    
    return matchesSearch && matchesAction && matchesUser
  })

  const getActionIcon = (action) => {
    switch (action) {
      case 'login': return <User className="h-4 w-4 text-green-600" />
      case 'logout': return <User className="h-4 w-4 text-gray-600" />
      case 'create_school': return <Activity className="h-4 w-4 text-blue-600" />
      case 'delete_school': return <AlertTriangle className="h-4 w-4 text-red-600" />
      case 'bulk_attendance_marked': return <Calendar className="h-4 w-4 text-purple-600" />
      default: return <Activity className="h-4 w-4 text-gray-600" />
    }
  }

  const getActionColor = (action) => {
    switch (action) {
      case 'login': return 'bg-green-50 text-green-700 border-green-200'
      case 'logout': return 'bg-gray-50 text-gray-700 border-gray-200'
      case 'create_school': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'delete_school': return 'bg-red-50 text-red-700 border-red-200'
      case 'bulk_attendance_marked': return 'bg-purple-50 text-purple-700 border-purple-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const uniqueActions = [...new Set(auditLogs.map(log => log.action))].filter(Boolean)
  const uniqueUsers = [...new Set(auditLogs.map(log => log.userId))].filter(Boolean)

  if (loading) {
    return <Loader message="Loading audit logs..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Audit Logs
        </h1>
        <div className="text-sm text-gray-500">
          Total logs: {auditLogs.length}
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>

            <select
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Users</option>
              {uniqueUsers.map(userId => (
                <option key={userId} value={userId}>{userId.slice(0, 8)}...</option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No audit logs found matching your criteria.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-shrink-0 mt-1">
                    {getActionIcon(log.action)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      <span className="text-sm text-gray-500">
                        by {log.userId?.slice(0, 8)}...
                      </span>
                      {log.userRole && (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {log.userRole}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">
                      {log.details}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                      {log.ipAddress && log.ipAddress !== 'unknown' && (
                        <span>IP: {log.ipAddress}</span>
                      )}
                      {log.schoolId && (
                        <span>School: {log.schoolId.slice(0, 8)}...</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-900">
              {auditLogs.filter(log => log.action === 'login').length}
            </div>
            <p className="text-sm text-blue-700">Login Events</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-900">
              {auditLogs.filter(log => log.action === 'create_school').length}
            </div>
            <p className="text-sm text-green-700">Schools Created</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-900">
              {auditLogs.filter(log => log.action === 'bulk_attendance_marked').length}
            </div>
            <p className="text-sm text-purple-700">Attendance Events</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-amber-900">
              {uniqueUsers.length}
            </div>
            <p className="text-sm text-amber-700">Active Users</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}