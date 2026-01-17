'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Download, Upload, RefreshCw, HardDriveDownload, FolderSync, FileSpreadsheet } from 'lucide-react'

export default function BackupToolsPage({ apiCall, token, onBack }) {
  const [backups, setBackups] = useState([])
  const [loading, setLoading] = useState(false)
  const [schedule, setSchedule] = useState({ enabled: false, intervalHours: 24, maxBackups: 10, maxBackupDays: 0, nextRun: null, lastRun: null })
  const [collections, setCollections] = useState([])
  const [csvCollection, setCsvCollection] = useState('')
  const [uploading, setUploading] = useState(false)
  const [logs, setLogs] = useState([])

  const refreshAll = async () => {
    setLoading(true)
    try {
      const [listRes, scheduleRes, collectionRes, logsRes] = await Promise.all([
        apiCall('backup/list'),
        apiCall('backup/schedule'),
        apiCall('backup/collections'),
        apiCall('backup/logs?limit=20')
      ])
      setBackups(listRes.backups || [])
      setSchedule(scheduleRes || {})
      setCollections(collectionRes.collections || [])
      setLogs(logsRes.logs || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshAll()
  }, [])

  const handleCreateBackup = async () => {
    setLoading(true)
    try {
      await apiCall('backup/export', { method: 'POST' })
      await refreshAll()
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileName) => {
    const response = await fetch(`/api/backup/download?file=${encodeURIComponent(fileName)}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
    if (!response.ok) return
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const handleRestore = async (fileName) => {
    if (!confirm('Restoring will overwrite existing school data. Continue?')) return
    setLoading(true)
    try {
      await apiCall('backup/restore', { method: 'POST', body: JSON.stringify({ fileName }) })
      await refreshAll()
    } finally {
      setLoading(false)
    }
  }

  const handleUploadRestore = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!confirm('Restoring will overwrite existing school data. Continue?')) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : ''
        },
        body: formData
      })
      if (response.ok) {
        await refreshAll()
      }
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleScheduleToggle = async (value) => {
    const enabled = Boolean(value)
    setSchedule((prev) => ({ ...prev, enabled }))
    await apiCall('backup/schedule', { method: 'POST', body: JSON.stringify({ enabled, intervalHours: schedule.intervalHours, maxBackups: schedule.maxBackups, maxBackupDays: schedule.maxBackupDays }) })
    await refreshAll()
  }

  const handleScheduleSave = async () => {
    await apiCall('backup/schedule', { method: 'POST', body: JSON.stringify({ enabled: schedule.enabled, intervalHours: schedule.intervalHours, maxBackups: schedule.maxBackups, maxBackupDays: schedule.maxBackupDays }) })
    await refreshAll()
  }

  const handleCsvDownload = async () => {
    if (!csvCollection) return
    const response = await fetch(`/api/backup/csv?collection=${encodeURIComponent(csvCollection)}`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
    if (!response.ok) return
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${csvCollection}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  }

  const latestBackup = useMemo(() => backups[0], [backups])

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onBack} className="border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <Badge className="bg-sky-100 text-sky-700 border-sky-200">Local Disk</Badge>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-3">Data Export & Backup</h2>
          <p className="text-slate-500 mt-1">Create backups, schedule automatic snapshots, and restore data safely.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleCreateBackup} className="bg-gradient-to-r from-sky-500 to-cyan-400 text-white hover:from-sky-600 hover:to-cyan-500">
            <HardDriveDownload className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
          <Button variant="outline" onClick={refreshAll} className="border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-slate-600">
            <div className="flex items-center justify-between">
              <span>Automatic backups</span>
              <Switch checked={schedule.enabled} onCheckedChange={handleScheduleToggle} />
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                value={schedule.intervalHours}
                onChange={async (e) => {
                  const intervalHours = Number(e.target.value) || 1
                  setSchedule((prev) => ({ ...prev, intervalHours }))
                  const res = await apiCall('backup/schedule', { method: 'POST', body: JSON.stringify({ enabled: schedule.enabled, intervalHours, maxBackups: schedule.maxBackups, maxBackupDays: schedule.maxBackupDays }) })
                  setSchedule((prev) => ({ ...prev, preview: res.preview }))
                }}
                className="w-24 bg-white border-slate-200 text-slate-800"
              />
              <span>hours interval</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="1"
                value={schedule.maxBackups || 10}
                onChange={async (e) => {
                  const maxBackups = Number(e.target.value) || 1
                  setSchedule((prev) => ({ ...prev, maxBackups }))
                  const res = await apiCall('backup/schedule', { method: 'POST', body: JSON.stringify({ enabled: schedule.enabled, intervalHours: schedule.intervalHours, maxBackups, maxBackupDays: schedule.maxBackupDays }) })
                  setSchedule((prev) => ({ ...prev, preview: res.preview }))
                }}
                className="w-24 bg-white border-slate-200 text-slate-800"
              />
              <span>max backups to keep</span>
            </div>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                min="0"
                value={schedule.maxBackupDays || 0}
                onChange={async (e) => {
                  const maxBackupDays = Number(e.target.value) || 0
                  setSchedule((prev) => ({ ...prev, maxBackupDays }))
                  const res = await apiCall('backup/schedule', { method: 'POST', body: JSON.stringify({ enabled: schedule.enabled, intervalHours: schedule.intervalHours, maxBackups: schedule.maxBackups, maxBackupDays }) })
                  setSchedule((prev) => ({ ...prev, preview: res.preview }))
                }}
                className="w-24 bg-white border-slate-200 text-slate-800"
              />
              <span>days to keep (0 = forever)</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Last run</span>
              <span className="text-slate-700">{schedule.lastRun ? new Date(schedule.lastRun).toLocaleString() : 'Never'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Next run</span>
              <span className="text-slate-700">{schedule.nextRun ? new Date(schedule.nextRun).toLocaleString() : 'Not scheduled'}</span>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 text-xs text-slate-500 space-y-1">
              <div className="flex items-center justify-between">
                <span>Retention preview</span>
                <span>{schedule.preview?.toDelete || 0} deletions</span>
              </div>
              <div className="flex items-center justify-between">
                <span>By age</span>
                <span>{schedule.preview?.byAge || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>By count</span>
                <span>{schedule.preview?.byCount || 0}</span>
              </div>
            </div>
            <Button onClick={handleScheduleSave} variant="outline" className="border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100 w-full">
              <FolderSync className="h-4 w-4 mr-2" />
              Save Schedule
            </Button>
            <p className="text-xs text-slate-400">
              Automatic backups run while the server is online.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/85 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">Latest Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {latestBackup ? (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-slate-900 font-semibold">{latestBackup.fileName}</p>
                  <p className="text-sm text-slate-500">
                    {latestBackup.createdAt ? new Date(latestBackup.createdAt).toLocaleString() : 'Unknown'} · {(latestBackup.size / 1024).toFixed(1)} KB
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleDownload(latestBackup.fileName)} className="border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" onClick={() => handleRestore(latestBackup.fileName)} className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                    <Upload className="h-4 w-4 mr-2" />
                    Restore
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-slate-500">No backups created yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="border border-slate-200/80 bg-white/85 backdrop-blur-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">CSV Export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={csvCollection} onValueChange={setCsvCollection}>
              <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                <SelectValue placeholder="Select collection" />
              </SelectTrigger>
              <SelectContent className="bg-white border-slate-200">
                {collections.map((collection) => (
                  <SelectItem key={collection} value={collection} className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleCsvDownload} disabled={!csvCollection} className="bg-gradient-to-r from-emerald-500 to-teal-400 text-white hover:from-emerald-600 hover:to-teal-500 w-full">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <p className="text-xs text-slate-400">
              Export one collection at a time as CSV for spreadsheets.
            </p>
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 bg-white/85 backdrop-blur-xl lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900">All Backups</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <label className="text-sm text-slate-600">
                Restore from file
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleUploadRestore}
                  className="block mt-2 text-xs text-slate-500"
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-2">
              {backups.length === 0 && (
                <p className="text-sm text-slate-500">No backups available yet.</p>
              )}
              {backups.map((backup) => (
                <div key={backup.fileName} className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{backup.fileName}</p>
                    <p className="text-xs text-slate-500">
                      {backup.createdAt ? new Date(backup.createdAt).toLocaleString() : 'Unknown'} · {(backup.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload(backup.fileName)} className="border-slate-200 bg-white/80 text-slate-600 hover:bg-slate-100">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleRestore(backup.fileName)} className="border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100">
                      <Upload className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-slate-900">Backup Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {logs.length === 0 && (
            <p className="text-sm text-slate-500">No backup activity yet.</p>
          )}
          {logs.map((log) => (
            <div key={log.id} className="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">{log.action.replace('backup_', '').replace(/_/g, ' ')}</p>
                <p className="text-xs text-slate-500">{log.details}</p>
              </div>
              <div className="text-xs text-slate-500 text-right">
                <div>{new Date(log.createdAt).toLocaleString()}</div>
                <div>{log.userRole || 'system'}</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
