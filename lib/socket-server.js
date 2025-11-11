const { Server } = require('socket.io')
const jwt = require('jsonwebtoken')
const { MongoClient } = require('mongodb')
const { v4: uuidv4 } = require('uuid')

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
let io
let db

// Initialize Socket.io server
function initializeSocketServer(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGINS || "*",
      methods: ["GET", "POST"],
      credentials: true
    },
    transports: ['websocket', 'polling']
  })

  // Connect to database
  connectToDatabase()

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (!token) {
        return next(new Error('Authentication error'))
      }

      const decoded = jwt.verify(token, JWT_SECRET)
      socket.userId = decoded.id
      socket.userRole = decoded.role
      socket.schoolId = decoded.schoolId

      // Store user info in socket
      socket.user = decoded
      next()
    } catch (error) {
      console.error('Socket authentication error:', error)
      next(new Error('Authentication error'))
    }
  })

  // Connection handling
  io.on('connection', (socket) => {
    console.log(`User ${socket.userId} connected`)

    // Join school room for notifications
    if (socket.schoolId) {
      socket.join(`school_${socket.schoolId}`)
    }

    // Join user-specific room
    socket.join(`user_${socket.userId}`)

    // Handle chat events
    handleChatEvents(socket)

    // Handle notification events
    handleNotificationEvents(socket)

    // Handle attendance events
    handleAttendanceEvents(socket)

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User ${socket.userId} disconnected`)
    })
  })

  return io
}

// Database connection
async function connectToDatabase() {
  try {
    const client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db(process.env.DB_NAME || 'school_management')
    console.log('Socket server connected to database')
  } catch (error) {
    console.error('Database connection error in socket server:', error)
  }
}

// Chat event handlers
function handleChatEvents(socket) {
  // Join conversation room
  socket.on('join_conversation', async (conversationId) => {
    try {
      // Verify user has access to this conversation
      const conversation = await db.collection('chat_conversations').findOne({
        id: conversationId,
        schoolId: socket.schoolId,
        $or: [
          { participants: socket.userId },
          { type: 'group' } // Allow joining group chats
        ]
      })

      if (conversation) {
        socket.join(`conversation_${conversationId}`)
        socket.emit('joined_conversation', conversationId)

        // Mark messages as read
        await db.collection('chat_messages').updateMany(
          {
            conversationId,
            senderId: { $ne: socket.userId },
            read: false
          },
          {
            $set: { read: true },
            $addToSet: { readBy: socket.userId }
          }
        )

        // Notify other participants
        socket.to(`conversation_${conversationId}`).emit('messages_read', {
          conversationId,
          readBy: socket.userId
        })
      }
    } catch (error) {
      console.error('Error joining conversation:', error)
      socket.emit('error', 'Failed to join conversation')
    }
  })

  // Leave conversation room
  socket.on('leave_conversation', (conversationId) => {
    socket.leave(`conversation_${conversationId}`)
  })

  // Send message
  socket.on('send_message', async (data) => {
    try {
      const { conversationId, messageType, content, fileUrl, fileName, fileSize } = data

      // Verify conversation access
      const conversation = await db.collection('chat_conversations').findOne({
        id: conversationId,
        schoolId: socket.schoolId,
        $or: [
          { participants: socket.userId },
          { type: 'group' }
        ]
      })

      if (!conversation) {
        socket.emit('error', 'Conversation not found or access denied')
        return
      }

      // Create message
      const message = {
        id: uuidv4(),
        conversationId,
        schoolId: socket.schoolId,
        senderId: socket.userId,
        messageType: messageType || 'text',
        content,
        fileUrl,
        fileName,
        fileSize,
        read: false,
        readBy: [socket.userId],
        createdAt: new Date().toISOString()
      }

      await db.collection('chat_messages').insertOne(message)

      // Update conversation last message
      await db.collection('chat_conversations').updateOne(
        { id: conversationId },
        {
          $set: {
            lastMessageAt: new Date().toISOString()
          }
        }
      )

      // Emit to conversation room
      io.to(`conversation_${conversationId}`).emit('new_message', message)

      // Create notification for other participants
      const otherParticipants = conversation.participants.filter(p => p !== socket.userId)
      for (const participantId of otherParticipants) {
        const notification = {
          id: uuidv4(),
          schoolId: socket.schoolId,
          recipientId: participantId,
          senderId: socket.userId,
          title: 'New Message',
          message: messageType === 'text' ? content : `Sent a ${messageType}`,
          type: 'message',
          priority: 'medium',
          read: false,
          metadata: { conversationId, messageId: message.id },
          createdAt: new Date().toISOString()
        }

        await db.collection('notifications').insertOne(notification)

        // Emit notification to user
        io.to(`user_${participantId}`).emit('notification', notification)
      }

    } catch (error) {
      console.error('Error sending message:', error)
      socket.emit('error', 'Failed to send message')
    }
  })

  // Typing indicator
  socket.on('typing_start', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_typing', {
      userId: socket.userId,
      conversationId
    })
  })

  socket.on('typing_stop', (conversationId) => {
    socket.to(`conversation_${conversationId}`).emit('user_stopped_typing', {
      userId: socket.userId,
      conversationId
    })
  })
}

// Notification event handlers
function handleNotificationEvents(socket) {
  // Mark notification as read
  socket.on('mark_notification_read', async (notificationId) => {
    try {
      await db.collection('notifications').updateOne(
        {
          id: notificationId,
          recipientId: socket.userId,
          schoolId: socket.schoolId
        },
        {
          $set: {
            read: true,
            readAt: new Date().toISOString()
          }
        }
      )

      socket.emit('notification_read', notificationId)
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  })

  // Get unread notification count
  socket.on('get_unread_count', async () => {
    try {
      const count = await db.collection('notifications').countDocuments({
        recipientId: socket.userId,
        schoolId: socket.schoolId,
        read: false
      })

      socket.emit('unread_count', count)
    } catch (error) {
      console.error('Error getting unread count:', error)
    }
  })

  // Update notification preferences
  socket.on('update_notification_preferences', async (preferences) => {
    try {
      await db.collection('notification_preferences').updateOne(
        { userId: socket.userId, schoolId: socket.schoolId },
        {
          $set: {
            ...preferences,
            updatedAt: new Date().toISOString()
          }
        },
        { upsert: true }
      )

      socket.emit('preferences_updated')
    } catch (error) {
      console.error('Error updating preferences:', error)
      socket.emit('error', 'Failed to update preferences')
    }
  })

  // Get notification preferences
  socket.on('get_notification_preferences', async () => {
    try {
      const preferences = await db.collection('notification_preferences').findOne({
        userId: socket.userId,
        schoolId: socket.schoolId
      })

      socket.emit('notification_preferences', preferences || {
        email: true,
        push: true,
        sms: false,
        chat: true,
        attendance: true,
        announcements: true,
        assignments: true
      })
    } catch (error) {
      console.error('Error getting preferences:', error)
    }
  })

  // Broadcast notification to school
  socket.on('broadcast_notification', async (notificationData) => {
    try {
      // Only school admins can broadcast
      if (socket.userRole !== 'school_admin') {
        socket.emit('error', 'Unauthorized to broadcast notifications')
        return
      }

      const { title, message, targetAudience, priority } = notificationData

      // Get target users based on audience
      let targetUsers = []

      if (targetAudience.includes('all')) {
        const users = await db.collection('users').find({
          schoolId: socket.schoolId,
          active: true
        }).toArray()
        targetUsers = users.map(u => u.id)
      } else {
        const queries = []

        if (targetAudience.includes('teachers')) {
          queries.push({ role: 'teacher' })
        }
        if (targetAudience.includes('parents')) {
          queries.push({ role: 'parent' })
        }
        if (targetAudience.includes('students')) {
          // For students, we need to get their parent IDs
          const students = await db.collection('students').find({
            schoolId: socket.schoolId,
            active: true
          }).toArray()
          const parentIds = [...new Set(students.map(s => s.parentId).filter(Boolean))]
          queries.push({ id: { $in: parentIds } })
        }

        if (queries.length > 0) {
          const users = await db.collection('users').find({
            schoolId: socket.schoolId,
            active: true,
            $or: queries
          }).toArray()
          targetUsers = users.map(u => u.id)
        }
      }

      // Create notifications for each target user
      const notifications = targetUsers.map(userId => ({
        id: uuidv4(),
        schoolId: socket.schoolId,
        recipientId: userId,
        senderId: socket.userId,
        title,
        message,
        type: 'announcement',
        priority: priority || 'medium',
        read: false,
        metadata: { broadcast: true, targetAudience },
        createdAt: new Date().toISOString()
      }))

      if (notifications.length > 0) {
        await db.collection('notifications').insertMany(notifications)

        // Emit to each user
        for (const notification of notifications) {
          io.to(`user_${notification.recipientId}`).emit('notification', notification)
        }

        socket.emit('broadcast_sent', { count: notifications.length })
      }

    } catch (error) {
      console.error('Error broadcasting notification:', error)
      socket.emit('error', 'Failed to broadcast notification')
    }
  })
}

// Attendance event handlers
function handleAttendanceEvents(socket) {
  // Notify parents when attendance is marked
  socket.on('attendance_marked', async (data) => {
    try {
      const { studentId, status, date } = data

      // Get student and parent info
      const student = await db.collection('students').findOne({
        id: studentId,
        schoolId: socket.schoolId
      })

      if (student && student.parentId) {
        const notification = {
          id: uuidv4(),
          schoolId: socket.schoolId,
          recipientId: student.parentId,
          senderId: socket.userId,
          title: 'Attendance Update',
          message: `${student.firstName} ${student.lastName} was marked ${status} on ${new Date(date).toLocaleDateString()}`,
          type: 'attendance',
          priority: 'medium',
          read: false,
          metadata: { studentId, status, date },
          createdAt: new Date().toISOString()
        }

        await db.collection('notifications').insertOne(notification)

        // Emit to parent
        io.to(`user_${student.parentId}`).emit('notification', notification)
      }
    } catch (error) {
      console.error('Error sending attendance notification:', error)
    }
  })
}

// Utility functions
function emitToSchool(schoolId, event, data) {
  io.to(`school_${schoolId}`).emit(event, data)
}

function emitToUser(userId, event, data) {
  io.to(`user_${userId}`).emit(event, data)
}

function emitToConversation(conversationId, event, data) {
  io.to(`conversation_${conversationId}`).emit(event, data)
}

// Broadcast to all users in a school
function broadcastToSchool(schoolId, event, data, excludeUserId = null) {
  const room = io.sockets.adapter.rooms.get(`school_${schoolId}`)
  if (room) {
    for (const socketId of room) {
      const socket = io.sockets.sockets.get(socketId)
      if (socket && socket.userId !== excludeUserId) {
        socket.emit(event, data)
      }
    }
  }
}

module.exports = {
  initializeSocketServer,
  emitToSchool,
  emitToUser,
  emitToConversation,
  broadcastToSchool
}
