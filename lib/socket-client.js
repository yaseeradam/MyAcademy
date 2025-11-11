'use client'

import { io } from 'socket.io-client'

class SocketManager {
  constructor() {
    this.socket = null
    this.isConnected = false
    this.eventListeners = new Map()
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      return this.socket
    }

    const serverUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    this.socket = io(serverUrl, {
      auth: {
        token
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    })

    this.setupEventListeners()
    return this.socket
  }

  // Setup event listeners
  setupEventListeners() {
    if (!this.socket) return

    // Connection events
    this.socket.on('connect', () => {
      console.log('Connected to server')
      this.isConnected = true
      this.reconnectAttempts = 0
      this.emit('connected')
    })

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason)
      this.isConnected = false
      this.emit('disconnected', reason)
    })

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error)
      this.isConnected = false
      this.handleReconnect()
    })

    // Chat events
    this.socket.on('new_message', (message) => {
      this.emit('new_message', message)
    })

    this.socket.on('messages_read', (data) => {
      this.emit('messages_read', data)
    })

    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data)
    })

    this.socket.on('user_stopped_typing', (data) => {
      this.emit('user_stopped_typing', data)
    })

    this.socket.on('joined_conversation', (conversationId) => {
      this.emit('joined_conversation', conversationId)
    })

    // Notification events
    this.socket.on('notification', (notification) => {
      this.emit('notification', notification)
    })

    this.socket.on('notification_read', (notificationId) => {
      this.emit('notification_read', notificationId)
    })

    this.socket.on('unread_count', (count) => {
      this.emit('unread_count', count)
    })

    this.socket.on('notification_preferences', (preferences) => {
      this.emit('notification_preferences', preferences)
    })

    this.socket.on('preferences_updated', () => {
      this.emit('preferences_updated')
    })

    // Broadcast events
    this.socket.on('broadcast_sent', (data) => {
      this.emit('broadcast_sent', data)
    })

    // Error handling
    this.socket.on('error', (error) => {
      console.error('Socket error:', error)
      this.emit('error', error)
    })
  }

  // Handle reconnection
  handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000)

      setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        this.socket.connect()
      }, delay)
    } else {
      console.error('Max reconnection attempts reached')
      this.emit('reconnect_failed')
    }
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect()
      this.socket = null
      this.isConnected = false
    }
  }

  // Event system for React components
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event).push(callback)
  }

  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event)
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(...args)
        } catch (error) {
          console.error('Error in event callback:', error)
        }
      })
    }
  }

  // Chat methods
  joinConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_conversation', conversationId)
    }
  }

  leaveConversation(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_conversation', conversationId)
    }
  }

  sendMessage(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', data)
    }
  }

  startTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', conversationId)
    }
  }

  stopTyping(conversationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', conversationId)
    }
  }

  // Notification methods
  markNotificationRead(notificationId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_notification_read', notificationId)
    }
  }

  getUnreadCount() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_unread_count')
    }
  }

  getNotificationPreferences() {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_notification_preferences')
    }
  }

  updateNotificationPreferences(preferences) {
    if (this.socket && this.isConnected) {
      this.socket.emit('update_notification_preferences', preferences)
    }
  }

  // Attendance methods
  notifyAttendanceMarked(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('attendance_marked', data)
    }
  }

  // Broadcast methods
  broadcastNotification(data) {
    if (this.socket && this.isConnected) {
      this.socket.emit('broadcast_notification', data)
    }
  }

  // Utility methods
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts
    }
  }

  // Cleanup
  cleanup() {
    // Clear all event listeners
    this.eventListeners.clear()
    // Disconnect socket
    this.disconnect()
    // Reset state
    this.reconnectAttempts = 0
    this.isConnected = false
  }

  // Remove all listeners for a specific event
  removeAllListeners(event) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.delete(event)
    }
  }
}

// Create singleton instance
const socketManager = new SocketManager()

export default socketManager
