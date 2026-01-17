import { useState, useEffect } from 'react'

export function useStudentAttendance(user, apiCall, students, loadTodayAttendance, modal) {
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedClass, setSelectedClass] = useState('')
  const [attendanceList, setAttendanceList] = useState([])
  const [showAttendanceModal, setShowAttendanceModal] = useState(false)

  const loadAttendanceForClass = async () => {
    if (!selectedClass || !attendanceDate) return
    
    try {
      const classStudents = students.filter(student => student.classId === selectedClass)
      if (classStudents.length === 0) {
        setAttendanceList([])
        return
      }
      const attendanceRecords = await apiCall(`attendance?classId=${selectedClass}&date=${attendanceDate}&type=student`)
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
    } catch (error) {
      console.error('Error loading student attendance:', error)
      setAttendanceList([])
    }
  }

  const handleMarkAttendance = async () => {
    try {
      const existing = await apiCall(`attendance?classId=${selectedClass}&date=${attendanceDate}&type=student`)
      if (existing?.length) {
        modal?.showError('Already Marked', 'Student attendance has already been marked for this class and date.')
        return
      }
      modal?.showLoading('Marking student attendance...')
      const attendanceData = attendanceList.map(item => ({ 
        studentId: item.studentId, 
        classId: selectedClass, 
        date: attendanceDate, 
        status: item.status,
        type: 'student'
      }))
      await apiCall('attendance/bulk', { 
        method: 'POST', 
        body: JSON.stringify({ attendanceList: attendanceData, type: 'student' }) 
      })
      modal?.showSuccess('Attendance Marked', 'Student attendance marked successfully!')
      setShowAttendanceModal(false)
      loadTodayAttendance()
    } catch (error) {
      modal?.showError('Marking Failed', error.message || 'Failed to mark student attendance')
    }
  }

  useEffect(() => {
    if (showAttendanceModal && selectedClass && attendanceDate && students.length > 0) {
      loadAttendanceForClass()
    }
  }, [showAttendanceModal, selectedClass, attendanceDate, students.length])

  return {
    attendanceDate, setAttendanceDate, 
    selectedClass, setSelectedClass,
    attendanceList, setAttendanceList, 
    showAttendanceModal, setShowAttendanceModal,
    handleMarkAttendance
  }
}
