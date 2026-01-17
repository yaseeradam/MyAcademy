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

  const withNoCache = (endpoint, forceReload) => {
    if (!forceReload) return endpoint
    const separator = endpoint.includes('?') ? '&' : '?'
    return `${endpoint}${separator}nocache=1`
  }

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
          const error = await response.json().catch(() => ({}))
          // Don't auto-logout - just log and throw the error
          console.warn('401 error on endpoint:', endpoint, error)
          throw new Error(error.error || 'Unauthorized')
        }
        const error = await response.json()
        const errorMessage = error.error || `HTTP ${response.status}: ${response.statusText}`
        throw new Error(errorMessage)
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      // Don't show toast for 401 errors or network errors during initial load
      const is401 = error.message?.includes('Unauthorized')
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('❌ Network error: Please check your connection')
      } else if (!is401) {
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
          apiCall(withNoCache('dashboard/stats', forceReload)),
          apiCall(withNoCache('master/schools', forceReload))
        ])
        if (isMountedRef.current) {
          setStats(statsData)
          setSchools(schoolsData)
        }
      } else if (user.role === 'school_admin') {
        const [statsData, classesData, subjectsData, studentsData, teachersData, parentsData, assignmentsData] = await Promise.all([
          apiCall(withNoCache('dashboard/stats', forceReload)),
          apiCall(withNoCache('classes', forceReload)),
          apiCall(withNoCache('subjects', forceReload)),
          apiCall(withNoCache('students', forceReload)),
          apiCall(withNoCache('teachers', forceReload)),
          apiCall(withNoCache('parents', forceReload)),
          apiCall(withNoCache('teacher-assignments', forceReload))
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
          apiCall(withNoCache('dashboard/stats', forceReload)),
          apiCall(withNoCache('classes', forceReload)),
          apiCall(withNoCache('subjects', forceReload)),
          apiCall(withNoCache('teacher-assignments', forceReload)),
          apiCall(withNoCache('students', forceReload)),
          apiCall(withNoCache('parents', forceReload))
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
          apiCall(withNoCache('dashboard/stats', forceReload)),
          apiCall(withNoCache('parent/students', forceReload)),
          apiCall(withNoCache('classes', forceReload)),
          apiCall(withNoCache('parent/fees', forceReload)),
          apiCall(withNoCache('attendance', forceReload))
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

  const loadNotifications = useCallback(async (forceReload = false) => {
    if (!isMountedRef.current) return
    try {
      const notificationsData = await apiCall(withNoCache('notifications', forceReload))
      if (isMountedRef.current) setNotifications(notificationsData)
    } catch (error) {
      // Error already handled
    }
  }, [apiCall])

  const loadTodayAttendance = useCallback(async (forceReload = false) => {
    if (!isMountedRef.current) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const records = await apiCall(withNoCache(`attendance?date=${today}`, forceReload))
      if (isMountedRef.current) setAttendance(records)
    } catch (error) {
      console.error('Error loading today attendance:', error)
    }
  }, [apiCall])

  const loadAttendanceByDate = useCallback(async (date, forceReload = false) => {
    if (!isMountedRef.current) return
    try {
      const records = await apiCall(withNoCache(`attendance?date=${date}`, forceReload))
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
      // Only load notifications for roles with a schoolId
      if (user.role !== 'developer') {
        loadNotifications()
      }
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
