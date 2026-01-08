class SocketManager {
  constructor() {
    this.socket = null
    this.listeners = new Map()
  }

  connect(token) {
    // No-op
    // Return a dummy socket object to prevent errors
    return {
        on: () => {},
        off: () => {},
        emit: () => {},
        connected: false,
        disconnect: () => {}
    }
  }

  disconnect() {
    this.socket = null
  }

  on(event, callback) {
    // Store locally just in case, but won't be triggered by network
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event).add(callback)
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback)
    }
  }

  emit(event, data) {
    // No-op
  }
  
  // Method stubs to prevent errors if called
  joinConversation() {}
  leaveConversation() {}
  sendMessage() {}
  startTyping() {}
  stopTyping() {}
  markNotificationRead() {}
  getUnreadCount() {}
  getNotificationPreferences() {}
  updateNotificationPreferences() {}
  notifyAttendanceMarked() {}
}

const socketManager = new SocketManager()
export default socketManager
