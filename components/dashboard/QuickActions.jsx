'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { UserPlus, Users2, Calendar, FileText, Sparkles, Send, GraduationCap, BookOpen } from 'lucide-react'

export default function QuickActions({ onAction, userRole }) {
  const actions = {
    school_admin: [
      {
        id: 'add-student',
        label: 'Add Student',
        icon: UserPlus,
        gradient: 'from-blue-500 to-indigo-600',
        shadow: 'shadow-blue-500/20',
        description: 'Enrol a new student'
      },
      {
        id: 'add-teacher',
        label: 'Add Teacher',
        icon: GraduationCap,
        gradient: 'from-emerald-500 to-teal-600',
        shadow: 'shadow-emerald-500/20',
        description: 'Register staff member'
      },
      {
        id: 'add-parent',
        label: 'Add Parent',
        icon: Users2,
        gradient: 'from-purple-500 to-violet-600',
        shadow: 'shadow-purple-500/20',
        description: 'Link parent account'
      },
      {
        id: 'mark-attendance',
        label: 'Take Attendance',
        icon: Calendar,
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/20',
        description: 'Mark daily attendance'
      },
      {
        id: 'send-notice',
        label: 'Send Notice',
        icon: Send,
        gradient: 'from-pink-500 to-rose-600',
        shadow: 'shadow-pink-500/20',
        description: 'Broadcast message'
      }
    ],
    teacher: [
      {
        id: 'mark-attendance',
        label: 'Mark Attendance',
        icon: Calendar,
        gradient: 'from-amber-500 to-orange-600',
        shadow: 'shadow-amber-500/20',
        description: 'Record class attendance'
      },
      {
        id: 'homework',
        label: 'Homework',
        icon: BookOpen,
        gradient: 'from-purple-500 to-violet-600',
        shadow: 'shadow-purple-500/20',
        description: 'Assign homework'
      }
    ]
  }

  const userActions = actions[userRole] || []

  if (userActions.length === 0) return null

  return (
    <Card className="border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="h-24 w-24 text-white" />
      </div>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          Quick Actions
        </CardTitle>
        <CardDescription className="text-blue-200/60">
          Frequently used actions for efficient management
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {userActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`
                  group relative flex flex-col items-center justify-center gap-3 h-auto py-6
                  bg-gradient-to-br ${action.gradient} border-0
                  rounded-2xl overflow-hidden
                  shadow-xl ${action.shadow}
                  hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20
                  !text-white hover:!text-black
                  transition-all duration-300
                `}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10" />
                <div className="absolute -top-8 -right-8 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
                <div className="relative z-10 flex flex-col items-center gap-3">
                  <div className="p-2.5 bg-white/20 rounded-full ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="h-6 w-6 !text-white group-hover:!text-black transition-colors duration-300" />
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <span className="font-semibold !text-white group-hover:!text-black transition-colors duration-300 tracking-wide">{action.label}</span>
                    <span className="text-[10px] !text-white/80 group-hover:!text-black/80 transition-colors duration-300 font-normal hidden sm:inline-block">{action.description}</span>
                  </div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
