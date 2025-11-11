'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { School, LogOut, ChevronLeft, ChevronRight, X, Crown, Home, MessageCircle, Building2, Settings, Users2, Users, UserCheck, BookOpen, GraduationCap, Calendar, Trophy, CreditCard } from 'lucide-react'

export default function Sidebar({ user, school, activeTab, setActiveTab, onLogout, notifications }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const getNavigationItems = () => {
    const baseItems = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'messages', label: 'Messages', icon: MessageCircle }
    ]
    
    if (user?.role === 'developer') {
      return [
        ...baseItems,
        { id: 'schools', label: 'Schools', icon: Building2 },
        { id: 'master-settings', label: 'Master Settings', icon: Settings }
      ]
    } else if (user?.role === 'school_admin') {
      return [
        ...baseItems,
        { id: 'parents', label: 'Parents', icon: Users2 },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'teachers', label: 'Teachers', icon: UserCheck },
        { id: 'classes', label: 'Classes', icon: School },
        { id: 'subjects', label: 'Subjects', icon: BookOpen },
        { id: 'assignments', label: 'Assignments', icon: GraduationCap },
        { id: 'attendance', label: 'Attendance', icon: Calendar },
        { id: 'gamification', label: 'Gamification', icon: Trophy },
        { id: 'billing', label: 'Billing', icon: CreditCard },
        { id: 'school-settings', label: 'School Settings', icon: Settings }
      ]
    } else if (user?.role === 'teacher') {
      return [
        ...baseItems,
        { id: 'my-assignments', label: 'My Assignments', icon: BookOpen },
        { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
        { id: 'students', label: 'My Students', icon: Users }
      ]
    } else if (user?.role === 'parent') {
      return [
        ...baseItems,
        { id: 'my-children', label: 'My Children', icon: Users },
        { id: 'attendance', label: 'Attendance Records', icon: Calendar },
        { id: 'payments', label: 'Payments', icon: CreditCard }
      ]
    }
    
    return baseItems
  }

  return (
    <>
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <div className={`
        fixed inset-y-0 left-0 z-50 
        ${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl
        transform transition-all duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center">
            {school?.logo ? (
              <img src={school.logo} alt="Logo" className="h-12 w-12 mr-3 rounded-xl object-cover ring-2 ring-blue-400/50" />
            ) : (
              <div className="h-12 w-12 mr-3 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <School className="h-7 w-7 text-white" />
              </div>
            )}
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-white block leading-tight">
                  {school?.name || 'EduManage'}
                </span>
                {user.role === 'developer' && (
                  <span className="text-xs text-blue-400 font-medium">Master System</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700/50 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {getNavigationItems().map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/50 scale-105'
                    : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 mr-3 flex-shrink-0 transition-transform duration-200 ${
                  activeTab === item.id ? 'scale-110' : 'group-hover:scale-110'
                }`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'messages' && notifications.filter(n => !n.read).length > 0 && (
                      <Badge className="ml-2 text-xs px-2 py-0.5 bg-red-500 text-white animate-pulse">
                        {notifications.filter(n => !n.read).length}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>
        
        <div className="border-t border-slate-700/50 p-4 bg-slate-800/30">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3 ring-2 ring-blue-400/50">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-medium">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <Badge className="text-xs capitalize bg-blue-500/20 text-blue-300 border-blue-400/30">
                    {user.role === 'school_admin' ? 'Admin' : user.role}
                  </Badge>
                  {user.role === 'developer' && <Crown className="h-3 w-3 text-yellow-400" />}
                </div>
              </div>
            )}
          </div>
          <Button
            onClick={onLogout}
            variant="outline"
            size="sm"
            className={`${sidebarCollapsed ? 'w-10 h-10 p-0' : 'w-full'} justify-center bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-all`}
          >
            <LogOut className="h-4 w-4" />
            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>
    </>
  )
}
