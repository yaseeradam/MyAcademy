// Chat.jsx
'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { X, MessageCircle } from 'lucide-react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import socketManager from '@/lib/socket-client'

function Chat({ currentUser, isOpen, onToggle }) {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!currentUser) return
    
    const token = localStorage.getItem('token')
    if (!token) return

    if (!socketManager.socket?.connected) {
      socketManager.connect(token)
    }

    const handleConnected = () => setIsConnected(true)
    const handleDisconnected = () => setIsConnected(false)
    const handleError = (error) => {
      console.error('Socket error:', error)
      setIsConnected(false)
    }

    socketManager.on('connected', handleConnected)
    socketManager.on('disconnected', handleDisconnected)
    socketManager.on('error', handleError)

    return () => {
      socketManager.off('connected', handleConnected)
      socketManager.off('disconnected', handleDisconnected)
      socketManager.off('error', handleError)
    }
  }, [currentUser?.id])

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
  }

  const handleBackToList = () => {
    setSelectedConversation(null)
  }

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={onToggle}
          className="rounded-full h-12 w-12 shadow-lg"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
          {!isConnected && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"></div>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-[600px] shadow-2xl rounded-lg overflow-hidden bg-white border flex flex-col">
      <div className="flex items-center justify-between p-4 bg-blue-600 text-white flex-shrink-0">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <h3 className="font-medium">Messages</h3>
          <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="text-white hover:bg-blue-700 h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-hidden">
        {!selectedConversation ? (
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={null}
            currentUser={currentUser}
          />
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-2 border-b flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToList}
                className="text-blue-600 hover:text-blue-800"
              >
                ← Back to Messages
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatWindow
                conversation={selectedConversation}
                onClose={handleBackToList}
                currentUser={currentUser}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Chat
