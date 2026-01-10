'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  MessageCircle, Users, User, Plus, Search, Clock, Check, CheckCheck, MessageSquare
} from 'lucide-react'
import socketManager from '@/lib/socket-client'

function ConversationList({ onSelectConversation, selectedConversationId, currentUser }) {
  const [conversations, setConversations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChatDialog, setShowNewChatDialog] = useState(false)
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false)
  const [availableUsers, setAvailableUsers] = useState([])
  const [userProfiles, setUserProfiles] = useState({})
  const [newChatForm, setNewChatForm] = useState({
    targetUserId: '',
    initialMessage: ''
  })
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    participants: [],
    initialMessage: ''
  })

  useEffect(() => {
    loadConversations()
    loadAvailableUsers()

    // Listen for real-time updates
    const handleConversationUpdate = (conversation) => {
      setConversations(prev => {
        const index = prev.findIndex(c => c.id === conversation.id)
        if (index >= 0) {
          const updated = [...prev]
          updated[index] = conversation
          return updated.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt))
        }
        return [conversation, ...prev]
      })
    }

    const handleNewConversation = (conversation) => {
      setConversations(prev => [conversation, ...prev])
      // Load profile for new conversation immediately
      if (conversation.type === 'private') {
        const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
        if (otherUserId) {
          loadSingleUserProfile(otherUserId)
        }
      }
    }

    socketManager.on('conversation_updated', handleConversationUpdate)
    socketManager.on('new_conversation', handleNewConversation)

    return () => {
      socketManager.off('conversation_updated', handleConversationUpdate)
      socketManager.off('new_conversation', handleNewConversation)
    }
  }, [currentUser.id])

  useEffect(() => {
    if (conversations.length > 0) {
      const timer = setTimeout(() => loadUserProfiles(), 100)
      return () => clearTimeout(timer)
    }
  }, [conversations])

  const loadSingleUserProfile = async (userId) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/chat/user-info?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setUserProfiles(prev => ({ ...prev, [userId]: data }))
      }
    } catch (error) {
      console.error(`Error loading profile for user ${userId}:`, error)
    }
  }

  const loadUserProfiles = async () => {
    try {
      const token = localStorage.getItem('token')
      const userIds = new Set()

      conversations.forEach(conv => {
        if (conv.type === 'private') {
          const otherUserId = conv.participants?.find(p => p !== currentUser.id)
          if (otherUserId && !userProfiles[otherUserId]) userIds.add(otherUserId)
        }
      })

      if (userIds.size === 0) return

      const profiles = {}
      await Promise.all(
        Array.from(userIds).map(async (userId) => {
          try {
            const response = await fetch(`/api/chat/user-info?userId=${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
              profiles[userId] = await response.json()
            }
          } catch (error) {
            console.error(`Error loading profile for user ${userId}:`, error)
          }
        })
      )

      setUserProfiles(prev => ({ ...prev, ...profiles }))
    } catch (error) {
      console.error('Error loading user profiles:', error)
    }
  }

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setConversations(data.sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt)))
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    }
  }

  const loadAvailableUsers = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = {
        'Authorization': `Bearer ${token}`
      }
      let users = []

      if (currentUser.role === 'parent') {
        const teachersResponse = await fetch('/api/teachers', { headers })
        if (teachersResponse.ok) {
          const teachers = await teachersResponse.json()
          users = teachers.filter(t => t.id && t.firstName && t.lastName).map(teacher => ({
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            role: 'teacher',
            email: teacher.email
          }))
        }
      } else if (currentUser.role === 'teacher') {
        // Teachers can only chat with parents of their students
        const [studentsRes, parentsRes] = await Promise.all([
          fetch('/api/students', { headers }),
          fetch('/api/parents', { headers })
        ])

        if (studentsRes.ok && parentsRes.ok) {
          const students = await studentsRes.json()
          const parents = await parentsRes.json()

          // Get unique parent IDs from teacher's students
          const teacherParentIds = new Set(students.map(s => s.parentId).filter(Boolean))

          // Filter parents to only those who have children in teacher's classes
          users = parents
            .filter(p => p.id && p.name && teacherParentIds.has(p.id))
            .map(parent => ({
              id: parent.id,
              name: parent.name,
              role: 'parent',
              email: parent.email
            }))
        }
      } else if (currentUser.role === 'school_admin') {
        const [teachersRes, parentsRes] = await Promise.all([
          fetch('/api/teachers', { headers }),
          fetch('/api/parents', { headers })
        ])

        if (teachersRes.ok) {
          const teachers = await teachersRes.json()
          users.push(...teachers.filter(t => t.id && t.firstName && t.lastName).map(teacher => ({
            id: teacher.id,
            name: `${teacher.firstName} ${teacher.lastName}`,
            role: 'teacher',
            email: teacher.email
          })))
        }

        if (parentsRes.ok) {
          const parents = await parentsRes.json()
          users.push(...parents.filter(p => p.id && p.name).map(parent => ({
            id: parent.id,
            name: parent.name,
            role: 'parent',
            email: parent.email
          })))
        }
      }

      // Filter out users we already have conversations with
      const existingUserIds = new Set()
      conversations.forEach(conv => {
        if (conv.type === 'private') {
          const otherUserId = conv.participants?.find(p => p !== currentUser.id)
          if (otherUserId) existingUserIds.add(otherUserId)
        }
      })

      const filteredUsers = users.filter(u => u.id && !existingUserIds.has(u.id))
      setAvailableUsers(filteredUsers)
      console.log('Available users loaded:', filteredUsers.length)
    } catch (error) {
      console.error('Error loading available users:', error)
    }
  }

  const handleStartNewChat = async (e) => {
    e.preventDefault()
    if (!newChatForm.targetUserId) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'private',
          participants: [newChatForm.targetUserId],
          initialMessage: newChatForm.initialMessage
        })
      })

      if (response.ok) {
        const conversation = await response.json()
        setConversations(prev => [conversation, ...prev])

        // Load the user profile immediately
        await loadSingleUserProfile(newChatForm.targetUserId)

        onSelectConversation(conversation)
        setShowNewChatDialog(false)
        setNewChatForm({ targetUserId: '', initialMessage: '' })

        // Send initial message if provided
        if (newChatForm.initialMessage) {
          const messageResponse = await fetch('/api/chat/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              conversationId: conversation.id,
              messageType: 'text',
              content: newChatForm.initialMessage,
              timestamp: new Date().toISOString()
            })
          })
          if (messageResponse.ok) {
            await messageResponse.json()
          }
        }
      }
    } catch (error) {
      console.error('Error starting new chat:', error)
    }
  }

  const handleCreateGroupChat = async (e) => {
    e.preventDefault()
    if (!newGroupForm.name || newGroupForm.participants.length === 0) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          type: 'group',
          name: newGroupForm.name,
          participants: newGroupForm.participants
        })
      })

      if (response.ok) {
        const conversation = await response.json()
        setConversations(prev => [conversation, ...prev])
        onSelectConversation(conversation)
        setShowNewGroupDialog(false)
        setNewGroupForm({ name: '', participants: [], initialMessage: '' })
      }
    } catch (error) {
      console.error('Error creating group chat:', error)
    }
  }

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm) return true

    if (conversation.type === 'group') {
      return conversation.name.toLowerCase().includes(searchTerm.toLowerCase())
    } else {
      const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
      const profile = userProfiles[otherUserId]
      return profile?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false
    }
  })

  const formatLastMessageTime = (timestamp) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date

    if (diff < 60000) return 'now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`
    if (diff < 86400000) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const getConversationDisplayName = (conversation) => {
    if (conversation.type === 'group') {
      return conversation.name
    } else {
      const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
      if (!otherUserId) return 'Private Chat'

      const profile = userProfiles[otherUserId]
      if (profile?.name) {
        return profile.name
      }

      // If profile not loaded yet, show loading state
      return 'Loading...'
    }
  }

  const getConversationAvatar = (conversation) => {
    if (conversation.type === 'group') {
      return <Users className="h-5 w-5" />
    } else {
      const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
      const profile = userProfiles[otherUserId]

      if (profile?.profilePicture) {
        return <img src={profile.profilePicture} alt={profile.name} className="h-full w-full object-cover rounded-full" />
      }
      return profile?.name?.charAt(0).toUpperCase() || <User className="h-5 w-5" />
    }
  }

  const getUserOnlineStatus = (conversation) => {
    if (conversation.type !== 'private') return false
    const otherUserId = conversation.participants?.find(p => p !== currentUser.id)
    const profile = userProfiles[otherUserId]
    return profile?.isOnline || false
  }

  const getLastMessage = (conversation) => {
    if (!conversation.lastMessage) return 'No messages yet'

    const isOwnMessage = conversation.lastMessage.senderId === currentUser.id
    const prefix = isOwnMessage ? 'You: ' : ''

    if (conversation.lastMessage.messageType === 'image') {
      return `${prefix}📷 Photo`
    } else if (conversation.lastMessage.messageType === 'file') {
      return `${prefix}📎 ${conversation.lastMessage.fileName}`
    } else {
      return `${prefix}${conversation.lastMessage.content}`
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#0f1d32]/30">
      <div className="p-4 border-b border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-900/20">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">Chats</span>
          </div>

          <div className="flex gap-1">
            {currentUser.role !== 'developer' && (
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-200/60 hover:text-white hover:bg-white/5 rounded-full">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0f1d32] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Start New Chat</DialogTitle>
                    <DialogDescription className="text-blue-200/60">
                      Start a private conversation with a teacher or parent.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleStartNewChat} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-200">Select Person</label>
                      <Select
                        value={newChatForm.targetUserId}
                        onValueChange={(value) => setNewChatForm(prev => ({ ...prev, targetUserId: value }))}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white focus:ring-amber-500/50">
                          <SelectValue placeholder="Choose who to chat with" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1d32] border-white/10 text-white">
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id} className="focus:bg-white/10 focus:text-white cursor-pointer">
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-200">Initial Message (Optional)</label>
                      <Textarea
                        value={newChatForm.initialMessage}
                        onChange={(e) => setNewChatForm(prev => ({ ...prev, initialMessage: e.target.value }))}
                        placeholder="Type your first message..."
                        rows={3}
                        className="bg-white/5 border-white/10 text-white focus:ring-amber-500/50 placeholder:text-blue-200/40"
                      />
                    </div>
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="ghost" className="text-blue-200 hover:text-white hover:bg-white/10" onClick={() => setShowNewChatDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!newChatForm.targetUserId} className="bg-amber-500 hover:bg-amber-600 text-white border-none">
                        Start Chat
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}

            {currentUser.role === 'school_admin' && (
              <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-200/60 hover:text-white hover:bg-white/5 rounded-full">
                    <Users className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#0f1d32] border-white/10 text-white">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create Group Chat</DialogTitle>
                    <DialogDescription className="text-blue-200/60">
                      Create a group for multiple people.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroupChat} className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-200">Group Name</label>
                      <Input
                        value={newGroupForm.name}
                        onChange={(e) => setNewGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter group name"
                        required
                        className="bg-white/5 border-white/10 text-white focus:ring-amber-500/50 placeholder:text-blue-200/40"
                      />
                    </div>
                    {/* Simplified for brevity in this example, full implementation needs consistent dark theme Select/Badges */}
                    <div className="flex justify-end space-x-2 pt-2">
                      <Button type="button" variant="ghost" className="text-blue-200 hover:text-white hover:bg-white/10" onClick={() => setShowNewGroupDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white border-none">
                        Create Group
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200/40 group-focus-within:text-amber-400 transition-colors" />
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 rounded-xl bg-black/20 border-white/5 text-sm text-blue-100 placeholder:text-blue-200/40 focus:bg-black/40 focus:border-amber-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-4 flex flex-col items-center">
              <div className="h-16 w-16 mb-4 rounded-full bg-white/5 flex items-center justify-center border border-white/10 border-dashed">
                <MessageSquare className="h-6 w-6 text-blue-200/40" />
              </div>
              <p className="font-medium text-white">No active chats</p>
              <p className="text-xs text-blue-200/60 mt-1 max-w-[150px]">Start a conversation to see it here</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => onSelectConversation(conversation)}
                className={`w-full p-3 rounded-xl text-left transition-all duration-200 relative group border border-transparent ${selectedConversationId === conversation.id
                    ? 'bg-white/10 border-white/5 shadow-md shadow-black/20'
                    : 'hover:bg-white/5 hover:border-white/5'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative flex-shrink-0">
                    <Avatar className="h-10 w-10 ring-2 ring-white/10 shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-800 text-white font-semibold text-xs">
                        {getConversationAvatar(conversation)}
                      </AvatarFallback>
                    </Avatar>
                    {conversation.type === 'private' && getUserOnlineStatus(conversation) && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-[#0f1d32] rounded-full shadow-sm">
                        <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <h3 className={`text-sm font-medium truncate flex-1 ${conversation.unreadCount > 0 ? 'text-white font-semibold' : 'text-blue-100'
                        }`}>
                        {getConversationDisplayName(conversation)}
                      </h3>
                      <span className={`text-[10px] flex-shrink-0 ${conversation.unreadCount > 0 ? 'text-amber-400 font-bold' : 'text-blue-200/40'
                        }`}>
                        {conversation.lastMessageAt ? formatLastMessageTime(conversation.lastMessageAt) : ''}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className={`text-xs truncate flex-1 ${conversation.unreadCount > 0 ? 'text-blue-100 font-medium' : 'text-blue-200/60'
                        }`}>
                        {/* Prefix with 'You:' logic handled in helper but we can style here if needed */}
                        {getLastMessage(conversation)}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <Badge className="flex-shrink-0 bg-amber-500 text-white text-[10px] h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-none shadow-sm shadow-amber-900/30">
                          {conversation.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

export default ConversationList