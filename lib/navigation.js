import { 
  Home, MessageCircle, Building2, Settings, Users, UserCheck, 
  Users2, School, BookOpen, GraduationCap, Calendar, Trophy, CreditCard, BarChart3 
} from 'lucide-react'

export function getNavigationItems(userRole) {
  const baseItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'messages', label: 'Messages', icon: MessageCircle }
  ]
  
  if (userRole === 'developer') {
    return [
      ...baseItems,
      { id: 'schools', label: 'Schools', icon: Building2 },
      { id: 'master-settings', label: 'Master Settings', icon: Settings }
    ]
  } else if (userRole === 'school_admin') {
    return [
      ...baseItems,
      { id: 'students', label: 'Students', icon: Users },
      { id: 'teachers', label: 'Teachers', icon: UserCheck },
      { id: 'parents', label: 'Parents', icon: Users2 },
      { id: 'classes', label: 'Classes', icon: School },
      { id: 'subjects', label: 'Subjects', icon: BookOpen },
      { id: 'assignments', label: 'Assignments', icon: GraduationCap },
      { id: 'attendance', label: 'Attendance', icon: Calendar },
      { id: 'gamification', label: 'Gamification', icon: Trophy },
      { id: 'billing', label: 'Billing', icon: CreditCard },
      { id: 'school-settings', label: 'School Settings', icon: Settings }
    ]
  } else if (userRole === 'teacher') {
    return [
      ...baseItems,
      { id: 'my-assignments', label: 'My Assignments', icon: BookOpen },
      { id: 'attendance', label: 'Mark Attendance', icon: Calendar },
      { id: 'students', label: 'My Students', icon: Users }
    ]
  } else if (userRole === 'parent') {
    return [
      ...baseItems,
      { id: 'my-children', label: 'My Children', icon: Users },
      { id: 'attendance', label: 'Attendance Records', icon: Calendar },
      { id: 'payments', label: 'Payments', icon: CreditCard },
      { id: 'results', label: 'Results', icon: BarChart3 }
    ]
  }
  
  return baseItems
}
