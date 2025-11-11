// ConversationList.jsx
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
              senderId: currentUser.id,
              senderName: currentUser.name,
              timestamp: new Date().toISOString()
            })
          })
          
          if (messageResponse.ok) {
            const message = await messageResponse.json()
            socketManager.sendMessage(message)
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
    <div className="flex flex-col h-full">
      <div className="p-5 border-b border-gray-200/50 bg-gradient-to-r from-purple-600 via-purple-500 to-blue-500">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <MessageCircle size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Messages</h2>
              <p className="text-xs text-white/80">{conversations.length} conversations</p>
            </div>
          </div>
          <div className="flex gap-1">
            {currentUser.role !== 'developer' && (
              <Dialog open={showNewChatDialog} onOpenChange={setShowNewChatDialog}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-white/20 text-white">
                    <Plus className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Start New Chat</DialogTitle>
                    <DialogDescription>
                      Start a private conversation with a teacher or parent.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleStartNewChat} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Select Person</label>
                      <Select
                        value={newChatForm.targetUserId}
                        onValueChange={(value) => setNewChatForm(prev => ({ ...prev, targetUserId: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose who to chat with" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Initial Message (Optional)</label>
                      <Textarea
                        value={newChatForm.initialMessage}
                        onChange={(e) => setNewChatForm(prev => ({ ...prev, initialMessage: e.target.value }))}
                        placeholder="Type your first message..."
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewChatDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!newChatForm.targetUserId}>
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
                  <Button variant="ghost" size="sm" className="hover:bg-white/20 text-white">
                    <Users className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Group Chat</DialogTitle>
                    <DialogDescription>
                      Create a group conversation for announcements or discussions.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateGroupChat} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Group Name</label>
                      <Input
                        value={newGroupForm.name}
                        onChange={(e) => setNewGroupForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter group name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Add Members</label>
                      <Select
                        value=""
                        onValueChange={(value) => {
                          if (!newGroupForm.participants.includes(value)) {
                            setNewGroupForm(prev => ({
                              ...prev,
                              participants: [...prev.participants, value]
                            }))
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add members to the group" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {newGroupForm.participants.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {newGroupForm.participants.map((participantId) => {
                            const user = availableUsers.find(u => u.id === participantId)
                            return (
                              <Badge key={participantId} variant="secondary" className="text-xs">
                                {user?.name || 'Unknown'}
                                <button
                                  type="button"
                                  onClick={() => setNewGroupForm(prev => ({
                                    ...prev,
                                    participants: prev.participants.filter(id => id !== participantId)
                                  }))}
                                  className="ml-1 hover:text-red-500"
                                >
                                  ×
                                </button>
                              </Badge>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewGroupDialog(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={!newGroupForm.name || newGroupForm.participants.length === 0}>
                        Create Group
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 rounded-xl bg-white/90 backdrop-blur-sm border-white/50 shadow-sm focus:ring-2 focus:ring-white/50 focus:bg-white transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
        <ScrollArea className="h-full">
          <div className="space-y-1 p-3">
            {filteredConversations.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="mb-4 relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 blur-2xl opacity-20 rounded-full"></div>
                  <div className="relative p-8 bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl">
                    <MessageSquare className="h-14 w-14 text-purple-600" />
                  </div>
                </div>
                <p className="font-bold text-gray-800 text-lg">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-2">Start a new chat to get connected</p>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation)}
                  className={`w-full p-3.5 rounded-xl text-left transition-all duration-200 relative group ${
                    selectedConversationId === conversation.id 
                      ? 'bg-gradient-to-r from-purple-100 to-blue-100 shadow-lg scale-[0.98] border border-purple-200' 
                      : 'hover:bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <Avatar className="h-12 w-12 ring-2 ring-white shadow-md">
                        <AvatarFallback className="bg-gradient-to-br from-purple-600 to-blue-600 text-white font-semibold">
                          {getConversationAvatar(conversation)}
                        </AvatarFallback>
                      </Avatar>
                      {conversation.type === 'private' && getUserOnlineStatus(conversation) && (
                        <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 bg-green-500 border-2 border-white rounded-full">
                          <span className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-75"></span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`text-sm font-semibold truncate flex-1 ${
                          conversation.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {getConversationDisplayName(conversation)}
                        </h3>
                        <span className={`text-xs flex-shrink-0 ${
                          conversation.unreadCount > 0 ? 'text-purple-600 font-semibold' : 'text-gray-500'
                        }`}>
                          {conversation.lastMessageAt ? formatLastMessageTime(conversation.lastMessageAt) : ''}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate flex-1 ${
                          conversation.unreadCount > 0 ? 'font-medium text-gray-800' : 'text-gray-500'
                        }`}>
                          {getLastMessage(conversation)}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <Badge className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs px-2 py-0.5 shadow-sm font-semibold min-w-[20px] text-center">
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
    </div>
  )
}

export default ConversationList