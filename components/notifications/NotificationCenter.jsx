'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Bell,
  BellRing,
  Settings,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  Info,
  MessageCircle,
  Calendar,
  BookOpen,
  Users,
  X,
  Volume2,
  VolumeX
} from 'lucide-react'
import socketManager from '@/lib/socket-client'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

function NotificationCenter({ currentUser, isOpen, onToggle }) {
  const MAX_NOTIFICATIONS = 50 // Limit notifications in memory
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [preferences, setPreferences] = useState({
    email: true,
    push: true,
    sms: false,
    chat: true,
    attendance: true,
    announcements: true,
    assignments: true
  })
  const [showSettings, setShowSettings] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const audioContextRef = useRef(null)
  const notificationTimeoutsRef = useRef(new Set())
  const isMountedRef = useRef(true)
  const pushSetupRef = useRef(false)

  // Load notifications on mount
  useEffect(() => {
    isMountedRef.current = true
    loadNotifications()
    loadPreferences()

    // Set up socket event listeners
    const handleNewNotification = (notification) => {
      if (!isMountedRef.current) return
      
      setNotifications(prev => {
        const updated = [notification, ...prev]
        // Limit notifications to prevent memory leak
        return updated.slice(0, MAX_NOTIFICATIONS)
      })
      setUnreadCount(prev => prev + 1)

      // Play sound if enabled
      if (soundEnabled) {
        playNotificationSound()
      }

      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        showBrowserNotification(notification)
      }
    }

    const handleNotificationRead = (notificationId) => {
      if (!isMountedRef.current) return
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }

    const handleUnreadCount = (count) => {
      if (isMountedRef.current) setUnreadCount(count)
    }

    const handlePreferences = (prefs) => {
      if (isMountedRef.current) setPreferences(prefs)
    }

    socketManager.on('notification', handleNewNotification)
    socketManager.on('notification_read', handleNotificationRead)
    socketManager.on('unread_count', handleUnreadCount)
    socketManager.on('notification_preferences', handlePreferences)

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission()
    }

    return () => {
      isMountedRef.current = false
      // Clear all notification timeouts
      notificationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout))
      notificationTimeoutsRef.current.clear()
      // Close audio context if exists
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
      // Remove socket listeners
      socketManager.off('notification', handleNewNotification)
      socketManager.off('notification_read', handleNotificationRead)
      socketManager.off('unread_count', handleUnreadCount)
      socketManager.off('notification_preferences', handlePreferences)
    }
  }, [soundEnabled])

  useEffect(() => {
    if (!preferences.push || pushSetupRef.current) return
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

    const setupPush = async () => {
      try {
        const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        if (!publicKey) {
          console.warn('Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY for push notifications.')
          return
        }

        const permission = Notification.permission === 'default'
          ? await Notification.requestPermission()
          : Notification.permission
        if (permission !== 'granted') {
          return
        }

        const registration = await navigator.serviceWorker.register('/sw.js')
        let subscription = await registration.pushManager.getSubscription()
        if (!subscription) {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey)
          })
        }

        const token = localStorage.getItem('token')
        if (!token) return

        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ subscription })
        })

        pushSetupRef.current = true
      } catch (error) {
        console.error('Push setup failed:', error)
      }
    }

    setupPush()
  }, [preferences.push])

  const unsubscribePush = async () => {
    if (typeof window === 'undefined') return
    if (!('serviceWorker' in navigator)) return
    try {
      const registration = await navigator.serviceWorker.getRegistration('/sw.js')
      if (!registration) return
      const subscription = await registration.pushManager.getSubscription()
      if (!subscription) return
      const token = localStorage.getItem('token')
      if (token) {
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        })
      }
      await subscription.unsubscribe()
      pushSetupRef.current = false
    } catch (error) {
      console.error('Push unsubscribe failed:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
        const unread = data.filter(n => !n.read).length
        setUnreadCount(unread)
      }
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  const loadPreferences = () => {
    socketManager.getUnreadCount()
    socketManager.getNotificationPreferences()
  }

  const playNotificationSound = () => {
    try {
      // Reuse or create audio context
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      }
      
      const audioContext = audioContextRef.current
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      // Clean up oscillator after it stops
      oscillator.onended = () => {
        oscillator.disconnect()
        gainNode.disconnect()
      }
    } catch (error) {
      console.error('Error playing notification sound:', error)
    }
  }

  const showBrowserNotification = (notification) => {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: notification.id
      })

      browserNotification.onclick = () => {
        window.focus()
        onToggle()
        browserNotification.close()
      }

      // Auto close after 5 seconds and track timeout
      const timeoutId = setTimeout(() => {
        browserNotification.close()
        notificationTimeoutsRef.current.delete(timeoutId)
      }, 5000)
      
      notificationTimeoutsRef.current.add(timeoutId)
    } catch (error) {
      console.error('Error showing browser notification:', error)
    }
  }

  const markAsRead = async (notificationId) => {
    socketManager.markNotificationRead(notificationId)
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read)
    for (const notification of unreadNotifications) {
      await markAsRead(notification.id)
    }
  }

  const updatePreferences = (newPreferences) => {
    setPreferences(newPreferences)
    socketManager.updateNotificationPreferences(newPreferences)
    if (!newPreferences.push) {
      unsubscribePush()
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'message':
        return <MessageCircle className="h-4 w-4" />
      case 'attendance':
        return <Calendar className="h-4 w-4" />
      case 'assignment':
        return <BookOpen className="h-4 w-4" />
      case 'announcement':
        return <Users className="h-4 w-4" />
      case 'chat_request':
        return <MessageCircle className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-rose-600 border-rose-200 bg-rose-50'
      case 'medium':
        return 'text-amber-600 border-amber-200 bg-amber-50'
      default:
        return 'text-slate-600 border-slate-200 bg-slate-50'
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) { // Less than 1 minute
      return 'Just now'
    } else if (diff < 3600000) { // Less than 1 hour
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) { // Less than 1 day
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredNotifications = (filter) => {
    switch (filter) {
      case 'unread':
        return notifications.filter(n => !n.read)
      case 'read':
        return notifications.filter(n => n.read)
      default:
        return notifications
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onToggle}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge className="text-xs bg-rose-500 text-white border-none">
                  {unreadCount} unread
                </Badge>
              )}
            </DialogTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-500 hover:text-slate-900 hover:bg-slate-100">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
                  <DialogHeader>
                    <DialogTitle>Notification Preferences</DialogTitle>
                    <DialogDescription className="text-slate-500">
                      Choose how you want to receive notifications.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="push">Push Notifications</Label>
                      <Switch
                        id="push"
                        checked={preferences.push}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, push: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email Notifications</Label>
                      <Switch
                        id="email"
                        checked={preferences.email}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, email: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="sms">SMS Notifications</Label>
                      <Switch
                        id="sms"
                        checked={preferences.sms}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, sms: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="chat">Chat Messages</Label>
                      <Switch
                        id="chat"
                        checked={preferences.chat}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, chat: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="attendance">Attendance Updates</Label>
                      <Switch
                        id="attendance"
                        checked={preferences.attendance}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, attendance: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="announcements">School Announcements</Label>
                      <Switch
                        id="announcements"
                        checked={preferences.announcements}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, announcements: checked })
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="assignments">Assignment Updates</Label>
                      <Switch
                        id="assignments"
                        checked={preferences.assignments}
                        onCheckedChange={(checked) =>
                          updatePreferences({ ...preferences, assignments: checked })
                        }
                      />
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </DialogHeader>

        <div className="flex justify-between items-center mb-4">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100">
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
              <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">Read ({notifications.length - unreadCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <NotificationList
                notifications={filteredNotifications('all')}
                onMarkAsRead={markAsRead}
                getNotificationIcon={getNotificationIcon}
                getPriorityColor={getPriorityColor}
                formatTime={formatTime}
              />
            </TabsContent>

            <TabsContent value="unread" className="mt-4">
              <NotificationList
                notifications={filteredNotifications('unread')}
                onMarkAsRead={markAsRead}
                getNotificationIcon={getNotificationIcon}
                getPriorityColor={getPriorityColor}
                formatTime={formatTime}
              />
            </TabsContent>

            <TabsContent value="read" className="mt-4">
              <NotificationList
                notifications={filteredNotifications('read')}
                onMarkAsRead={markAsRead}
                getNotificationIcon={getNotificationIcon}
                getPriorityColor={getPriorityColor}
                formatTime={formatTime}
              />
            </TabsContent>
          </Tabs>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="border-slate-200 text-slate-600 hover:bg-slate-100">
              Mark All Read
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function NotificationList({ notifications, onMarkAsRead, getNotificationIcon, getPriorityColor, formatTime }) {
  if (notifications.length === 0) {
    return (
      <Card className="border-slate-200/80 bg-white/80">
        <CardContent className="p-8 text-center">
          <Bell className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500">No notifications</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <ScrollArea className="h-96">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <Card
            key={notification.id}
            className={`cursor-pointer transition-colors border-slate-200/80 bg-white/80 hover:bg-white ${
              !notification.read ? 'border-l-4 border-l-sky-400 bg-sky-50/60' : ''
            }`}
            onClick={() => !notification.read && onMarkAsRead(notification.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full border ${getPriorityColor(notification.priority)}`}>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-slate-900 truncate">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-slate-500">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">
                    {notification.message}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs capitalize border-slate-200 text-slate-600">
                      {notification.type.replace('_', ' ')}
                    </Badge>
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                        onClick={(e) => {
                          e.stopPropagation()
                          onMarkAsRead(notification.id)
                        }}
                      >
                        Mark as Read
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  )
}

export default NotificationCenter
