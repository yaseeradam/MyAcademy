'use client'

import React, { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { LogOut, Menu, X, ChevronLeft, ChevronRight, School, Crown, Calculator, Megaphone, Settings } from 'lucide-react'
import BroadcastNotification from '@/components/notifications/BroadcastNotification'

export default function MainLayout({ user, school, schoolSettings, children, activeTab, setActiveTab, navigationItems, handleLogout, setShowCalculator, unreadMessages = 0 }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center">
            {schoolSettings?.logo || school?.logo ? (
              <img src={schoolSettings?.logo || school?.logo} alt="Logo" className="h-12 w-12 mr-3 rounded-xl object-cover ring-2 ring-blue-400/50" />
            ) : (
              <div className="h-12 w-12 mr-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <School className="h-7 w-7 text-white" />
              </div>
            )}
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-white block leading-tight">{school?.name || 'My Academy'}</span>
                {user.role === 'developer' && <span className="text-xs text-blue-400 font-medium">Master System</span>}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="hidden lg:block text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all">
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false) }} className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-200 group relative ${activeTab === item.id ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}>
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'}`} />
                {!sidebarCollapsed && <span className="flex-1">{item.label}</span>}
                {item.id === 'messages' && unreadMessages > 0 && (
                  <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">{unreadMessages > 9 ? '9+' : unreadMessages}</span>
                )}
              </button>
            )
          })}
        </nav>

        <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3 ring-2 ring-blue-400/50">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">{user?.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <Badge className="text-xs capitalize bg-blue-500/20 text-blue-300 border-blue-400/30">{user.role === 'school_admin' ? 'Admin' : user.role}</Badge>
                  {user.role === 'developer' && <Crown className="h-3 w-3 text-yellow-400" />}
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
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="bg-white shadow-md h-16 flex items-center justify-between px-4 lg:px-6 border-b border-gray-100">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-600 hover:text-gray-900 mr-4 p-2 rounded-xl hover:bg-gray-100 transition-all">
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              {(schoolSettings?.logo || school?.logo) && (
                 <img src={schoolSettings?.logo || school?.logo} alt="School Logo" className="h-8 w-8 rounded-lg object-cover ring-2 ring-gray-100" />
              )}
              <div className="flex items-center space-x-2">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent capitalize">{activeTab.replace('-', ' ')}</h1>
              </div>
              {user.role !== 'developer' && school && <Badge className="text-xs bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border border-blue-200">{school.name}</Badge>}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user.role === 'school_admin' && (
              <BroadcastNotification currentUser={user} trigger={<Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all" size="sm"><Megaphone className="h-4 w-4 mr-2" />Broadcast</Button>} />
            )}
            <button onClick={() => setShowCalculator(true)} className="p-2.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all text-gray-600 hover:text-purple-600 group">
              <Calculator className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 transition-all group">
                  <Avatar className="h-9 w-9 ring-2 ring-gray-200 group-hover:ring-blue-400 transition-all">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">{user?.name?.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                    <Badge variant="secondary" className="text-xs w-fit capitalize">{user.role === 'school_admin' ? 'Admin' : user.role.replace('_', ' ')}</Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {user.role === 'school_admin' && (
                  <DropdownMenuItem onClick={() => setActiveTab('school-settings')}>
                    <Settings className="h-4 w-4 mr-2" />Settings
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-2 sm:p-4 lg:p-6">{children}</div>
      </div>
    </div>
  )
}
