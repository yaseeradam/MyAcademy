import { io } from 'socket.io-client'

class SocketManager {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect(token) {
    if (typeof window === 'undefined') {
      return null
    }

    if (this.socket && (this.socket.connected || this.socket.connecting)) {
      if (token && this.socket.auth?.token !== token) {
        this.socket.auth = { token }
        this.socket.connect()
      }
      return this.socket
    }

    this.socket = io({
      auth: token ? { token } : {},
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      this._emitLocal('connected')
    })

    this.socket.on('disconnect', () => {
      this._emitLocal('disconnected')
    })

    // Attach any listeners registered before connect
    for (const [event, callbacks] of this.listeners.entries()) {
      if (event === 'connected' || event === 'disconnected') continue
      for (const cb of callbacks) {
        this.socket.on(event, cb)
      }
    }

    return this.socket
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
    }
  }

  _emitLocal(event, payload) {
    const callbacks = this.listeners.get(event)
    if (!callbacks) return
    for (const cb of callbacks) {
      cb(payload)
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)

    if (this.socket && event !== 'connected' && event !== 'disconnected') {
      this.socket.on(event, callback)
    }
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      if (callback) {
        this.listeners.get(event).delete(callback)
      } else {
        this.listeners.delete(event)
      }
    }

    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback)
      } else {
        this.socket.off(event)
      }
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data)
    }
  }

  // Chat
  joinConversation(conversationId) {
    this.emit('join_conversation', conversationId)
  }

  leaveConversation(conversationId) {
    this.emit('leave_conversation', conversationId)
  }

  sendMessage(data) {
    this.emit('send_message', data)
  }

  startTyping(conversationId) {
    this.emit('typing_start', conversationId)
  }

  stopTyping(conversationId) {
    this.emit('typing_stop', conversationId)
  }

  // Notifications
  markNotificationRead(notificationId) {
    this.emit('mark_notification_read', notificationId)
  }

  getUnreadCount() {
    this.emit('get_unread_count')
  }

  getNotificationPreferences() {
    this.emit('get_notification_preferences')
  }

  updateNotificationPreferences(preferences) {
    this.emit('update_notification_preferences', preferences)
  }

  broadcastNotification(payload) {
    this.emit('broadcast_notification', payload)
  }

  // Attendance
  notifyAttendanceMarked(payload) {
    this.emit('attendance_marked', payload)
  }
}

const socketManager = new SocketManager()
export default socketManager
