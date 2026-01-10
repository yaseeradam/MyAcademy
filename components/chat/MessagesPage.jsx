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
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-[#0a1628] text-white rounded-2xl border border-white/5 shadow-2xl relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-amber-900/5 pointer-events-none" />

      <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-96 border-r border-white/5 bg-[#0f1d32]/50 backdrop-blur-xl`}>
        <ConversationList
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
          currentUser={currentUser}
        />
      </div>

      <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 bg-white/[0.02]`}>
        {selectedConversation ? (
          <ChatWindow
            conversation={selectedConversation}
            onClose={() => setSelectedConversation(null)}
            currentUser={currentUser}
          />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="mb-8 relative inline-flex items-center justify-center">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl opacity-50 rounded-full animate-pulse"></div>
                <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl border border-white/10 shadow-2xl shadow-black/50 backdrop-blur-md">
                  <MessageCircle className="h-16 w-16 text-amber-400" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-white mb-3 tracking-tight">Messages</h3>
              <p className="text-blue-200/60 text-lg mb-8 max-w-sm mx-auto">Select a conversation from the sidebar to start connected with other users.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-blue-200/80">
                <Sparkles size={14} className="text-amber-400" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}