'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Activity, Database, Server, AlertTriangle, CheckCircle, Clock, HardDrive, Cpu, MemoryStick } from 'lucide-react'
// Simple loading component
const Loader = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

export default function SystemHealthPage() {
  const [systemHealth, setSystemHealth] = useState(null)
  const [backupStatus, setBackupStatus] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemHealth()
    const interval = setInterval(fetchSystemHealth, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemHealth = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [healthRes, backupRes] = await Promise.all([
        fetch('/api/master/system-health', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/master/backup-status', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (healthRes.ok) {
        const healthData = await healthRes.json()
        setSystemHealth(healthData)
      }

      if (backupRes.ok) {
        const backupData = await backupRes.json()
        setBackupStatus(backupData)
      }
    } catch (error) {
      console.error('Error fetching system health:', error)
    } finally {
      setLoading(false)
    }
  }

  const createBackup = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/master/backup', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: 'full' })
      })

      if (response.ok) {
        // Refresh backup status
        setTimeout(fetchSystemHealth, 1000)
      }
    } catch (error) {
      console.error('Error creating backup:', error)
    }
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  if (loading) {
    return <Loader message="Loading system health..." />
  }

  const isHealthy = systemHealth?.errorLogs24h < 10 && systemHealth?.uptime > 3600

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="h-8 w-8 text-green-600" />
          System Health & Monitoring
        </h1>
        <div className="flex items-center gap-2">
          {isHealthy ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">System Healthy</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Attention Required</span>
            </div>
          )}
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500 rounded-lg">
                <Server className="h-5 w-5 text-white" />
              </div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatUptime(systemHealth?.uptime || 0)}
            </div>
            <p className="text-sm text-green-700">System Uptime</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Database className="h-5 w-5 text-white" />
              </div>
              <CheckCircle className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatBytes(systemHealth?.dbSize || 0)}
            </div>
            <p className="text-sm text-blue-700">Database Size</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500 rounded-lg">
                <HardDrive className="h-5 w-5 text-white" />
              </div>
              <Activity className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {systemHealth?.collections || 0}
            </div>
            <p className="text-sm text-purple-700">Collections</p>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-lg ${systemHealth?.errorLogs24h > 10 ? 'bg-gradient-to-br from-red-50 to-red-100' : 'bg-gradient-to-br from-amber-50 to-amber-100'}`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className={`p-2 rounded-lg ${systemHealth?.errorLogs24h > 10 ? 'bg-red-500' : 'bg-amber-500'}`}>
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              {systemHealth?.errorLogs24h > 10 ? (
                <AlertTriangle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-amber-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${systemHealth?.errorLogs24h > 10 ? 'text-red-900' : 'text-amber-900'}`}>
              {systemHealth?.errorLogs24h || 0}
            </div>
            <p className={`text-sm ${systemHealth?.errorLogs24h > 10 ? 'text-red-700' : 'text-amber-700'}`}>
              Errors (24h)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Memory and Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MemoryStick className="h-5 w-5 text-blue-600" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">RSS Memory</span>
                <span className="font-semibold">
                  {formatBytes(systemHealth?.memoryUsage?.rss || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Heap Used</span>
                <span className="font-semibold">
                  {formatBytes(systemHealth?.memoryUsage?.heapUsed || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Heap Total</span>
                <span className="font-semibold">
                  {formatBytes(systemHealth?.memoryUsage?.heapTotal || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">External</span>
                <span className="font-semibold">
                  {formatBytes(systemHealth?.memoryUsage?.external || 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-green-600" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Node.js Version</span>
                <span className="font-semibold">{process.version || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Platform</span>
                <span className="font-semibold">{process.platform || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Architecture</span>
                <span className="font-semibold">{process.arch || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="font-semibold">
                  {new Date(systemHealth?.timestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              Backup & Recovery
            </CardTitle>
            <button
              onClick={createBackup}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Create Backup
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backupStatus.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No backup records found. Create your first backup to get started.
              </div>
            ) : (
              backupStatus.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      backup.status === 'completed' ? 'bg-green-100' :
                      backup.status === 'failed' ? 'bg-red-100' : 'bg-yellow-100'
                    }`}>
                      {backup.status === 'completed' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : backup.status === 'failed' ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {backup.type} Backup
                      </div>
                      <div className="text-sm text-gray-500">
                        Created: {new Date(backup.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded text-sm font-medium ${
                      backup.status === 'completed' ? 'bg-green-100 text-green-700' :
                      backup.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {backup.status}
                    </div>
                    {backup.size && (
                      <div className="text-sm text-gray-500 mt-1">
                        Size: {backup.size}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}