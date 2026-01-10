'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { School } from 'lucide-react'
import { useModal } from '@/hooks/useModal'
import { LoadingModal } from '@/components/ui/loading-modal'
import { StatusModal } from '@/components/ui/status-modal'
import { useAppData } from '@/hooks/useAppData'
import { useForms } from '@/hooks/useForms'
import { useFilters } from '@/hooks/useFilters'
import { useTeacherAttendance } from '@/hooks/useTeacherAttendance'
import { useStudentAttendance } from '@/hooks/useStudentAttendance'
import { useTeacherRestrictions } from '@/hooks/useTeacherRestrictions'
import { useNewFeatures } from '@/hooks/useNewFeatures'
import MainLayout from '@/components/layout/MainLayout'
import LoginPage from '@/components/auth/LoginPage'
import DashboardPage from '@/components/pages/DashboardPage'
import StudentsPage from '@/components/pages/StudentsPage'
import TeachersPage from '@/components/pages/TeachersPage'
import ParentsPage from '@/components/pages/ParentsPage'
import ClassesPage from '@/components/pages/ClassesPage'
import SubjectsPage from '@/components/pages/SubjectsPage'
import AssignmentsPage from '@/components/pages/AssignmentsPage'
import TeacherAttendancePage from '@/components/pages/TeacherAttendancePage'
import StudentAttendancePage from '@/components/pages/StudentAttendancePage'
import SchoolsPage from '@/components/pages/SchoolsPage'
import SchoolSettingsPage from '@/components/pages/SchoolSettingsPage'
import MasterSettingsPage from '@/components/pages/MasterSettingsPage'
import TeacherForm from '@/components/forms/TeacherForm'
import ParentForm from '@/components/forms/ParentForm'
import StudentForm from '@/components/forms/StudentForm'
import MessagesPage from '@/components/chat/MessagesPage'
import BillingDashboard from '@/components/billing/BillingDashboard'

