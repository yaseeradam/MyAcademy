
// ChatWindow.jsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Send, Paperclip, Image, Phone, Video, MoreVertical, Check, CheckCheck, Clock,
  Users, User, Trash2, Archive, Bell, BellOff, Smile, Mic, X, Reply, Copy, Trash
} from 'lucide-react'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import socketManager from '@/lib/socket-client'
import CallDialog from './CallDialog'
import { uploadFile } from '@/lib/file-storage'

function ChatWindow({ conversation, onClose, currentUser }) {
  const MAX_MESSAGES = 100 // Limit messages in memory
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState([])
  const [isOnline, setIsOnline] = useState(false)
  const [lastSeen, setLastSeen] = useState(null)
  const [otherUserInfo, setOtherUserInfo] = useState(null)
  const [callDialog, setCallDialog] = useState({ open: false, type: null })
  const [isMuted, setIsMuted] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [showProfileDialog, setShowProfileDialog] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [replyingTo, setReplyingTo] = useState(null)
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, message: null })
  const messagesEndRef = useRef(null)
  const recordingIntervalRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const fileInputRef = useRef(null)
  const imageInputRef = useRef(null)
  const isMountedRef = useRef(true)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    isMountedRef.current = true

    if (conversation?.id) {
      loadMessages()
      loadOtherUserInfo()
      socketManager.joinConversation(conversation.id)

      const handleNewMessage = (message) => {
        if (message.conversationId === conversation.id && isMountedRef.current) {
          setMessages(prev => {
            const updated = [...prev, message]
            // Keep only last MAX_MESSAGES to prevent memory leak
            return updated.length > MAX_MESSAGES ? updated.slice(-MAX_MESSAGES) : updated
          })
          markMessagesAsRead()
        }
      }

      const handleMessagesRead = (data) => {
        if (data.conversationId === conversation.id && isMountedRef.current) {
          setMessages(prev => prev.map(msg =>
            msg.senderId !== currentUser.id && !msg.readBy?.includes(data.readBy)
              ? { ...msg, readBy: [...(msg.readBy || []), data.readBy] }
              : msg
          ))
        }
      }

      const handleUserTyping = (data) => {
        if (data.conversationId === conversation.id && data.userId !== currentUser.id && isMountedRef.current) {
          setTypingUsers(prev => [...new Set([...prev, data.userId])])
        }
      }

      const handleUserStoppedTyping = (data) => {
        if (data.conversationId === conversation.id && isMountedRef.current) {
          setTypingUsers(prev => prev.filter(id => id !== data.userId))
        }
      }

      socketManager.on('new_message', handleNewMessage)
      socketManager.on('messages_read', handleMessagesRead)
      socketManager.on('user_typing', handleUserTyping)
      socketManager.on('user_stopped_typing', handleUserStoppedTyping)

      return () => {
        isMountedRef.current = false
        // Clear all timeouts
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
          typingTimeoutRef.current = null
        }
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current)
          recordingIntervalRef.current = null
        }
        // Remove socket listeners
        socketManager.off('new_message', handleNewMessage)
        socketManager.off('messages_read', handleMessagesRead)
        socketManager.off('user_typing', handleUserTyping)
        socketManager.off('user_stopped_typing', handleUserStoppedTyping)
        socketManager.leaveConversation(conversation.id)
      }
    }

    return () => {
      isMountedRef.current = false
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current)
    }
  }, [conversation?.id, currentUser.id])

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/messages?conversationId=${conversation.id}&limit=${MAX_MESSAGES}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok && isMountedRef.current) {
        const data = await response.json()
        // Limit messages to prevent memory issues
        const limitedData = data.slice(-MAX_MESSAGES)
        setMessages(limitedData)
        markMessagesAsRead()
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const markMessagesAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/chat/conversations/${conversation.id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  const loadOtherUserInfo = async () => {
    if (conversation.type !== 'private') return
    if (!conversation.participants || conversation.participants.length < 2) return

    try {
      const otherUserId = conversation.participants.find(p => p !== currentUser.id)
      if (!otherUserId) return

      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/user-info?userId=${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setOtherUserInfo(data)
        setIsOnline(data.isOnline || false)
        setLastSeen(data.lastSeen || null)
      }
    } catch (error) {
      console.error('Error loading user info:', error)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() && !replyingTo) return

    try {
      const token = localStorage.getItem('token')
      const messageData = {
        conversationId: conversation.id,
        messageType: 'text',
        content: newMessage.trim(),
        senderId: currentUser.id,
        senderName: currentUser.name,
        timestamp: new Date().toISOString()
      }

      if (replyingTo) {
        messageData.replyTo = replyingTo.id
      }

      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(messageData)
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
      }

      setNewMessage('')
      setReplyingTo(null)
      stopTyping()
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleFileUpload = async (file, type) => {
    if (file.size > 10 * 1024 * 1024) {
      alert('File must be less than 10MB')
      return
    }

    setUploading(true)
    try {
      const { url, storage } = await uploadFile(file, 'chat')

      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          conversationId: conversation.id,
          messageType: type,
          content: url,
          fileName: file.name,
          fileSize: file.size,
          storageType: storage,
          senderId: currentUser.id,
          senderName: currentUser.name,
          timestamp: new Date().toISOString()
        })
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      socketManager.startTyping(conversation.id)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 1000)
  }

  const stopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      socketManager.stopTyping(conversation.id)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString()
  }

  const formatLastSeen = (timestamp) => {
    if (!timestamp) return 'Offline'
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'Active now'
    if (diff < 3600000) return `Active ${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `Active ${Math.floor(diff / 3600000)}h ago`
    return `Last seen ${date.toLocaleDateString()}`
  }

  const getMessageStatus = (message) => {
    if (message.senderId !== currentUser.id) return null

    if (message.readBy && message.readBy.length > 0) {
      return <CheckCheck className="h-3 w-3 text-emerald-500" />
    } else if (message.delivered) {
      return <CheckCheck className="h-3 w-3 text-slate-400" />
    } else if (message.sent) {
      return <Check className="h-3 w-3 text-slate-400" />
    } else {
      return <Clock className="h-3 w-3 text-slate-300" />
    }
  }

  const handleDeleteConversation = async () => {
    if (!confirm('Delete this conversation? This action cannot be undone.')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/chat/conversations/${conversation.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      onClose()
    } catch (error) {
      console.error('Error deleting conversation:', error)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    if (!confirm('Delete this message?')) return
    try {
      const token = localStorage.getItem('token')
      await fetch(`/api/chat/messages/${messageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setMessages(prev => prev.filter(msg => msg.id !== messageId))
      setContextMenu({ show: false, x: 0, y: 0, message: null })
    } catch (error) {
      console.error('Error deleting message:', error)
    }
  }

  const handleCopyMessage = (content) => {
    navigator.clipboard.writeText(content)
    setContextMenu({ show: false, x: 0, y: 0, message: null })
  }

  const handleReplyToMessage = (message) => {
    setReplyingTo(message)
    setContextMenu({ show: false, x: 0, y: 0, message: null })
  }

  const handleMessageContextMenu = (e, message) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      message
    })
  }

  const handleStartRecording = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsRecording(true)
      setRecordingTime(0)

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('Could not access microphone')
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    setRecordingTime(0)
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current)
      recordingIntervalRef.current = null
    }
  }

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prev => prev + emoji)
    setShowEmojiPicker(false)
  }

  const commonEmojis = ['😊', '😂', '❤️', '👍', '🙏', '😍', '🎉', '🔥', '✨', '💯', '👏', '🤔', '😢', '😎', '🥰', '😘']

  const formatRecordingTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const otherParticipant = conversation.type === 'private'
    ? conversation.participants?.find(p => p !== currentUser.id)
    : null

  return (
    <div className="flex flex-col h-full bg-white/70 text-slate-800">
      <CallDialog
        isOpen={callDialog.open}
        onClose={() => setCallDialog({ open: false, type: null })}
        callType={callDialog.type}
        participant={otherUserInfo}
      />

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <Avatar className="h-32 w-32 ring-4 ring-slate-200/80">
              {otherUserInfo?.profilePicture ? (
                <img src={otherUserInfo.profilePicture} alt={otherUserInfo.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-emerald-300 text-slate-900 text-4xl">
                  {otherUserInfo?.name?.charAt(0).toUpperCase() || <User className="h-16 w-16" />}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-semibold">{otherUserInfo?.name || 'User'}</h3>
              <p className="text-sm text-slate-500">{otherUserInfo?.email}</p>
              {otherUserInfo?.bio && (
                <div className="mt-4 p-4 bg-white/80 rounded-lg border border-slate-200/80">
                  <p className="text-sm text-slate-600 italic">"{otherUserInfo.bio}"</p>
                </div>
              )}
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className={`h-2 w-2 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`}></div>
                <span className="text-sm text-slate-500">
                  {isOnline ? 'Active now' : formatLastSeen(lastSeen)}
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200/80 bg-white/70 backdrop-blur-xl shrink-0 h-16">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="relative flex-shrink-0 cursor-pointer"
            onClick={() => conversation.type === 'private' && setShowProfileDialog(true)}
          >
            <Avatar className="h-9 w-9 ring-2 ring-slate-200/80 hover:ring-slate-300 transition-all">
              {conversation.type === 'private' && otherUserInfo?.profilePicture ? (
                <img src={otherUserInfo.profilePicture} alt={otherUserInfo.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-sky-400 to-emerald-300 text-slate-900 text-xs">
                  {conversation.type === 'group' ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    otherUserInfo?.name?.charAt(0).toUpperCase() || <User className="h-4 w-4" />
                  )}
                </AvatarFallback>
              )}
            </Avatar>
            {conversation.type === 'private' && isOnline && (
              <div className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 bg-emerald-500 border-2 border-white rounded-full">
                <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <h3 className="font-semibold text-sm text-slate-900 truncate leading-tight">
              {conversation.type === 'group' ? conversation.name : (otherUserInfo?.name || 'Loading...')}
            </h3>
            <div className="flex items-center text-[10px] sm:text-xs">
              {conversation.type === 'private' && (
                <>
                  {typingUsers.length > 0 ? (
                    <span className="text-amber-500 font-medium italic animate-pulse">typing...</span>
                  ) : (
                    <span className={isOnline ? 'text-emerald-500 font-medium' : 'text-slate-400'}>
                      {isOnline ? 'Active now' : formatLastSeen(lastSeen)}
                    </span>
                  )}
                </>
              )}
              {conversation.type === 'group' && (
                <span className="text-slate-400">{conversation.participants?.length || 0} members</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Mobile close button */}
          <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>

          {conversation.type === 'private' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 hidden sm:flex"
                onClick={() => setCallDialog({ open: true, type: 'voice' })}
                title="Voice call"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 hidden sm:flex"
                onClick={() => setCallDialog({ open: true, type: 'video' })}
                title="Video call"
              >
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100" title="More options">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-slate-200 text-slate-800 shadow-lg shadow-slate-200/70">
              {conversation.type === 'private' && (
                <>
                  <DropdownMenuItem onClick={() => setShowProfileDialog(true)} className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    View Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-200/80" />
                </>
              )}
              <DropdownMenuItem onClick={() => setIsMuted(!isMuted)} className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer">
                {isMuted ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
                {isMuted ? 'Unmute' : 'Mute'} Notifications
              </DropdownMenuItem>
              <DropdownMenuItem className="focus:bg-slate-100 focus:text-slate-900 cursor-pointer">
                <Archive className="h-4 w-4 mr-2" />
                Archive Chat
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-slate-200/80" />
              <DropdownMenuItem onClick={handleDeleteConversation} className="text-rose-500 focus:text-rose-600 focus:bg-rose-50 cursor-pointer">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Conversation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/60 to-sky-50/70 pointer-events-none" />
        <ScrollArea className="h-full p-4">
          <div className="space-y-4 pb-2">
            {messages.map((message) => {
              const isOwnMessage = message.senderId === currentUser.id
              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
                  onContextMenu={(e) => handleMessageContextMenu(e, message)}
                >
                  <div className={`flex items-end gap-2 max-w-[85%] sm:max-w-[70%] lg:max-w-[60%]`}>
                    {!isOwnMessage && (
                      <Avatar className="h-6 w-6 flex-shrink-0 mb-1 ring-1 ring-slate-200/80">
                        {otherUserInfo?.profilePicture ? (
                          <img src={otherUserInfo.profilePicture} alt={otherUserInfo.name} className="h-full w-full object-cover rounded-full" />
                        ) : (
                          <AvatarFallback className="bg-gradient-to-br from-sky-400 to-emerald-300 text-slate-900 text-[10px]">
                            {otherUserInfo?.name?.charAt(0).toUpperCase() || <User className="h-3 w-3" />}
                          </AvatarFallback>
                        )}
                      </Avatar>
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      {!isOwnMessage && conversation.type === 'group' && (
                        <span className="text-[10px] text-slate-400 font-medium mb-1 px-2">
                          {otherUserInfo?.name || message.senderName || 'User'}
                        </span>
                      )}

                      {/* Reply Context */}
                      {message.replyTo && replyingTo && ( // Note: This logic assumes replyingTo is available, effectively we need message.replyToDetails from backend usually
                        <div className="bg-white/80 rounded-t-lg px-3 py-1 mb-0.5 border-l-2 border-amber-400 mx-1">
                          <p className="text-[10px] text-amber-500 font-medium">Replied to message</p>
                        </div>
                      )}

                      <div
                        className={`px-4 py-2 shadow-sm relative text-sm ${isOwnMessage
                            ? 'bg-gradient-to-br from-sky-500 to-emerald-400 text-white rounded-2xl rounded-tr-sm'
                            : 'bg-white/90 backdrop-blur-md text-slate-700 border border-slate-200/80 rounded-2xl rounded-tl-sm'
                          }`}
                      >
                        {message.messageType === 'image' ? (
                          <img src={message.content} alt="Shared" className="max-w-xs rounded-lg border border-slate-200/80" />
                        ) : message.messageType === 'file' ? (
                          <a href={message.content} download={message.fileName} className="flex items-center space-x-2 hover:underline">
                            <Paperclip className="h-4 w-4" />
                            <span className="text-sm">{message.fileName} ({(message.fileSize / 1024).toFixed(1)}KB)</span>
                          </a>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        )}
                      </div>

                      <div className={`flex items-center mt-1 gap-1 ${isOwnMessage ? 'justify-end pr-1' : 'justify-start pl-1'
                        }`}>
                        <span className={`text-[10px] ${isOwnMessage ? 'text-slate-500' : 'text-slate-400'
                          }`}>
                          {formatTime(message.timestamp || message.createdAt)}
                        </span>
                        {isOwnMessage && getMessageStatus(message)}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {contextMenu.show && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setContextMenu({ show: false, x: 0, y: 0, message: null })}
          />
          <div
            className="fixed z-50 bg-white rounded-lg shadow-xl border border-slate-200/80 py-1 min-w-[160px] text-slate-800"
            style={{
              left: `${Math.min(contextMenu.x, window.innerWidth - 180)}px`,
              top: `${Math.min(contextMenu.y, window.innerHeight - 150)}px`,
            }}
          >
            <button
              onClick={() => handleReplyToMessage(contextMenu.message)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center space-x-2"
            >
              <Reply className="h-3.5 w-3.5" />
              <span>Reply</span>
            </button>
            <button
              onClick={() => handleCopyMessage(contextMenu.message.content)}
              className="w-full px-4 py-2 text-left text-sm hover:bg-slate-100 flex items-center space-x-2"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </button>
            {contextMenu.message.senderId === currentUser.id && (
              <button
                onClick={() => handleDeleteMessage(contextMenu.message.id)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-rose-50 text-rose-600 flex items-center space-x-2"
              >
                <Trash className="h-3.5 w-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </>
      )}

      {replyingTo && (
        <div className="px-4 py-2 bg-white/80 backdrop-blur-md border-t border-slate-200/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-1 self-stretch bg-amber-400 rounded-full"></div>
            <div className="flex-1 min-w-0 py-0.5">
              <p className="text-xs text-amber-500 font-semibold mb-0.5">Replying to {replyingTo.senderName || 'User'}</p>
              <p className="text-xs text-slate-500 truncate">{replyingTo.content}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 flex-shrink-0 hover:bg-slate-100 rounded-full text-slate-500"
            onClick={() => setReplyingTo(null)}
            title="Cancel reply"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {showEmojiPicker && (
        <div className="px-4 py-3 bg-white border-t border-slate-200/80">
          <div className="grid grid-cols-8 gap-2">
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleEmojiSelect(emoji)}
                className="text-xl hover:bg-slate-100 rounded p-1 transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-slate-200/80 bg-white/70 backdrop-blur-md">
        {isRecording ? (
          <div className="flex items-center gap-3 bg-rose-50 p-3 rounded-2xl border border-rose-200 animate-pulse">
            <div className="flex items-center gap-2 flex-1">
              <div className="h-2.5 w-2.5 bg-rose-500 rounded-full animate-ping" />
              <span className="text-sm font-semibold text-rose-600">
                Recording {formatRecordingTime(recordingTime)}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full hover:bg-rose-100 flex-shrink-0 text-rose-600"
              onClick={handleStopRecording}
              title="Cancel recording"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              className="h-8 w-8 rounded-full bg-rose-500 hover:bg-rose-600 flex-shrink-0 text-white shadow-lg shadow-rose-200/70"
              onClick={handleStopRecording} // Should be handleSendRecording logic eventually
              title="Send recording"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="flex items-end gap-2">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'file')}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image')}
            />
            <div className="flex items-center gap-1 self-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                title="Attach file"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0"
                onClick={() => imageInputRef.current?.click()}
                disabled={uploading}
                title="Send image"
              >
                <Image className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0 hidden sm:flex"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                title="Add emoji"
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 bg-white/80 rounded-2xl border border-slate-200 focus-within:bg-white focus-within:border-sky-300 transition-all flex items-end">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  handleTyping()
                }}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none text-sm text-slate-700 placeholder:text-slate-400 px-4 py-3 focus:outline-none min-h-[44px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 m-1 rounded-full text-slate-500 hover:text-amber-500 hover:bg-amber-100 sm:hidden"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>

            {newMessage.trim() ? (
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-2xl bg-gradient-to-br from-sky-500 to-emerald-400 hover:from-sky-600 hover:to-emerald-500 text-white shadow-lg shadow-sky-200/70 transition-all self-center"
                disabled={!newMessage.trim() && !replyingTo}
              >
                <Send className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-2xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors self-center"
                onClick={handleStartRecording}
                title="Record voice"
              >
                <Mic className="h-5 w-5" />
              </Button>
            )}
          </form>
        )}
      </div>
    </div>
  )
}

export default ChatWindow
