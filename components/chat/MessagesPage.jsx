'use client'

import React, { useState, useEffect } from 'react'
import { MessageCircle, Sparkles } from 'lucide-react'
import ConversationList from './ConversationList'
import ChatWindow from './ChatWindow'
import socketManager from '@/lib/socket-client'

export default function MessagesPage({ currentUser, onBack }) {
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    let mounted = true
    
    if (currentUser && !socketManager.socket) {
      const token = localStorage.getItem('token')
      if (token) {
        socketManager.connect(token)
        
        const handleConnected = () => mounted && setIsConnected(true)
        const handleDisconnected = () => mounted && setIsConnected(false)
        const handleError = (error) => {
          console.error('Socket error:', error)
          if (mounted) setIsConnected(false)
        }
        
        socketManager.on('connected', handleConnected)
        socketManager.on('disconnected', handleDisconnected)
        socketManager.on('error', handleError)
        
        return () => {
          mounted = false
          socketManager.off('connected', handleConnected)
          socketManager.off('disconnected', handleDisconnected)
          socketManager.off('error', handleError)
        }
      }
    }
    
    return () => {
      mounted = false
    }
  }, [currentUser])

  return (
    <div className="flex h-full overflow-hidden bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-96 border-r border-gray-200/50 bg-white/80 backdrop-blur-xl shadow-xl`}>
        <ConversationList
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
          currentUser={currentUser}
        />
      </div>

      <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
            currentUser={currentUser}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30">
            <div className="text-center animate-fade-in">
              <div className="mb-6 relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 blur-3xl opacity-30 rounded-full"></div>
                <div className="relative p-10 bg-gradient-to-br from-purple-600 via-purple-500 to-blue-500 rounded-3xl shadow-2xl">
                  <MessageCircle className="h-20 w-20 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">Your Messages</h3>
              <p className="text-gray-600 text-lg">Select a conversation to start chatting</p>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
                <Sparkles size={16} className="text-purple-500" />
                <span>Real-time messaging</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  )
}