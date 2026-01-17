import { useState, useEffect } from 'react'

export function useTeacherAttendance(user, apiCall, teachers, loadTodayAttendance, modal) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [attendanceList, setAttendanceList] = useState([])
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

  const loadAttendanceForDate = async () => {
    if (!attendanceDate || teachers.length === 0) return
    
    try {
      const attendanceRecords = await apiCall(`attendance?date=${attendanceDate}&type=teacher`)
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
    } catch (error) {
      console.error('Error loading teacher attendance:', error)
      setAttendanceList([])
    }
  }

  const handleMarkAttendance = async () => {
    try {
      const existing = await apiCall(`attendance?date=${attendanceDate}&type=teacher`)
      if (existing?.length) {
        modal?.showError('Already Marked', 'Teacher attendance has already been marked for this date.')
        return
      }
      modal?.showLoading('Marking teacher attendance...')
      const attendanceData = attendanceList.map(item => ({ 
        teacherId: item.teacherId, 
        date: attendanceDate, 
        status: item.status,
        type: 'teacher'
      }))
      await apiCall('attendance/bulk', { 
        method: 'POST', 
        body: JSON.stringify({ attendanceList: attendanceData, type: 'teacher' }) 
      })
      modal?.showSuccess('Attendance Marked', 'Teacher attendance marked successfully!')
      setShowAttendanceModal(false)
      loadTodayAttendance(true)
    } catch (error) {
      modal?.showError('Marking Failed', error.message || 'Failed to mark teacher attendance')
    }
  }

  useEffect(() => {
    if (showAttendanceModal && attendanceDate && teachers.length > 0) {
      loadAttendanceForDate()
    }
  }, [showAttendanceModal, attendanceDate, teachers.length])

  return {
    attendanceDate, setAttendanceDate,
    attendanceList, setAttendanceList, 
    showAttendanceModal, setShowAttendanceModal,
    handleMarkAttendance
  }
}
