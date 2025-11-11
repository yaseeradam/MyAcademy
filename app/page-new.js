'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { School } from 'lucide-react'
import { toast } from 'sonner'
import { useAppData } from '@/hooks/useAppData'
import { useForms } from '@/hooks/useForms'
import { useFilters } from '@/hooks/useFilters'
import { useAttendance } from '@/hooks/useAttendance'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/components/auth/LoginPage'
import DashboardPage from '@/components/pages/DashboardPage'
import StudentsPage from '@/components/pages/StudentsPage'
import TeachersPage from '@/components/pages/TeachersPage'
import ParentsPage from '@/components/pages/ParentsPage'
import ClassesPage from '@/components/pages/ClassesPage'
import SubjectsPage from '@/components/pages/SubjectsPage'
import AssignmentsPage from '@/components/pages/AssignmentsPage'
import AttendancePage from '@/components/pages/AttendancePage'
import SchoolsPage from '@/components/pages/SchoolsPage'
import SchoolSettingsPage from '@/components/pages/SchoolSettingsPage'
import MasterSettingsPage from '@/components/pages/MasterSettingsPage'
import TeacherForm from '@/components/forms/TeacherForm'
import ParentForm from '@/components/forms/ParentForm'
import StudentForm from '@/components/forms/StudentForm'
import MessagesPage from '@/components/chat/MessagesPage'
import BillingDashboard from '@/components/billing/BillingDashboard'
import GamificationDashboard from '@/components/gamification/GamificationDashboard'
import CalculatorApp from '@/components/calculator/calculator'
import PuterAI from '@/components/ai/PuterAI'
import QuickActions from '@/components/dashboard/QuickActions'
import AttendanceCharts from '@/components/dashboard/AttendanceCharts'
import { Home, MessageCircle, Building2, Settings as SettingsIcon, Users2, Users, UserCheck, School as SchoolIcon, BookOpen, GraduationCap, Calendar, Trophy, CreditCard, BarChart3 } from 'lucide-react'

