'use client'

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Clock, FileText, DollarSign, BookOpen, BookMarked, GraduationCap, Megaphone, CalendarDays, Award } from 'lucide-react'

export default function MoreFeaturesPage({ setActiveTab }) {
  const features = [
    {
      id: 'announcements',
      label: 'Announcements',
      icon: Megaphone,
      gradientOverlay: 'from-rose-100/70 to-white/40',
      iconContainer: 'from-rose-500 to-pink-400 shadow-rose-200/70',
      description: 'Send notices to parents and teachers'
    },
    {
      id: 'academic-calendar',
      label: 'Academic Calendar',
      icon: CalendarDays,
      gradientOverlay: 'from-blue-100/70 to-white/40',
      iconContainer: 'from-blue-500 to-blue-400 shadow-blue-200/70',
      description: 'Manage term dates and events'
    },
    {
      id: 'certificates',
      label: 'Certificates',
      icon: Award,
      gradientOverlay: 'from-yellow-100/70 to-white/40',
      iconContainer: 'from-yellow-500 to-amber-400 shadow-yellow-200/70',
      description: 'Generate student certificates'
    },
    {
      id: 'timetable',
      label: 'Timetable',
      icon: Clock,
      gradientOverlay: 'from-sky-100/70 to-white/40',
      iconContainer: 'from-sky-500 to-sky-400 shadow-sky-200/70',
      description: 'Manage class schedules'
    },
    {
      id: 'exams',
      label: 'Exams & Grades',
      icon: FileText,
      gradientOverlay: 'from-violet-100/70 to-white/40',
      iconContainer: 'from-violet-500 to-violet-400 shadow-violet-200/70',
      description: 'Create exams and grade students'
    },
    {
      id: 'report-cards',
      label: 'Report Cards',
      icon: GraduationCap,
      gradientOverlay: 'from-teal-100/70 to-white/40',
      iconContainer: 'from-teal-500 to-teal-400 shadow-teal-200/70',
      description: 'Generate student report cards'
    },
    {
      id: 'homework',
      label: 'Homework',
      icon: BookOpen,
      gradientOverlay: 'from-emerald-100/70 to-white/40',
      iconContainer: 'from-emerald-500 to-emerald-400 shadow-emerald-200/70',
      description: 'Assign and track homework'
    },
    {
      id: 'fees',
      label: 'Fee Management',
      icon: DollarSign,
      gradientOverlay: 'from-amber-100/70 to-white/40',
      iconContainer: 'from-amber-500 to-orange-400 shadow-amber-200/70',
      description: 'Track fees and payments'
    },
    {
      id: 'library',
      label: 'Library',
      icon: BookMarked,
      gradientOverlay: 'from-indigo-100/70 to-white/40',
      iconContainer: 'from-indigo-500 to-indigo-400 shadow-indigo-200/70',
      description: 'Manage books and borrowing'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">More Features</h2>
        <p className="text-slate-500 mt-1">Access additional school management tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
        {features.map(feature => {
          const Icon = feature.icon
          return (
            <Card
              key={feature.id}
              className="group hover:scale-[1.02] transition-all duration-300 border border-slate-200/80 bg-white/80 backdrop-blur-xl overflow-hidden relative cursor-pointer"
              onClick={() => setActiveTab(feature.id)}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradientOverlay}`} />
              <CardHeader className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 bg-gradient-to-br ${feature.iconContainer} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-6 w-6 text-on-accent" />
                  </div>
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-1">
                  {feature.label}
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium">
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
