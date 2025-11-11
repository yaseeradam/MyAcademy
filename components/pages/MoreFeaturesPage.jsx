'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, FileText, DollarSign, BookOpen, BookMarked, CalendarDays, AlertCircle, Bus, Heart } from 'lucide-react'

export default function MoreFeaturesPage({ setActiveTab }) {
  const features = [
    { id: 'timetable', label: 'Timetable', icon: Clock, color: 'from-blue-50 to-blue-100', iconColor: 'bg-blue-500', textColor: 'text-blue-900', description: 'Manage class schedules' },
    { id: 'exams', label: 'Exams & Grades', icon: FileText, color: 'from-purple-50 to-purple-100', iconColor: 'bg-purple-500', textColor: 'text-purple-900', description: 'Create exams and grade students' },
    { id: 'homework', label: 'Homework', icon: BookOpen, color: 'from-green-50 to-green-100', iconColor: 'bg-green-500', textColor: 'text-green-900', description: 'Assign and track homework' },
    { id: 'fees', label: 'Fee Management', icon: DollarSign, color: 'from-emerald-50 to-emerald-100', iconColor: 'bg-emerald-500', textColor: 'text-emerald-900', description: 'Track fees and payments' },
    { id: 'library', label: 'Library', icon: BookMarked, color: 'from-indigo-50 to-indigo-100', iconColor: 'bg-indigo-500', textColor: 'text-indigo-900', description: 'Manage books and borrowing' },
    { id: 'events', label: 'Events', icon: CalendarDays, color: 'from-pink-50 to-pink-100', iconColor: 'bg-pink-500', textColor: 'text-pink-900', description: 'School events calendar' },
    { id: 'behavior', label: 'Behavior', icon: AlertCircle, color: 'from-yellow-50 to-yellow-100', iconColor: 'bg-yellow-500', textColor: 'text-yellow-900', description: 'Track student behavior' },
    { id: 'transport', label: 'Transport', icon: Bus, color: 'from-orange-50 to-orange-100', iconColor: 'bg-orange-500', textColor: 'text-orange-900', description: 'Manage bus routes' },
    { id: 'health', label: 'Health Records', icon: Heart, color: 'from-red-50 to-red-100', iconColor: 'bg-red-500', textColor: 'text-red-900', description: 'Student health information' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">More Features</h2>
        <p className="text-gray-600 mt-1">Access additional school management tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(feature => {
          const Icon = feature.icon
          return (
            <Card 
              key={feature.id} 
              className={`group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br ${feature.color} overflow-hidden relative cursor-pointer`}
              onClick={() => setActiveTab(feature.id)}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16 opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 ${feature.iconColor} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className={`text-xl font-bold ${feature.textColor} mb-2`}>
                  {feature.label}
                </CardTitle>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
