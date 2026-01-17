import { useState, useEffect } from 'react'

export function useAttendance(user, apiCall, students, teachers, loadTodayAttendance, modal) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceList, setAttendanceList] = useState([])
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

  const loadAttendanceForClass = async () => {
    if (!attendanceDate) return
    
    try {
      if (user.role === 'school_admin') {
        if (teachers.length === 0) return
        const attendanceRecords = await apiCall(`attendance?date=${attendanceDate}`)
        const attendanceMap = {}
        attendanceRecords.forEach(record => {
          if (record.teacherId) attendanceMap[record.teacherId] = record.status
        })
        const attendanceData = teachers.map(teacher => ({
          teacherId: teacher.id,
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          status: attendanceMap[teacher.id] || 'present'
        }))
        setAttendanceList(attendanceData)
      } else if (user.role === 'teacher') {
        if (!selectedClass) return
        const classStudents = students.filter(student => student.classId === selectedClass)
        if (classStudents.length === 0) {
          setAttendanceList([])
          return
        }
        const attendanceRecords = await apiCall(`attendance?classId=${selectedClass}&date=${attendanceDate}`)
        const attendanceMap = {}
        attendanceRecords.forEach(record => {
          if (record.studentId) attendanceMap[record.studentId] = record.status
        })
        const attendanceData = classStudents.map(student => ({
          studentId: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          status: attendanceMap[student.id] || 'present'
        }))
        setAttendanceList(attendanceData)
      }
    } catch (error) {
      console.error('Error loading attendance:', error)
      setAttendanceList([])
    }
  }

  const handleMarkAttendance = async () => {
    try {
      if (user.role === 'school_admin') {
        const existing = await apiCall(`attendance?date=${attendanceDate}&type=teacher`)
        if (existing?.length) {
          modal?.showError('Already Marked', 'Teacher attendance has already been marked for this date.')
          return
        }
        modal?.showLoading('Marking attendance...')
        const attendanceData = attendanceList.map(item => ({ teacherId: item.teacherId, date: attendanceDate, status: item.status }))
        await apiCall('attendance/bulk', { method: 'POST', body: JSON.stringify({ attendanceList: attendanceData, type: 'teacher' }) })
      } else {
        const existing = await apiCall(`attendance?classId=${selectedClass}&date=${attendanceDate}&type=student`)
        if (existing?.length) {
          modal?.showError('Already Marked', 'Student attendance has already been marked for this class and date.')
          return
        }
        modal?.showLoading('Marking attendance...')
        const attendanceData = attendanceList.map(item => ({ studentId: item.studentId, classId: selectedClass, date: attendanceDate, status: item.status }))
        await apiCall('attendance/bulk', { method: 'POST', body: JSON.stringify({ attendanceList: attendanceData, type: 'student' }) })
      }
      modal?.showSuccess('Attendance Marked', 'Attendance marked successfully!')
      setShowAttendanceModal(false)
      loadTodayAttendance()
    } catch (error) {
      modal?.showError('Marking Failed', error.message || 'Failed to mark attendance')
    }
  }

  useEffect(() => {
    if (!showAttendanceModal) return
    if (user?.role === 'school_admin' && attendanceDate && teachers.length > 0) {
      loadAttendanceForClass()
    } else if (user?.role === 'teacher' && selectedClass && attendanceDate && students.length > 0) {
      loadAttendanceForClass()
    }
  }, [showAttendanceModal, selectedClass, attendanceDate, students.length, teachers.length, user?.role])

  return {
    attendanceDate, setAttendanceDate, selectedClass, setSelectedClass,
    attendanceList, setAttendanceList, showAttendanceModal, setShowAttendanceModal,
    handleMarkAttendance
  }
}
