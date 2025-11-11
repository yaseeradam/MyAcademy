'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserPlus, Users2, Calendar, FileText } from 'lucide-react'

export default function QuickActions({ onAction, userRole }) {
  const actions = {
    school_admin: [
      { id: 'add-student', label: 'Add Student', icon: UserPlus, color: 'bg-blue-500' },
      { id: 'add-teacher', label: 'Add Teacher', icon: UserPlus, color: 'bg-green-500' },
      { id: 'add-parent', label: 'Add Parent', icon: Users2, color: 'bg-purple-500' },
      { id: 'mark-attendance', label: 'Mark Attendance', icon: Calendar, color: 'bg-orange-500' },
      { id: 'generate-report', label: 'Generate Report', icon: FileText, color: 'bg-pink-500' }
    ],
    teacher: [
      { id: 'mark-attendance', label: 'Mark Attendance', icon: Calendar, color: 'bg-orange-500' }
    ]
  }

  const userActions = actions[userRole] || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {userActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                onClick={() => onAction(action.id)}
                className={`${action.color} hover:opacity-90 h-auto py-4 flex flex-col items-center gap-2`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs text-center">{action.label}</span>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
