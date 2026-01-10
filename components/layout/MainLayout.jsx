'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Menu, X, ChevronLeft, ChevronRight, Crown, Calculator, Megaphone, Settings, Search, Bell } from 'lucide-react'
import BroadcastNotification from '@/components/notifications/BroadcastNotification'
import { Input } from '@/components/ui/input'

export default function MainLayout({ user, school, schoolSettings, children, activeTab, setActiveTab, navigationItems, handleLogout, setShowCalculator, unreadMessages = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#0a1628] flex text-white font-sans selection:bg-amber-500/30">
      {sidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'} bg-[#0f1d32]/95 backdrop-blur-xl border-r border-white/5 transform transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-black/50' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative shrink-0 flex items-center h-16 px-4 border-b border-white/5 bg-white/[0.02]">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-amber-500 blur-lg opacity-20 rounded-full"></div>
                  {schoolSettings?.logo || school?.logo ? (
                    <img src={schoolSettings?.logo || school?.logo} alt="Logo" className="relative h-9 w-9 rounded-xl object-cover ring-2 ring-white/10 shadow-lg" />
                  ) : (
                    <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg ring-2 ring-white/10">
                      <span className="font-bold text-white text-base">M</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-white block truncate leading-none mb-1">{school?.name || 'My Academy'}</span>
                  <Badge variant="outline" className="text-[10px] h-4 border-amber-500/20 text-amber-400 bg-amber-500/10 px-1 py-0 shadow-sm shadow-amber-900/20">
                    {user.role === 'developer' ? 'MASTER' : 'SCHOOL ADMIN'}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-1.5 rounded-lg text-blue-200/60 hover:text-white hover:bg-white/5 transition-colors ml-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex w-full h-full items-center justify-center text-blue-200/60 hover:text-white transition-colors"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-hidden pointer-events-auto flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1 custom-scrollbar">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }}
                  className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                    ? 'text-white shadow-lg shadow-amber-900/20'
                    : 'text-blue-200/60 hover:text-white hover:bg-white/5'
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 opacity-100" />
                  )}

                  <div className="relative flex items-center w-full">
                    <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'group-hover:scale-110'}`} />
                    {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}

                    {item.id === 'messages' && unreadMessages > 0 && !sidebarCollapsed && (
                      <span className="ml-2 h-5 min-w-[20px] px-1.5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-rose-900/30">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                    {item.id === 'messages' && unreadMessages > 0 && sidebarCollapsed && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-[#0f1d32]" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* User Footer Removed */}
        <div className="hidden"></div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'}`}>

        {/* Top Navbar - Glassmorphism Sticky */}
        <div className="sticky top-0 z-30 h-16 px-6 sm:px-8 border-b border-white/5 bg-[#0a1628]/80 backdrop-blur-xl flex items-center justify-between shadow-sm shadow-black/5">

          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-blue-200/60 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all">
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent capitalize tracking-tight">
                {activeTab.replace(/-/g, ' ')}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">

            {/* Quick Actions */}
            {user.role === 'school_admin' && (
              <BroadcastNotification
                currentUser={user}
                trigger={
                  <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 text-blue-200/60 hover:text-amber-400 hover:bg-amber-500/10">
                    <Megaphone className="h-4 w-4" />
                  </Button>
                }
              />
            )}

            <button onClick={() => setShowCalculator(true)} className="rounded-full h-9 w-9 flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/5 transition-all">
              <Calculator className="h-4 w-4" />
            </button>

            <button className="relative rounded-full h-9 w-9 flex items-center justify-center text-blue-200/60 hover:text-white hover:bg-white/5 transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-rose-500 rounded-full ring-2 ring-[#0a1628]"></span>
            </button>

            <div className="h-5 w-px bg-white/10 mx-1"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-1.5 pr-1 py-1 rounded-full hover:bg-white/5 transition-all group">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{user.name}</p>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-white/10 group-hover:ring-amber-400/50 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-600 text-white font-bold text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0f1d32] border-white/10 text-white mt-2 p-1 relative overflow-hidden backdrop-blur-xl">
                <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 to-transparent pointer-events-none" />
                <DropdownMenuLabel className="pb-0 relative">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-semibold text-white">{user.name}</p>
                    <p className="text-xs text-blue-200/60">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5 relative" />
                {user.role === 'school_admin' && (
                  <DropdownMenuItem onClick={() => setActiveTab('school-settings')} className="text-sm px-3 py-2 text-blue-200/70 hover:text-white hover:bg-white/10 rounded-md cursor-pointer relative focus:bg-white/10 focus:text-white">
                    <Settings className="h-4 w-4 mr-2" />Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-sm px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-md cursor-pointer relative focus:bg-rose-500/15 focus:text-rose-300">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          {/* Subtle background glow for content area */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
