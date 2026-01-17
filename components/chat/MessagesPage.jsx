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

    if (currentUser) {
      const token = localStorage.getItem('token')
      if (token) {
        socketManager.connect(token)
      }

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

    return () => {
      mounted = false
    }
  }, [currentUser])

  return (
    <div className="flex h-[calc(100vh-100px)] overflow-hidden bg-white/70 text-slate-800 rounded-2xl border border-slate-200/80 shadow-2xl relative">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100/70 via-transparent to-amber-100/50 pointer-events-none" />

      <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-96 border-r border-slate-200/80 bg-white/60 backdrop-blur-xl`}>
        <ConversationList
          onSelectConversation={setSelectedConversation}
          selectedConversationId={selectedConversation?.id}
          currentUser={currentUser}
        />
      </div>

      <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 bg-white/50`}>
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
                <div className="absolute inset-0 bg-sky-200/50 blur-3xl opacity-60 rounded-full animate-pulse"></div>
                <div className="relative p-8 bg-white/70 rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/70 backdrop-blur-md">
                  <MessageCircle className="h-16 w-16 text-sky-500" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">Messages</h3>
              <p className="text-slate-500 text-lg mb-8 max-w-sm mx-auto">Select a conversation from the sidebar to start connected with other users.</p>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 border border-slate-200/80 text-sm text-slate-500">
                <Sparkles size={14} className="text-amber-500" />
                <span>End-to-end encrypted</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
