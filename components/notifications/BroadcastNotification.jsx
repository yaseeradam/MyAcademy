'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Megaphone,
  Users,
  UserCheck,
  GraduationCap,
  Send,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import socketManager from '@/lib/socket-client'

function BroadcastNotification({ currentUser, trigger }) {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetAudience: [],
    priority: 'medium'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    teachers: 0,
    parents: 0,
    students: 0
  })

  // ✅ Stable user stats loader
  const loadUserStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = { 'Authorization': `Bearer ${token}` }

      const [teachersRes, parentsRes, studentsRes] = await Promise.all([
        fetch('/api/teachers', { headers }),
        fetch('/api/parents', { headers }),
        fetch('/api/students', { headers })
      ])

      const teachers = teachersRes.ok ? await teachersRes.json() : []
      const parents = parentsRes.ok ? await parentsRes.json() : []
      const students = studentsRes.ok ? await studentsRes.json() : []

      setStats({
        totalUsers: teachers.length + parents.length + students.length,
        teachers: teachers.length,
        parents: parents.length,
        students: students.length
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }, [])

  // ✅ Only load once when dialog opens
  useEffect(() => {
    if (isOpen && stats.totalUsers === 0) {
      loadUserStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  // ✅ Clean up socket listeners on unmount
  useEffect(() => {
    return () => {
      socketManager.off('broadcast_sent')
      socketManager.off('error')
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.title.trim() || !formData.message.trim() || formData.targetAudience.length === 0) {
      return
    }

    setIsLoading(true)
    setResult(null)

    try {
      // 🔒 Remove any existing listeners before adding new ones
      socketManager.off('broadcast_sent')
      socketManager.off('error')

      const handleBroadcastResult = (data) => {
        setResult(data)
        setIsLoading(false)

        if (data.count > 0) {
          setFormData({
            title: '',
            message: '',
            targetAudience: [],
            priority: 'medium'
          })

          setTimeout(() => {
            setIsOpen(false)
            setResult(null)
          }, 3000)
        }

        socketManager.off('broadcast_sent', handleBroadcastResult)
        socketManager.off('error', handleBroadcastError)
      }

      const handleBroadcastError = (error) => {
        setResult({ error })
        setIsLoading(false)
        socketManager.off('broadcast_sent', handleBroadcastResult)
        socketManager.off('error', handleBroadcastError)
      }

      socketManager.on('broadcast_sent', handleBroadcastResult)
      socketManager.on('error', handleBroadcastError)

      socketManager.broadcastNotification({
        title: formData.title.trim(),
        message: formData.message.trim(),
        targetAudience: formData.targetAudience,
        priority: formData.priority
      })
    } catch (error) {
      console.error('Error broadcasting notification:', error)
      setResult({ error: 'Failed to send notification' })
      setIsLoading(false)
    }
  }

  const handleAudienceChange = (audience, checked) => {
    setFormData(prev => ({
      ...prev,
      targetAudience: checked
        ? [...prev.targetAudience, audience]
        : prev.targetAudience.filter(a => a !== audience)
    }))
  }

  const getAudienceCount = (audience) => {
    switch (audience) {
      case 'teachers': return stats.teachers
      case 'parents': return stats.parents
      case 'students': return stats.students
      case 'all': return stats.totalUsers
      default: return 0
    }
  }

  const selectedCount = useMemo(() => {
    if (formData.targetAudience.includes('all')) return stats.totalUsers
    let count = 0
    if (formData.targetAudience.includes('teachers')) count += stats.teachers
    if (formData.targetAudience.includes('parents')) count += stats.parents
    if (formData.targetAudience.includes('students')) count += stats.students
    return count
  }, [formData.targetAudience, stats])

  const audienceOptions = [
    { value: 'all', label: 'All Users', icon: Users, description: 'Send to everyone in the school' },
    { value: 'teachers', label: 'Teachers', icon: UserCheck, description: 'Send to all teachers' },
    { value: 'parents', label: 'Parents', icon: GraduationCap, description: 'Send to all parents' },
    { value: 'students', label: 'Students', icon: GraduationCap, description: 'Send to all students (via parents)' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Megaphone className="h-4 w-4 mr-2" />
            Broadcast Message
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Megaphone className="h-5 w-5" />
            <span>Broadcast Notification</span>
          </DialogTitle>
          <DialogDescription>
            Send an announcement to multiple users in your school.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Notification Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., School Holiday Notice"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Enter your announcement message..."
              rows={4}
              required
            />
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>Priority Level</Label>
            <Select
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Target Audience */}
          <div className="space-y-4">
            <Label>Target Audience</Label>
            <div className="grid grid-cols-1 gap-3">
              {audienceOptions.map((option) => {
                const Icon = option.icon
                const isSelected = formData.targetAudience.includes(option.value)
                const count = getAudienceCount(option.value)

                return (
                  <Card
                    key={option.value}
                    className={`cursor-pointer transition-all ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                    }`}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start space-x-3">
                        <Checkbox 
                          checked={isSelected} 
                          onCheckedChange={(checked) => handleAudienceChange(option.value, checked)}
                          className="mt-1" 
                        />
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleAudienceChange(option.value, !isSelected)}
                        >
                          <div className="flex items-center space-x-2 mb-1">
                            <Icon className="h-4 w-4" />
                            <span className="font-medium">{option.label}</span>
                            <Badge variant="outline" className="text-xs">{count}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{option.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {formData.targetAudience.length > 0 && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium">Total recipients: {selectedCount}</span>
                <div className="flex flex-wrap gap-1">
                  {formData.targetAudience.map((audience) => (
                    <Badge key={audience} variant="secondary" className="text-xs">
                      {audienceOptions.find(opt => opt.value === audience)?.label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Result */}
          {result && (
            <Alert className={result.error ? "border-red-200 bg-red-50" : "border-green-200 bg-green-50"}>
              {result.error ? (
                <AlertCircle className="h-4 w-4 text-red-600" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-600" />
              )}
              <AlertDescription className={result.error ? "text-red-800" : "text-green-800"}>
                {result.error || `Notification sent successfully to ${result.count} recipients!`}
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isLoading ||
                !formData.title.trim() ||
                !formData.message.trim() ||
                formData.targetAudience.length === 0
              }
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BroadcastNotification