'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, FileText, DollarSign, BookOpen, BookMarked, CalendarDays, AlertCircle, Bus, Heart } from 'lucide-react'

export default function MoreFeaturesPage({ setActiveTab }) {
  const features = [
    {
      id: 'timetable',
      label: 'Timetable',
      icon: Clock,
      gradientOverlay: 'from-blue-500/10 to-blue-600/5',
      iconContainer: 'from-blue-500 to-blue-600 shadow-blue-500/30',
      description: 'Manage class schedules'
    },
    {
      id: 'exams',
      label: 'Exams & Grades',
      icon: FileText,
      gradientOverlay: 'from-purple-500/10 to-purple-600/5',
      iconContainer: 'from-purple-500 to-purple-600 shadow-purple-500/30',
      description: 'Create exams and grade students'
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: BookOpen,
      gradientOverlay: 'from-emerald-500/10 to-emerald-600/5',
      iconContainer: 'from-emerald-500 to-emerald-600 shadow-emerald-500/30',
      description: 'Assign and track homework'
    },
    {
      id: 'fees',
      label: 'Fee Management',
      icon: DollarSign,
      gradientOverlay: 'from-amber-500/10 to-amber-600/5',
      iconContainer: 'from-amber-500 to-orange-500 shadow-amber-500/30',
      description: 'Track fees and payments'
    },
    {
      id: 'library',
      label: 'Library',
      icon: BookMarked,
      gradientOverlay: 'from-indigo-500/10 to-indigo-600/5',
      iconContainer: 'from-indigo-500 to-indigo-600 shadow-indigo-500/30',
      description: 'Manage books and borrowing'
    },
    {
      id: 'events',
      label: 'Events',
      icon: CalendarDays,
      gradientOverlay: 'from-pink-500/10 to-pink-600/5',
      iconContainer: 'from-pink-500 to-pink-600 shadow-pink-500/30',
      description: 'School events calendar'
    },
    {
      id: 'behavior',
      label: 'Behavior',
      icon: AlertCircle,
      gradientOverlay: 'from-red-500/10 to-red-600/5',
      iconContainer: 'from-red-500 to-red-600 shadow-red-500/30',
      description: 'Track student behavior'
    },
    {
      id: 'transport',
      label: 'Transport',
      icon: Bus,
      gradientOverlay: 'from-orange-500/10 to-orange-600/5',
      iconContainer: 'from-orange-500 to-orange-600 shadow-orange-500/30',
      description: 'Manage bus routes'
    },
    {
      id: 'health',
      label: 'Health Records',
      icon: Heart,
      gradientOverlay: 'from-cyan-500/10 to-cyan-600/5',
      iconContainer: 'from-cyan-500 to-cyan-600 shadow-cyan-500/30',
      description: 'Student health information'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">More Features</h2>
        <p className="text-blue-200/60 mt-1">Access additional school management tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {features.map(feature => {
          const Icon = feature.icon
          return (
            <Card
              key={feature.id}
              className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative cursor-pointer"
              onClick={() => setActiveTab(feature.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientOverlay}`} />
              <CardHeader className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${feature.iconContainer} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-white mb-1">
                  {feature.label}
                </CardTitle>
                <CardDescription className="text-blue-200/60 font-medium">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
