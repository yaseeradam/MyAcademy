import { useState, useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'

export function useAppData(user, token) {
  const [stats, setStats] = useState({})
  const [students, setStudents] = useState([])
  const [teachers, setTeachers] = useState([])
  const [parents, setParents] = useState([])
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [assignments, setAssignments] = useState([])
  const [attendance, setAttendance] = useState([])
  const [notifications, setNotifications] = useState([])
  const [schools, setSchools] = useState([])
  const [feePayments, setFeePayments] = useState([])
  const isMountedRef = useRef(true)
  const dataLoadedRef = useRef(false)

  const apiCall = useCallback(async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        },
        ...options
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('school')
          toast.error('Session expired. Redirecting to login...')
          window.location.reload()
          throw new Error('Session expired')
        }
        const error = await response.json()
        const errorMessage = error.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('❌ Network error: Please check your connection')
      } else {
        toast.error('❌ ' + (error.message || 'Something went wrong'))
      }
      throw error
    }
  }, [token])

  const loadDashboardData = useCallback(async (forceReload = false) => {
    if (!isMountedRef.current) return
    
    // Reset cache flag if force reload
    if (forceReload) {
      dataLoadedRef.current = false
    }
    
    try {
      // Load all data in parallel based on role
      if (user.role === 'developer') {
        const [statsData, schoolsData] = await Promise.all([
          apiCall('dashboard/stats'),
          apiCall('master/schools')
        ])
        if (isMountedRef.current) {
          setStats(statsData)
          setSchools(schoolsData)
        }
      } else if (user.role === 'school_admin') {
        const [statsData, classesData, subjectsData, studentsData, teachersData, parentsData, assignmentsData] = await Promise.all([
          apiCall('dashboard/stats'),
          apiCall('classes'),
          apiCall('subjects'),
          apiCall('students'),
          apiCall('teachers'),
          apiCall('parents'),
          apiCall('teacher-assignments')
        ])
        if (isMountedRef.current) {
          setStats(statsData)
          setClasses(classesData)
          setSubjects(subjectsData)
          setStudents(studentsData)
          setTeachers(teachersData)
          setParents(parentsData)
          setAssignments(assignmentsData)
        }
      } else if (user.role === 'teacher') {
        const [statsData, classesData, subjectsData, assignmentsData, studentsData, parentsData] = await Promise.all([
          apiCall('dashboard/stats'),
          apiCall('classes'),
          apiCall('subjects'),
          apiCall('teacher-assignments'),
          apiCall('students'),
          apiCall('parents')
        ])
        if (isMountedRef.current) {
          setStats(statsData)
          setClasses(classesData)
          setSubjects(subjectsData)
          setAssignments(assignmentsData)
          setStudents(studentsData)
          setParents(parentsData)
        }
      } else if (user.role === 'parent') {
        const [statsData, childrenData, classesData, feesData, attendanceData] = await Promise.all([
          apiCall('dashboard/stats'),
          apiCall('parent/students'),
          apiCall('classes'),
          apiCall('parent/fees'),
          apiCall('attendance')
        ])
        if (isMountedRef.current) {
          setStats(statsData)
          setStudents(childrenData)
          setClasses(classesData)
          setFeePayments(feesData)
          setAttendance(attendanceData)
        }
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    }
  }, [user?.role, apiCall])

  const loadNotifications = useCallback(async () => {
    if (!isMountedRef.current) return
    try {
      const notificationsData = await apiCall('notifications')
      if (isMountedRef.current) setNotifications(notificationsData)
    } catch (error) {
      // Error already handled
    }
  }, [apiCall])

  const loadTodayAttendance = useCallback(async () => {
    if (!isMountedRef.current) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const records = await apiCall(`attendance?date=${today}`)
      if (isMountedRef.current) setAttendance(records)
    } catch (error) {
      console.error('Error loading today attendance:', error)
    }
  }, [apiCall])

  const loadAttendanceByDate = useCallback(async (date) => {
    if (!isMountedRef.current) return
    try {
      const records = await apiCall(`attendance?date=${date}`)
      if (isMountedRef.current) setAttendance(records)
    } catch (error) {
      console.error('Error loading attendance:', error)
    }
  }, [apiCall])

  useEffect(() => {
    isMountedRef.current = true
    
    if (user && token && !dataLoadedRef.current) {
      dataLoadedRef.current = true
      loadDashboardData()
      loadNotifications()
      if (user.role === 'school_admin' || user.role === 'teacher') {
        loadTodayAttendance()
      }
    }
    
    return () => {
      isMountedRef.current = false
    }
  }, [user, token, loadDashboardData, loadNotifications, loadTodayAttendance])

  return {
    stats, students, teachers, parents, classes, subjects, assignments, attendance, notifications, schools, feePayments,
    setStudents, setTeachers, setParents, setClasses, setSubjects, setAssignments, setAttendance, setNotifications, setSchools,
    apiCall, loadDashboardData, loadNotifications, loadTodayAttendance, loadAttendanceByDate
  }
}
