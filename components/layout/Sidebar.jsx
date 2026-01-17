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
        { id: 'my-classes', label: 'My Classes', icon: School },
        { id: 'my-subjects', label: 'My Subjects', icon: BookOpen },
        { id: 'students', label: 'My Students', icon: Users },
        { id: 'parents', label: 'Parents', icon: Users2 },
        { id: 'student-attendance', label: 'Mark Attendance', icon: Calendar },
        { id: 'gradebook', label: 'Gradebook', icon: BookOpen }
      ]
    } else if (user?.role === 'parent') {
      return [
        ...baseItems,
        { id: 'my-children', label: 'My Children', icon: Users },
        { id: 'school-fees', label: 'School Fees', icon: CreditCard },
        { id: 'attendance', label: 'Attendance Records', icon: Calendar },
        { id: 'results', label: 'Results', icon: Calendar } // Assuming icon needed
      ]
    }

    return baseItems
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 
        ${sidebarCollapsed ? 'w-20' : 'w-64'} bg-gradient-to-b from-[#0f1d32] via-[#0a1628] to-[#071018] shadow-2xl border-r border-white/5
        transform transition-all duration-300 ease-in-out 
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-white/5 bg-white/5">
          <div className="flex items-center">
            {school?.logo ? (
              <img src={school.logo} alt="Logo" className="h-10 w-10 mr-3 rounded-xl object-cover ring-2 ring-amber-400/50" />
            ) : (
              <div className="h-10 w-10 mr-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-lg">
                <School className="h-6 w-6 text-white" />
              </div>
            )}
            {!sidebarCollapsed && (
              <div>
                <span className="text-lg font-bold text-white block leading-tight">
                  {school?.name || 'My Academy'}
                </span>
                {user.role === 'developer' && (
                  <span className="text-xs text-amber-400 font-medium">Master System</span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block text-blue-200/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-blue-200/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-all"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
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
                className={`w-full flex items-center px-3 py-2.5 text-left text-sm font-medium rounded-xl transition-all duration-200 group relative ${activeTab === item.id
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]'
                    : 'text-blue-200/70 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <Icon className={`h-5 w-5 flex-shrink-0 transition-transform duration-200 ${sidebarCollapsed ? 'mx-auto' : 'mr-3'} ${activeTab === item.id ? 'scale-110 text-on-accent' : 'text-slate-300 group-hover:text-amber-200 group-hover:scale-110'}`} />
                {!sidebarCollapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.id === 'messages' && notifications?.filter(n => !n.read).length > 0 && (
                      <Badge className="ml-2 text-xs px-2 py-0.5 bg-red-500 text-white animate-pulse border-0">
                        {notifications.filter(n => !n.read).length}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="border-t border-white/5 p-4 bg-white/5">
          <div className="flex items-center mb-3">
            <Avatar className="h-10 w-10 mr-3 ring-2 ring-amber-400/50">
              <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-medium">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <div className="flex items-center space-x-1">
                  <Badge className="text-xs capitalize bg-amber-500/20 text-amber-300 border-amber-400/30">
                    {user.role === 'school_admin' ? 'Admin' : user.role?.replace('_', ' ')}
                  </Badge>
                  {user.role === 'developer' && <Crown className="h-3 w-3 text-amber-400" />}
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