import CalculatorApp from '@/components/calculator/calculator'
import QuickActions from '@/components/dashboard/QuickActions'
import AttendanceCharts from '@/components/dashboard/AttendanceCharts'
import ReportDialog from '@/components/reports/ReportDialog'
import TimetablePage from '@/components/pages/TimetablePage'
import ExamsPage from '@/components/pages/ExamsPage'
import FeesPage from '@/components/pages/FeesPage'
import HomeworkPage from '@/components/pages/HomeworkPage'
import LibraryPage from '@/components/pages/LibraryPage'
import EventsPage from '@/components/pages/EventsPage'
import BehaviorPage from '@/components/pages/BehaviorPage'
import TransportPage from '@/components/pages/TransportPage'
import HealthPage from '@/components/pages/HealthPage'
import MoreFeaturesPage from '@/components/pages/MoreFeaturesPage'
import ParentFeesPage from '@/components/pages/ParentFeesPage'
import GradebookPage from '@/components/pages/GradebookPage'
import { Home, MessageCircle, Building2, Settings as SettingsIcon, Users2, Users, UserCheck, School as SchoolIcon, BookOpen, GraduationCap, Calendar, Trophy, CreditCard, BarChart3, Clock, FileText, DollarSign, BookMarked, CalendarDays, Heart, Bus, AlertCircle, Grid3x3 } from 'lucide-react'
import SubscriptionExpired from '@/components/subscription/SubscriptionExpired'
import AccessDeniedOverlay from '@/components/subscription/AccessDeniedOverlay'
import SchoolFeesPage from '@/components/pages/SchoolFeesPage'
import SubscriptionBanner from '@/components/subscription/SubscriptionBanner' // Assume this exists or I'll create it next

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
  const [masterSettings, setMasterSettings] = useState({ systemName: 'My Academy', systemEmail: 'admin@myacademy.com', defaultCurrency: 'NGN', timezone: 'Africa/Lagos', maintenanceMode: false, allowRegistration: true, maxSchools: 1000, systemVersion: '1.0.0' })

  // Subscription State
  const [subscriptionStatus, setSubscriptionStatus] = useState({ status: 'active', daysRemaining: 0, message: '' })

  const [showClassModal, setShowClassModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false)
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showMasterSchoolModal, setShowMasterSchoolModal] = useState(false)
  const [showReportDialog, setShowReportDialog] = useState(false)

  const [showTimetableModal, setShowTimetableModal] = useState(false)
  const [timetableForm, setTimetableForm] = useState({})
  const [showExamModal, setShowExamModal] = useState(false)
  const [showGradeModal, setShowGradeModal] = useState(false)
  const [examForm, setExamForm] = useState({})
  const [gradeForm, setGradeForm] = useState({})
  const [showFeeModal, setShowFeeModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [feeForm, setFeeForm] = useState({})
  const [paymentForm, setPaymentForm] = useState({})
  const [showHomeworkModal, setShowHomeworkModal] = useState(false)
  const [homeworkForm, setHomeworkForm] = useState({})
  const [showBookModal, setShowBookModal] = useState(false)
  const [showIssueModal, setShowIssueModal] = useState(false)
  const [bookForm, setBookForm] = useState({})
  const [issueForm, setIssueForm] = useState({})
  const [bookSearch, setBookSearch] = useState('')
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventForm, setEventForm] = useState({})
  const [showBehaviorModal, setShowBehaviorModal] = useState(false)
  const [behaviorForm, setBehaviorForm] = useState({})
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [showAssignRouteModal, setShowAssignRouteModal] = useState(false)
  const [routeForm, setRouteForm] = useState({})
  const [assignRouteForm, setAssignRouteForm] = useState({})
  const [showHealthModal, setShowHealthModal] = useState(false)
  const [healthForm, setHealthForm] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [unreadMessages, setUnreadMessages] = useState(0)

  const modal = useModal()
  const toast = {
    success: (message) => modal.showSuccess('Success', message),
    error: (message) => modal.showError('Error', message)
  }
  const { stats, students, teachers, parents, classes, subjects, assignments, attendance, notifications, schools, feePayments, setStudents, setTeachers, setParents, setClasses, setSubjects, setAssignments, setAttendance, setNotifications, setSchools, apiCall, loadDashboardData, loadNotifications, loadTodayAttendance, loadAttendanceByDate } = useAppData(user, token)

  const teacherRestrictions = useTeacherRestrictions(user, assignments, students, classes, subjects)
  const filteredStudents = user?.role === 'teacher' ? teacherRestrictions.filteredStudents : students
  const filteredClasses = user?.role === 'teacher' ? teacherRestrictions.filteredClasses : classes
  const filteredSubjects = user?.role === 'teacher' ? teacherRestrictions.filteredSubjects : subjects
  const filteredParents = user?.role === 'teacher' ? parents.filter(p => filteredStudents.some(s => s.parentId === p.id)) : parents

  // Fetch Master Settings
  useEffect(() => {
    if (user?.role === 'developer') {
      apiCall('master/settings')
        .then(setMasterSettings)
        .catch(err => {
          console.error('Failed to fetch master settings', err)
          // If fetch fails, we might still want default values which useState might already have or null
        })
    }
  }, [user])

  const handleSaveMasterSettings = async (e) => {
    e.preventDefault()
    try {
      modal.showLoading('Saving master settings...')
      await apiCall('master/settings', { method: 'POST', body: JSON.stringify(masterSettings) })
      modal.showSuccess('Settings Saved', 'Master settings updated successfully!')
    } catch (error) {
      modal.showError('Save Failed', error.message)
    } finally {
      modal.hideLoading()
    }
  }

  const formHandlers = useForms(apiCall, loadDashboardData, modal, parents)
  const filterHandlers = useFilters()
  const teacherAttendanceHandlers = useTeacherAttendance(user, apiCall, teachers, loadTodayAttendance, modal)
  const studentAttendanceHandlers = useStudentAttendance(user, apiCall, filteredStudents, loadTodayAttendance, modal)
  const newFeatures = useNewFeatures(user, token, apiCall, loadDashboardData, modal)

  useEffect(() => {
    console.log('🔄 Checking localStorage for saved session...')
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedSchool = localStorage.getItem('school')
    console.log('📦 Found in localStorage:', { hasToken: !!savedToken, hasUser: !!savedUser })
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      if (savedSchool) setSchool(JSON.parse(savedSchool))
      console.log('✅ Session restored from localStorage')
    } else {
      console.log('❌ No saved session found')
    }
    setLoading(false)
  }, [])

  // Check Subscription Status
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference')

    const verifyPayment = async () => {
      if (reference) {
        setSubscriptionStatus(null) // Show loading
        try {
          const res = await fetch(`/api/payments/verify?reference=${reference}`)
          const data = await res.json()
          if (data.success) {
            toast.success('Subscription Renewed!')
            // Clear URL param
            window.history.replaceState({}, document.title, "/")
            // Fetch fresh status
            fetchStatus()
          } else {
            toast.error('Payment verification failed')
            fetchStatus()
          }
        } catch (e) {
          console.error(e)
          fetchStatus()
        }
      } else {
        fetchStatus()
      }
    }

    const fetchStatus = () => {
      if (user && user.role !== 'developer' && user.schoolId && token) {
        fetch('/api/school/subscription/check', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            if (data.status) {
              setSubscriptionStatus(data)
            }
          })
          .catch(err => console.error(err))
      }
    }

    if (user && token) {
      verifyPayment()
    }

  }, [user, token])

  useEffect(() => {
    if (user?.role === 'school_admin' && school) {
      apiCall('school/settings').then(settings => {
        setSchoolSettings({
          schoolName: settings?.schoolName || school?.name || '',
          logo: settings?.logo || '',
          primaryColor: settings?.primaryColor || '#3b82f6',
          secondaryColor: settings?.secondaryColor || '#64748b',
          address: settings?.address || '',
          phoneNumber: settings?.phoneNumber || '',
          email: settings?.email || '',
          gradingScale: settings?.gradingScale || []
        })
      }).catch(() => { })
    }
  }, [user, school])

  useEffect(() => {
    if (user && token) {
      const socketManager = require('@/lib/socket-client').default
      socketManager.connect(token)

      const handleNewMessage = (message) => {
        if (message.senderId !== user.id) {
          if (activeTab !== 'messages') {
            setUnreadMessages(prev => prev + 1)
            const audio = new Audio('/notification.mp3')
            audio.play().catch(() => { })
            toast.success(`New message from ${message.senderName || 'Someone'}`)
          }
        }
      }

      socketManager.on('new_message', handleNewMessage)

      return () => {
        socketManager.off('new_message', handleNewMessage)
      }
    }
  }, [user, token, activeTab])

  useEffect(() => {
    if (activeTab === 'messages') {
      setUnreadMessages(0)
    }
  }, [activeTab])

  const handleAuth = async (authData) => {
    try {
      console.log('🔐 Attempting login with:', authData.email)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(authData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('✅ Login response received:', { user: result.user?.email, hasToken: !!result.token })

      setToken(result.token)
      setUser(result.user)
      setSchool(result.school)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.school) localStorage.setItem('school', JSON.stringify(result.school))
      console.log('💾 Saved to localStorage and state')
      modal.showSuccess('Login Successful', 'Welcome to My Academy!')
    } catch (error) {
      console.error('❌ Login error:', error)
      modal.showError('Login Failed', error.message || 'Please check your credentials')
      throw error // Re-throw to handle in LoginPage
    }
  }

  const handleLogout = () => {
    try {
      modal.showLoading('Logging out...')
      setUser(null)
      setSchool(null)
      setToken(null)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('school')
      modal.showSuccess('Logged Out', 'See you soon!')
    } catch (error) {
      modal.showError('Logout Error', 'An error occurred during logout')
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return modal.showError('Invalid File', 'Please select an image file')
    if (file.size > 2 * 1024 * 1024) return modal.showError('File Too Large', 'Image size should be less than 2MB')
    try {
      modal.showLoading('Uploading logo...')
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch('/api/upload', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` }, body: formData })
      if (!response.ok) throw new Error('Upload failed')
      const data = await response.json()
      setSchoolSettings(prev => ({ ...prev, logo: data.url }))
      modal.showSuccess('Upload Successful', 'Logo uploaded successfully!')
    } catch (error) {
      modal.showError('Upload Failed', 'Failed to upload logo')
    }
  }

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    try {
      modal.showLoading('Saving settings...')
      await apiCall('school/settings', { method: 'POST', body: JSON.stringify(schoolSettings) })
      if (school) {
        const updatedSchool = {
          ...school,
          name: schoolSettings.schoolName,
          logo: schoolSettings.logo,
          gradingScale: schoolSettings.gradingScale
        }
        setSchool(updatedSchool)
        localStorage.setItem('school', JSON.stringify(updatedSchool))
      }
      modal.showSuccess('Settings Saved', 'Settings saved successfully!')
    } catch (error) {
      modal.showError('Save Failed', error.message || 'Please try again')
    }
  }

  const handleUpdateStudent = async (updatedStudent) => {
    try {
      modal.showLoading('Updating student...')
      const { id, ...studentData } = updatedStudent
      await apiCall('students', { method: 'PUT', body: JSON.stringify({ id, ...studentData }) })
      await loadDashboardData()
      modal.showSuccess('Student Updated', 'Student information updated successfully!')
    } catch (error) {
      modal.showError('Update Failed', error.message || 'Failed to update student')
    }
  }

  const handleToggleSchoolStatus = async (schoolId, active) => {
    try {
      modal.showLoading(active ? 'Activating school...' : 'Deactivating school...')
      await apiCall('master/schools/toggle-status', {
        method: 'POST',
        body: JSON.stringify({ schoolId, active })
      })
      await loadDashboardData()
      modal.showSuccess(
        active ? 'School Activated' : 'School Deactivated',
        `School has been ${active ? 'activated' : 'deactivated'} successfully!`
      )
    } catch (error) {
      modal.showError('Update Failed', error.message || 'Failed to update school status')
    }
  }

  const getNavigationItems = () => {
    const baseItems = [{ id: 'dashboard', label: 'Dashboard', icon: Home }, { id: 'messages', label: 'Messages', icon: MessageCircle }]
    if (user?.role === 'developer') return [...baseItems, { id: 'schools', label: 'Schools', icon: Building2 }, { id: 'master-settings', label: 'Master Settings', icon: SettingsIcon }]
    if (user?.role === 'school_admin') return [...baseItems, { id: 'parents', label: 'Parents', icon: Users2 }, { id: 'students', label: 'Students', icon: Users }, { id: 'teachers', label: 'Teachers', icon: UserCheck }, { id: 'classes', label: 'Classes', icon: SchoolIcon }, { id: 'subjects', label: 'Subjects', icon: BookOpen }, { id: 'assignments', label: 'Assignments', icon: GraduationCap }, { id: 'teacher-attendance', label: 'Teacher Attendance', icon: Calendar }, { id: 'student-attendance', label: 'Student Attendance', icon: Clock }, { id: 'more-features', label: 'More Features', icon: Grid3x3 }, { id: 'billing', label: 'Billing', icon: CreditCard }, { id: 'school-settings', label: 'School Settings', icon: SettingsIcon }]
    if (user?.role === 'teacher') return [...baseItems, { id: 'gradebook', label: 'Gradebook', icon: BookOpen }, { id: 'my-classes', label: 'My Classes', icon: SchoolIcon }, { id: 'my-subjects', label: 'My Subjects', icon: BookOpen }, { id: 'students', label: 'My Students', icon: Users }, { id: 'parents', label: 'Parents', icon: Users2 }, { id: 'student-attendance', label: 'Mark Attendance', icon: Calendar }]
    if (user?.role === 'parent') return [...baseItems, { id: 'my-children', label: 'My Children', icon: Users }, { id: 'school-fees', label: 'School Fees', icon: CreditCard }, { id: 'attendance', label: 'Attendance Records', icon: Calendar }, { id: 'results', label: 'Results', icon: BarChart3 }]
    return baseItems
  }

  const handleQuickAction = (actionId) => {
    if (actionId === 'add-student') {
      setShowFormView('student')
      setActiveTab('students')
    } else if (actionId === 'add-teacher') {
      setShowFormView('teacher')
      setActiveTab('teachers')
    } else if (actionId === 'add-parent') {
      setShowFormView('parent')
      setActiveTab('parents')
    } else if (actionId === 'mark-attendance') {
      const today = new Date().toISOString().split('T')[0]
      if (user.role === 'school_admin') {
        teacherAttendanceHandlers.setAttendanceDate(today)
        teacherAttendanceHandlers.setAttendanceList([])
        teacherAttendanceHandlers.setShowAttendanceModal(true)
      } else if (user.role === 'teacher') {
        studentAttendanceHandlers.setAttendanceDate(today)
        studentAttendanceHandlers.setSelectedClass('')
        studentAttendanceHandlers.setAttendanceList([])
        studentAttendanceHandlers.setShowAttendanceModal(true)
      }
    } else if (actionId === 'generate-report') {
      setShowReportDialog(true)
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a1628]">
      <div className="text-center">
        <div className="relative mb-6">
          {/* Glowing backdrop */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-xl opacity-30 animate-pulse" />
          {/* Logo */}
          <img
            src="/logo.png"
            alt="My Academy"
            className="relative w-20 h-20 rounded-2xl mx-auto shadow-2xl"
          />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">My Academy</h2>
        <p className="text-blue-200/60 animate-pulse mb-6">Loading your dashboard...</p>
        {/* Loading bar */}
        <div className="w-64 bg-white/10 rounded-full h-1.5 mx-auto overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 h-full rounded-full animate-loading-bar" />
        </div>
      </div>
      <style jsx global>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
  if (!user) return <LoginPage onLogin={handleAuth} />

  // --- ACCESS CONTROL RENDERING ---
  if (subscriptionStatus.status === 'expired') {
    if (user.role === 'school_admin') {
      return <SubscriptionExpired school={school} user={user} />
    } else if (user.role === 'teacher' || user.role === 'parent') {
      return <AccessDeniedOverlay schoolName={school?.name} />
    }
  }
  // --------------------------------

  return (
    <MainLayout user={user} school={school} schoolSettings={schoolSettings} activeTab={activeTab} setActiveTab={setActiveTab} navigationItems={getNavigationItems()} handleLogout={handleLogout} setShowCalculator={setShowCalculator} unreadMessages={unreadMessages}>

      {/* Show Warning Banner */}
      <SubscriptionBanner
        status={subscriptionStatus.status}
        daysRemaining={subscriptionStatus.daysRemaining}
        message={subscriptionStatus.message}
      />

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          {(user.role === 'school_admin' || user.role === 'teacher') && <QuickActions userRole={user.role} onAction={handleQuickAction} />}
          <DashboardPage
            stats={stats}
            students={filteredStudents}
            teachers={teachers}
            parents={filteredParents}
            classes={filteredClasses}
            schools={schools}
            userRole={user.role}
            onToggleSchoolStatus={handleToggleSchoolStatus}
            assignments={assignments}
            currentUser={user}
            attendance={attendance}
            feePayments={feePayments}
            onPayFees={(child) => setActiveTab('school-fees')}
          />
          {(user.role === 'school_admin' || user.role === 'teacher') && <AttendanceCharts attendance={attendance.filter(a => user.role === 'teacher' ? a.studentId && filteredStudents.some(s => s.id === a.studentId) : true)} students={filteredStudents} teachers={teachers} classes={filteredClasses} userRole={user.role} />}
        </div>
      )}

      {showFormView === 'teacher' && <TeacherForm {...formHandlers} setShowFormView={setShowFormView} />}
      {showFormView === 'parent' && <ParentForm {...formHandlers} setShowFormView={setShowFormView} />}
      {showFormView === 'student' && <StudentForm {...formHandlers} setShowFormView={setShowFormView} parents={parents} classes={classes} />}

      {activeTab === 'teachers' && user.role === 'school_admin' && !showFormView && <TeachersPage teachers={teachers} school={school} {...filterHandlers} setShowFormView={setShowFormView} modal={modal} toast={toast} apiCall={apiCall} loadDashboardData={loadDashboardData} onEdit={(teacher) => { formHandlers.setTeacherForm({ teacherData: teacher, credentials: { email: '', password: '' } }); formHandlers.setTeacherPhotoPreview(teacher.photo || ''); setShowFormView('teacher'); }} onDelete={formHandlers.handleDeleteTeacher} />}
      {activeTab === 'parents' && user.role === 'school_admin' && !showFormView && <ParentsPage parents={parents} students={students} school={school} {...filterHandlers} setShowFormView={setShowFormView} modal={modal} toast={toast} apiCall={apiCall} loadDashboardData={loadDashboardData} onEdit={(parent) => { formHandlers.setParentForm({ parentData: parent, parentCredentials: { email: '', password: '' } }); formHandlers.setParentPhotoPreview(parent.photo || ''); setShowFormView('parent'); }} onDelete={formHandlers.handleDeleteParent} />}
      {activeTab === 'parents' && user.role === 'teacher' && <ParentsPage parents={filteredParents} students={filteredStudents} school={school} {...filterHandlers} setShowFormView={null} modal={modal} toast={toast} apiCall={apiCall} loadDashboardData={loadDashboardData} readOnly={true} />}
      {activeTab === 'students' && user.role === 'school_admin' && !showFormView && <StudentsPage students={students} classes={classes} parents={parents} school={school} {...filterHandlers} setShowFormView={setShowFormView} modal={modal} onUpdateStudent={handleUpdateStudent} toast={toast} apiCall={apiCall} loadDashboardData={loadDashboardData} onEdit={(student) => { formHandlers.setStudentForm(student); formHandlers.setStudentPhotoPreview(student.photo || ''); setShowFormView('student'); }} onDelete={formHandlers.handleDeleteStudent} />}
      {activeTab === 'students' && user.role === 'teacher' && <StudentsPage students={filteredStudents} classes={filteredClasses} parents={filteredParents} school={school} {...filterHandlers} setShowFormView={null} modal={modal} onUpdateStudent={null} toast={toast} apiCall={apiCall} loadDashboardData={loadDashboardData} readOnly={true} />}
      {activeTab === 'classes' && user.role === 'school_admin' && <ClassesPage classes={classes} students={students} showClassModal={showClassModal} setShowClassModal={setShowClassModal} classForm={formHandlers.classForm} setClassForm={formHandlers.setClassForm} handleCreateClass={async (e) => { const success = await formHandlers.handleCreateClass(e); if (success) setShowClassModal(false); }} handleDeleteClass={formHandlers.handleDeleteClass} />}
      {activeTab === 'my-classes' && user.role === 'teacher' && <ClassesPage classes={filteredClasses} students={filteredStudents} showClassModal={false} setShowClassModal={() => { }} classForm={{}} setClassForm={() => { }} handleCreateClass={() => { }} readOnly={true} />}
      {activeTab === 'subjects' && user.role === 'school_admin' && <SubjectsPage subjects={subjects} showSubjectModal={showSubjectModal} setShowSubjectModal={setShowSubjectModal} subjectForm={formHandlers.subjectForm} setSubjectForm={formHandlers.setSubjectForm} handleCreateSubject={async (e) => { const success = await formHandlers.handleCreateSubject(e); if (success) setShowSubjectModal(false); }} handleDeleteSubject={formHandlers.handleDeleteSubject} />}
      {activeTab === 'my-subjects' && user.role === 'teacher' && <SubjectsPage subjects={filteredSubjects} showSubjectModal={false} setShowSubjectModal={() => { }} subjectForm={{}} setSubjectForm={() => { }} handleCreateSubject={() => { }} readOnly={true} />}
      {activeTab === 'assignments' && user.role === 'school_admin' && <AssignmentsPage assignments={assignments} teachers={teachers} classes={classes} subjects={subjects} showAssignmentModal={showAssignmentModal} setShowAssignmentModal={setShowAssignmentModal} assignmentForm={formHandlers.assignmentForm} setAssignmentForm={formHandlers.setAssignmentForm} handleCreateAssignment={async (e) => { const success = await formHandlers.handleCreateAssignment(e, subjects, classes); if (success) setShowAssignmentModal(false); }} handleDeleteAssignment={formHandlers.handleDeleteAssignment} />}
      {activeTab === 'teacher-attendance' && user.role === 'school_admin' && <TeacherAttendancePage user={user} attendance={attendance.filter(a => a.teacherId)} teachers={teachers} {...teacherAttendanceHandlers} />}
      {activeTab === 'student-attendance' && (user.role === 'school_admin' || user.role === 'teacher') && <StudentAttendancePage user={user} attendance={attendance.filter(a => a.studentId)} students={filteredStudents} classes={filteredClasses} {...studentAttendanceHandlers} loadAttendanceByDate={loadAttendanceByDate} />}
      {activeTab === 'schools' && user.role === 'developer' && <SchoolsPage schools={schools} showMasterSchoolModal={showMasterSchoolModal} setShowMasterSchoolModal={setShowMasterSchoolModal} masterSchoolForm={formHandlers.masterSchoolForm} setMasterSchoolForm={formHandlers.setMasterSchoolForm} handleCreateSchool={formHandlers.handleCreateSchool} onToggleSchoolStatus={handleToggleSchoolStatus} apiCall={apiCall} onEdit={(school) => { formHandlers.setMasterSchoolForm({ schoolName: school.name, adminName: '', adminEmail: '', adminPassword: '', id: school.id }); setShowMasterSchoolModal(true); }} onDelete={formHandlers.handleDeleteSchool} />}
      {activeTab === 'school-settings' && user.role === 'school_admin' && <SchoolSettingsPage schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} handleLogoUpload={handleLogoUpload} handleSaveSettings={handleSaveSettings} />}
      {activeTab === 'school-settings' && user.role === 'school_admin' && <SchoolSettingsPage schoolSettings={schoolSettings} setSchoolSettings={setSchoolSettings} handleLogoUpload={handleLogoUpload} handleSaveSettings={handleSaveSettings} />}
      {activeTab === 'master-settings' && user.role === 'developer' && <MasterSettingsPage masterSettings={masterSettings} setMasterSettings={setMasterSettings} handleSaveMasterSettings={handleSaveMasterSettings} stats={stats} />}
      {activeTab === 'more-features' && user.role === 'school_admin' && <MoreFeaturesPage setActiveTab={setActiveTab} />}
      {activeTab === 'timetable' && user.role === 'school_admin' && <TimetablePage timetables={newFeatures.timetables} classes={classes} subjects={subjects} teachers={teachers} showModal={showTimetableModal} setShowModal={setShowTimetableModal} form={timetableForm} setForm={setTimetableForm} handleSubmit={(e) => newFeatures.handleTimetableSubmit(e, timetableForm, setShowTimetableModal)} handleDelete={newFeatures.handleTimetableDelete} onBack={() => setActiveTab('more-features')} school={school} schoolSettings={schoolSettings} />}
      {activeTab === 'exams' && user.role === 'school_admin' && <ExamsPage exams={newFeatures.exams} classes={classes} subjects={subjects} students={students} showModal={showExamModal} setShowModal={setShowExamModal} showGradeModal={showGradeModal} setShowGradeModal={setShowGradeModal} form={examForm} setForm={setExamForm} gradeForm={gradeForm} setGradeForm={setGradeForm} handleSubmit={(e) => newFeatures.handleExamSubmit(e, examForm, setShowExamModal)} handleGradeSubmit={(e) => newFeatures.handleGradeSubmit(e, gradeForm, setShowGradeModal)} handleDelete={newFeatures.handleDeleteExam} onBack={() => setActiveTab('more-features')} school={school} schoolSettings={schoolSettings} />}
      {activeTab === 'fees' && user.role === 'school_admin' && <FeesPage fees={newFeatures.fees} students={students} classes={classes} showModal={showFeeModal} setShowModal={setShowFeeModal} showPaymentModal={showPaymentModal} setShowPaymentModal={setShowPaymentModal} form={feeForm} setForm={setFeeForm} paymentForm={paymentForm} setPaymentForm={setPaymentForm} handleSubmit={(e) => newFeatures.handleFeeSubmit(e, feeForm, setShowFeeModal)} handlePayment={(e) => newFeatures.handlePayment(e, paymentForm, setShowPaymentModal)} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'homework' && user.role === 'school_admin' && <HomeworkPage homework={newFeatures.homework} classes={classes} subjects={subjects} students={students} userRole={user.role} showModal={showHomeworkModal} setShowModal={setShowHomeworkModal} form={homeworkForm} setForm={setHomeworkForm} handleSubmit={(e) => newFeatures.handleHomeworkSubmit(e, homeworkForm, setShowHomeworkModal)} handleGrade={() => { }} handleDelete={newFeatures.handleDeleteHomework} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'library' && user.role === 'school_admin' && <LibraryPage books={newFeatures.books} students={students} showModal={showBookModal} setShowModal={setShowBookModal} showIssueModal={showIssueModal} setShowIssueModal={setShowIssueModal} form={bookForm} setForm={setBookForm} issueForm={issueForm} setIssueForm={setIssueForm} handleSubmit={(e) => newFeatures.handleBookSubmit(e, bookForm, setShowBookModal)} handleIssue={(e) => newFeatures.handleIssueBook(e, issueForm, setShowIssueModal)} handleReturn={newFeatures.handleReturnBook} handleDelete={newFeatures.handleDeleteBook} searchTerm={bookSearch} setSearchTerm={setBookSearch} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'events' && user.role === 'school_admin' && <EventsPage events={newFeatures.events} classes={classes} showModal={showEventModal} setShowModal={setShowEventModal} form={eventForm} setForm={setEventForm} handleSubmit={(e) => newFeatures.handleEventSubmit(e, eventForm, setShowEventModal)} handleDelete={newFeatures.handleEventDelete} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'behavior' && user.role === 'school_admin' && <BehaviorPage behaviors={newFeatures.behaviors} students={students} classes={classes} showModal={showBehaviorModal} setShowModal={setShowBehaviorModal} form={behaviorForm} setForm={setBehaviorForm} handleSubmit={(e) => newFeatures.handleBehaviorSubmit(e, behaviorForm, setShowBehaviorModal)} handleDelete={newFeatures.handleDeleteBehavior} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'transport' && user.role === 'school_admin' && <TransportPage routes={newFeatures.routes} students={students} showModal={showRouteModal} setShowModal={setShowRouteModal} showAssignModal={showAssignRouteModal} setShowAssignModal={setShowAssignRouteModal} form={routeForm} setForm={setRouteForm} assignForm={assignRouteForm} setAssignForm={setAssignRouteForm} handleSubmit={(e) => newFeatures.handleRouteSubmit(e, routeForm, setShowRouteModal)} handleAssign={(e) => newFeatures.handleAssignRoute(e, assignRouteForm, setShowAssignRouteModal)} handleDelete={newFeatures.handleDeleteRoute} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'health' && user.role === 'school_admin' && <HealthPage healthRecords={newFeatures.healthRecords} students={students} showModal={showHealthModal} setShowModal={setShowHealthModal} form={healthForm} setForm={setHealthForm} handleSubmit={(e) => newFeatures.handleHealthSubmit(e, healthForm, setShowHealthModal)} handleDelete={newFeatures.handleDeleteHealthRecord} selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent} onBack={() => setActiveTab('more-features')} />}
      {activeTab === 'billing' && user.role === 'school_admin' && <BillingDashboard currentUser={user} school={school} />}

      {activeTab === 'messages' && <MessagesPage currentUser={user} onBack={() => setActiveTab('dashboard')} />}
      {activeTab === 'gradebook' && user.role === 'teacher' && (
        <GradebookPage
          currentUser={user}
          school={school}
          apiCall={apiCall}
          modal={modal}
          toast={toast}
          students={filteredStudents}
          classes={filteredClasses}
          subjects={filteredSubjects}
        />
      )}
      {activeTab === 'school-fees' && user.role === 'parent' && <SchoolFeesPage user={user} />}

      {!['dashboard', 'notifications', 'schools', 'teachers', 'parents', 'students', 'classes', 'subjects', 'my-classes', 'my-subjects', 'assignments', 'timetable', 'teacher-attendance', 'student-attendance', 'exams', 'homework', 'fees', 'library', 'events', 'behavior', 'transport', 'health', 'billing', 'payments', 'gamification', 'messages', 'school-fees', 'school-settings', 'master-settings', 'more-features', 'gradebook'].includes(activeTab) && <Card><CardContent className="p-8 text-center"><p className="text-gray-600">This section is under development.</p></CardContent></Card>}

      <ReportDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        students={students}
        teachers={teachers}
        parents={parents}
        classes={classes}
        attendance={attendance}
        stats={stats}
        userRole={user.role}
        schoolName={school?.name}
      />

      {showCalculator && <CalculatorApp isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}

      <LoadingModal open={modal.loading} message={modal.loadingMessage} />
      <StatusModal
        open={modal.status.open}
        onOpenChange={modal.closeStatus}
        type={modal.status.type}
        title={modal.status.title}
        message={modal.status.message}
      />
    </MainLayout>
  )
}

export default App