function App() {
  const [user, setUser] = useState(null)
  const [school, setSchool] = useState(null)
  const [token, setToken] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showFormView, setShowFormView] = useState(null)
  const [showCalculator, setShowCalculator] = useState(false)
  const [authData, setAuthData] = useState({ email: '', password: '' })
  const [schoolSettings, setSchoolSettings] = useState({ schoolName: '', logo: '', primaryColor: '#3b82f6', secondaryColor: '#64748b', address: '', phoneNumber: '', email: '' })
  const [masterSettings, setMasterSettings] = useState({ systemName: 'EduManage Nigeria', systemEmail: 'admin@edumanage.ng', defaultCurrency: 'NGN', timezone: 'Africa/Lagos', maintenanceMode: false, allowRegistration: true, maxSchools: 1000, systemVersion: '1.0.0' })
  
  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showMasterSchoolModal, setShowMasterSchoolModal] = useState(false)

  const { stats, students, teachers, parents, classes, subjects, assignments, attendance, notifications, schools, setStudents, setTeachers, setParents, setClasses, setSubjects, setAssignments, setAttendance, setNotifications, setSchools, apiCall, loadDashboardData, loadNotifications, loadTodayAttendance } = useAppData(user, token)
  
  const formHandlers = useForms(apiCall, loadDashboardData)
  const filterHandlers = useFilters()
  const attendanceHandlers = useAttendance(user, apiCall, students, teachers, loadTodayAttendance)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedSchool = localStorage.getItem('school')
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      if (savedSchool) setSchool(JSON.parse(savedSchool))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user?.role === 'school_admin' && school) {
      apiCall('school/settings').then(settings => {
        setSchoolSettings({ schoolName: settings?.schoolName || school?.name || '', logo: settings?.logo || '', primaryColor: settings?.primaryColor || '#3b82f6', secondaryColor: settings?.secondaryColor || '#64748b', address: settings?.address || '', phoneNumber: settings?.phoneNumber || '', email: settings?.email || '' })
      }).catch(() => {})
    }
  }, [user, school])

  const handleAuth = async (e) => {
    e.preventDefault()
    try {
      const result = await apiCall('auth/login', { method: 'POST', body: JSON.stringify(authData) })
      setToken(result.token)
      setUser(result.user)
      setSchool(result.school)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.school) localStorage.setItem('school', JSON.stringify(result.school))
      toast.success('Logged in successfully!')
    } catch (error) {}
  }

  const handleLogout = () => {
    setUser(null)
    setSchool(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('school')
    toast.success('Logged out successfully')
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return toast.error('Please select an image file')
    if (file.size > 2 * 1024 * 1024) return toast.error('Image size should be less than 2MB')
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      setSchoolSettings(prev => ({ ...prev, logo: data.url }))
      toast.success('Logo uploaded successfully!')
    } catch (error) {
      toast.error('Failed to upload logo')
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      await apiCall('school/settings', { method: 'POST', body: JSON.stringify(schoolSettings) })
      toast.success('Settings saved successfully!')
      if (school) {
        const updatedSchool = { ...school, name: schoolSettings.schoolName, logo: schoolSettings.logo }
        setSchool(updatedSchool)
        localStorage.setItem('school', JSON.stringify(updatedSchool))
      }
    } catch (error) {}
  }

  const getNavigationItems = () => {
    const baseItems = [{ id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageCircle }]
    if (user?.role === 'developer') return [...baseItems, { id: 'schools', label: 'Schools', icon: Building2 }, { id: 'master-settings', label: 'Master Settings', icon: SettingsIcon }]
    if (user?.role === 'school_admin') return [...baseItems, { id: 'parents', label: 'Parents', icon: Users2 }, { id: 'students', label: 'Students', icon: Users }, { id: 'teachers', label: 'Teachers', icon: UserCheck }, { id: 'classes', label: 'Classes', icon: SchoolIcon }, { id: 'subjects', label: 'Subjects', icon: BookOpen }, { id: 'assignments', label: 'Assignments', icon: GraduationCap }, { id: 'attendance', label: 'Attendance', icon: Calendar }, { id: 'gamification', label: 'Gamification', icon: Trophy }, { id: 'billing', label: 'Billing', icon: CreditCard }, { id: 'school-settings', label: 'School Settings', icon: SettingsIcon }]
    if (user?.role === 'teacher') return [...baseItems, { id: 'my-assignments', label: 'My Assignments', icon: BookOpen }, { id: 'attendance', label: 'Mark Attendance', icon: Calendar }, { id: 'students', label: 'My Students', icon: Users }]
    if (user?.role === 'parent') return [...baseItems, { id: 'my-children', label: 'My Children', icon: Users }, { id: 'attendance', label: 'Attendance Records', icon: Calendar }, { id: 'payments', label: 'Payments', icon: CreditCard }, { id: 'results', label: 'Results', icon: BarChart3 }]
    return baseItems
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100"><div className="text-center"><div className="relative"><div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div><School className="h-8 w-8 text-blue-600 mx-auto mb-4 absolute top-4 left-1/2 transform -translate-x-1/2" /></div><p className="text-gray-600">Loading EduManage...</p></div></div>
  if (!user) return <LoginPage authData={authData} setAuthData={setAuthData} handleAuth={handleAuth} />

  return (
    <MainLayout user={user} school={school} schoolSettings={schoolSettings} activeTab={activeTab} setActiveTab={setActiveTab} navigationItems={getNavigationItems()} handleLogout={handleLogout} setShowCalculator={setShowCalculator}>
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {(user.role === 'school_admin' || user.role === 'teacher') && <QuickActions userRole={user.role} onAction={(actionId) => { if (actionId === 'add-student') { setShowFormView('student'); setActiveTab('students') } else if (actionId === 'add-teacher') { setShowFormView('teacher'); setActiveTab('teachers') } else if (actionId === 'add-parent') { setShowFormView('parent'); setActiveTab('parents') } else if (actionId === 'mark-attendance') { attendanceHandlers.setAttendanceDate(new Date().toISOString().split('T')[0]); attendanceHandlers.setSelectedClass(''); attendanceHandlers.setAttendanceList([]); attendanceHandlers.setShowAttendanceModal(true) } else toast.info('Report generation coming soon!') }} />}
          <DashboardPage stats={stats} students={students} teachers={teachers} parents={parents} classes={classes} />
          {(user.role === 'school_admin' || user.role === 'teacher') && <AttendanceCharts attendance={attendance} students={students} teachers={teachers} classes={classes} userRole={user.role} />}
        </div>
      )}
      
      {showFormView === 'teacher' && <TeacherForm {...formHandlers} setShowFormView={setShowFormView} />}
      {showFormView === 'parent' && <ParentForm {...formHandlers} setShowFormView={setShowFormView} />}
      {showFormView === 'student' && <StudentForm {...formHandlers} setShowFormView={setShowFormView} parents={parents} classes={classes} />}
      
      {activeTab === 'teachers' && user.role === 'school_admin' && !showFormView && <TeachersPage teachers={teachers} school={school} {...filterHandlers} setShowFormView={setShowFormView} toast={toast} />}
      {activeTab === 'parents' && user.role === 'school_admin' && !showFormView && <ParentsPage parents={parents} students={students} school={school} {...filterHandlers} setShowFormView={setShowFormView} toast={toast} />}
      {activeTab === 'students' && user.role === 'school_admin' && !showFormView && <StudentsPage students={students} classes={classes} parents={parents} school={school} {...filterHandlers} setShowFormView={setShowFormView} toast={toast} />}
      {activeTab === 'classes' && user.role === 'school_admin' && <ClassesPage classes={classes} students={students} showClassModal={showClassModal} setShowClassModal={setShowClassModal} classForm={formHandlers.classForm} setClassForm={formHandlers.setClassForm} handleCreateClass={formHandlers.handleCreateClass} />}
      {activeTab === 'subjects' && user.role === 'school_admin' && <SubjectsPage subjects={subjects} showSubjectModal={showSubjectModal} setShowSubjectModal={setShowSubjectModal} subjectForm={formHandlers.subjectForm} setSubjectForm={formHandlers.setSubjectForm} handleCreateSubject={formHandlers.handleCreateSubject} />}
      {activeTab === 'assignments' && user.role === 'school_admin' && <AssignmentsPage assignments={assignments} teachers={teachers} classes={classes} subjects={subjects} showAssignmentModal={showAssignmentModal} setShowAssignmentModal={setShowAssignmentModal} assignmentForm={formHandlers.assignmentForm} setAssignmentForm={formHandlers.setAssignmentForm} handleCreateAssignment={(e) => formHandlers.handleCreateAssignment(e, subjects, classes)} />}
      {activeTab === 'attendance' && (user.role === 'school_admin' || user.role === 'teacher') && <AttendancePage user={user} attendance={attendance} students={students} teachers={teachers} classes={classes} {...attendanceHandlers} />}
      {activeTab === 'schools' && user.role === 'developer' && <SchoolsPage schools={schools} showMasterSchoolModal={showMasterSchoolModal} setShowMasterSchoolModal={setShowMasterSchoolModal} masterSchoolForm={formHandlers.masterSchoolForm} setMasterSchoolForm={formHandlers.setMasterSchoolForm} handleCreateSchool={formHandlers.handleCreateSchool} />}
      {activeTab === 'school-settings' && user.role === 'school_admin' && <SchoolSettingsPage schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} handleLogoUpload={handleLogoUpload} handleSaveSettings={handleSaveSettings} />}
      {activeTab === 'master-settings' && user.role === 'developer' && <MasterSettingsPage masterSettings={masterSettings} stats={stats} />}
      {activeTab === 'billing' && user.role === 'school_admin' && <BillingDashboard currentUser={user} school={school} />}
      {activeTab === 'gamification' && <GamificationDashboard currentUser={user} />}
      {activeTab === 'messages' && <MessagesPage currentUser={user} onBack={() => setActiveTab('dashboard')} />}
      
      {!['dashboard', 'notifications', 'schools', 'teachers', 'parents', 'students', 'classes', 'subjects', 'assignments', 'attendance', 'billing', 'payments', 'gamification', 'messages', 'school-settings', 'master-settings'].includes(activeTab) && <Card><CardContent className="p-8 text-center"><p className="text-gray-600">This section is under development.</p></CardContent></Card>}
      
      <div data-puter-ai><PuterAI /></div>
      {showCalculator && <CalculatorApp isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}
    </MainLayout>
  )
}

export default App
