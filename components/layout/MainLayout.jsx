'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Menu, X, ChevronLeft, ChevronRight, Crown, Calculator, Megaphone, Settings } from 'lucide-react'
import BroadcastNotification from '@/components/notifications/BroadcastNotification'

export default function MainLayout({ user, school, schoolSettings, children, activeTab, setActiveTab, navigationItems, handleLogout, setShowCalculator, unreadMessages = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a1628] flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-[#0f1d32] via-[#0a1628] to-[#071018] shadow-2xl border-r border-white/5 transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center">
            {schoolSettings?.logo || school?.logo ? (
              <img src={schoolSettings?.logo || school?.logo} alt="Logo" className="h-10 w-10 mr-3 rounded-xl object-cover ring-2 ring-amber-400/50" />
            ) : (
              <img src="/logo.png" alt="My Academy" className="h-10 w-10 mr-3 rounded-xl object-cover ring-2 ring-amber-400/50" />
            )}
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-white block leading-tight">{school?.name || 'My Academy'}</span>
                {user.role === 'developer' && <span className="text-xs text-amber-400 font-medium">Master System</span>}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block text-blue-200/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-blue-200/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-200 group relative ${activeTab === item.id
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]'
                  : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                {item.id === 'messages' && unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/5 p-4 bg-white/5">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3 ring-2 ring-amber-400/50">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-medium">{user?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <Badge className="text-xs capitalize bg-amber-500/20 text-amber-300 border-amber-400/30">{user.role === 'school_admin' ? 'Admin' : user.role}</Badge>
                  {user.role === 'developer' && <Crown className="h-3 w-3 text-amber-400" />}
                </div>
              </div>
            )}
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className={`${sidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full'} justify-center bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all`}>
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <div className="bg-[#0f1d32] border-b border-white/5 h-16 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-blue-200/60 hover:text-white mr-4 p-2 rounded-xl hover:bg-white/10 transition-all">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              {(schoolSettings?.logo || school?.logo) && (
                <img src={schoolSettings?.logo || school?.logo} alt="School Logo" className="h-8 w-8 rounded-lg object-cover ring-2 ring-white/10" />
              )}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent capitalize">{activeTab.replace('-', ' ')}</h1>
              </div>
              {user.role !== 'developer' && school && <Badge className="text-xs bg-white/10 text-blue-200 border border-white/10">{school.name}</Badge>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user.role === 'school_admin' && (
              <BroadcastNotification currentUser={user} trigger={<Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all" size="sm"><Megaphone className="h-4 w-4 mr-2" />Broadcast</Button>} />
            )}
            <button onClick={() => setShowCalculator(true)} className="p-2.5 rounded-xl hover:bg-white/10 transition-all text-blue-200/60 hover:text-amber-400 group">
              <Calculator className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/10 transition-all group">
                  <Avatar className="h-9 w-9 ring-2 ring-white/10 group-hover:ring-amber-400/50 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-semibold text-sm">{user?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0f1d32] border-white/10 text-white">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-blue-200/60">{user.email}</p>
                    <Badge variant="secondary" className="text-xs w-fit capitalize bg-amber-500/20 text-amber-300 border-amber-400/30">{user.role === 'school_admin' ? 'Admin' : user.role.replace('_', ' ')}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                {user.role === 'school_admin' && (
                  <DropdownMenuItem onClick={() => setActiveTab('school-settings')} className="text-blue-200/70 hover:text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
                    <Settings className="h-4 w-4 mr-2" />Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 focus:text-red-300">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
