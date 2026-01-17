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
    <div className="min-h-screen flex text-foreground font-sans theme-soft selection:bg-sky-200/60">
      {sidebarOpen && <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40 lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white/80 backdrop-blur-xl border-r border-slate-200/70 transform transition-all duration-300 ease-in-out flex flex-col ${sidebarOpen ? 'translate-x-0 shadow-2xl shadow-slate-200/70' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Background Gradient Effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-sky-100/80 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="relative shrink-0 flex items-center h-16 px-4 border-b border-slate-200/70 bg-white/70">
          {!sidebarCollapsed ? (
            <>
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <div className="relative shrink-0">
                  <div className="absolute inset-0 bg-sky-300 blur-lg opacity-40 rounded-full"></div>
                  {schoolSettings?.logo || school?.logo ? (
                    <img src={schoolSettings?.logo || school?.logo} alt="Logo" className="relative h-9 w-9 rounded-xl object-cover ring-2 ring-slate-200/70 shadow-lg" />
                  ) : (
                    <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-sky-400 to-emerald-300 flex items-center justify-center shadow-lg ring-2 ring-white/80">
                      <span className="font-bold text-slate-900 text-base">M</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-sm font-bold text-slate-900 block truncate leading-none mb-1">{school?.name || 'My Academy'}</span>
                  <Badge variant="outline" className="text-[10px] h-4 border-amber-300/60 text-amber-700 bg-amber-100/80 px-1 py-0 shadow-sm shadow-amber-200/40">
                    {user.role === 'developer' ? 'MASTER' : 'SCHOOL ADMIN'}
                  </Badge>
                </div>
              </div>
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:flex p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-colors ml-2"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex w-full h-full items-center justify-center text-slate-500 hover:text-slate-900 transition-colors"
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
                    ? 'text-slate-900 shadow-lg shadow-sky-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-900/5'
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-300 to-emerald-200 opacity-100" />
                  )}

                  <div className="relative flex items-center w-full">
                    <Icon className={`h-5 w-5 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0 transition-transform duration-300 ${isActive ? 'scale-110 text-on-accent' : 'text-slate-500 group-hover:text-sky-700 group-hover:scale-110'}`} />
                    {!sidebarCollapsed && <span className="flex-1 truncate">{item.label}</span>}

                    {item.id === 'messages' && unreadMessages > 0 && !sidebarCollapsed && (
                      <span className="ml-2 h-5 min-w-[20px] px-1.5 bg-rose-500 text-on-accent text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm shadow-rose-900/30">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                    {item.id === 'messages' && unreadMessages > 0 && sidebarCollapsed && (
                      <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-white/80" />
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
        <div className="sticky top-0 z-30 h-16 px-6 sm:px-8 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl flex items-center justify-between shadow-sm shadow-slate-200/80">

          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 hover:text-slate-900 p-2 rounded-xl hover:bg-slate-900/5 transition-all">
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex flex-col">
              <h1 className="text-lg font-bold bg-gradient-to-r from-slate-900 via-slate-700 to-sky-600 bg-clip-text text-transparent capitalize tracking-tight">
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
                  <Button size="icon" variant="ghost" className="rounded-full h-9 w-9 text-slate-500 hover:text-sky-600 hover:bg-sky-100">
                    <Megaphone className="h-4 w-4" />
                  </Button>
                }
              />
            )}

            <button onClick={() => setShowCalculator(true)} className="rounded-full h-9 w-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-all">
              <Calculator className="h-4 w-4" />
            </button>

            <button className="relative rounded-full h-9 w-9 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-900/5 transition-all">
              <Bell className="h-4 w-4" />
              <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>

            <div className="h-5 w-px bg-slate-200/80 mx-1"></div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 pl-1.5 pr-1 py-1 rounded-full hover:bg-slate-900/5 transition-all group">
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-slate-800 group-hover:text-sky-700 transition-colors">{user.name}</p>
                  </div>
                  <Avatar className="h-8 w-8 ring-2 ring-slate-200/80 group-hover:ring-sky-300 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-sky-400 to-emerald-300 text-slate-900 font-bold text-xs">
                      {user?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200/80 text-slate-800 mt-2 p-1 relative overflow-hidden backdrop-blur-xl shadow-xl shadow-slate-200/70">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-100/70 to-transparent pointer-events-none" />
                <DropdownMenuLabel className="pb-0 relative">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-200/80 relative" />
                {user.role === 'school_admin' && (
                  <DropdownMenuItem onClick={() => setActiveTab('school-settings')} className="text-sm px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md cursor-pointer relative focus:bg-slate-100 focus:text-slate-900">
                    <Settings className="h-4 w-4 mr-2" />Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-sm px-3 py-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer relative focus:bg-rose-100 focus:text-rose-600">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar relative">
          {/* Subtle background glow for content area */}
          <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-sky-200/60 to-transparent pointer-events-none -z-10" />
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
