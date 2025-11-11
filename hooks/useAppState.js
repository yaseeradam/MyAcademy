import { useState } from 'react'
import { toast } from 'sonner'

export function useAppState(user, token) {
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

  const apiCall = async (endpoint, options = {}) => {
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
        const error = await response.json()
        throw new Error(error.error || 'API Error')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      toast.error(error.message || 'Something went wrong')
      throw error
    }
  }

  const loadDashboardData = async () => {
    try {
      const [statsData, classesData, subjectsData] = await Promise.all([
        apiCall('dashboard/stats'),
        user.role !== 'developer' ? apiCall('classes') : Promise.resolve([]),
        user.role !== 'developer' ? apiCall('subjects') : Promise.resolve([])
      ])
      
      setStats(statsData)
      setClasses(classesData)
      setSubjects(subjectsData)
      
      if (user.role === 'developer') {
        const schoolsData = await apiCall('master/schools')
        setSchools(schoolsData)
      } else if (user.role === 'school_admin') {
        const [studentsData, teachersData, parentsData, assignmentsData] = await Promise.all([
          apiCall('students'),
          apiCall('teachers'),
          apiCall('parents'),
          apiCall('teacher-assignments')
        ])
        setStudents(studentsData)
        setTeachers(teachersData)
        setParents(parentsData)
        setAssignments(assignmentsData)
      } else if (user.role === 'teacher') {
        const assignmentsData = await apiCall('teacher-assignments')
        setAssignments(assignmentsData)
      } else if (user.role === 'parent') {
        const childrenData = await apiCall('parent/students')
        setStudents(childrenData)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  const loadNotifications = async () => {
    try {
      const notificationsData = await apiCall('notifications')
      setNotifications(notificationsData)
    } catch (error) {
      console.error('Error loading notifications:', error)
    }
  }

  return {
    stats, students, teachers, parents, classes, subjects,
    assignments, attendance, notifications, schools,
    setStudents, setTeachers, setParents, setClasses, setSubjects,
    setAssignments, setAttendance, setNotifications, setSchools,
    loadDashboardData, loadNotifications, apiCall
  }
}
