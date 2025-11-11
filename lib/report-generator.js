import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'

export const generateStudentReport = (students, classes, parents, schoolName) => {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text(`${schoolName || 'School'} - Student Report`, 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  
  const tableData = students.map(student => {
    const studentClass = classes.find(c => c.id === student.classId)
    const parent = parents.find(p => p.id === student.parentId)
    return [
      student.admissionNumber || 'N/A',
      `${student.firstName} ${student.lastName}`,
      studentClass?.name || 'N/A',
      student.gender || 'N/A',
      parent?.name || 'N/A',
      student.phoneNumber || 'N/A'
    ]
  })
  
  doc.autoTable({
    startY: 35,
    head: [['Admission No.', 'Name', 'Class', 'Gender', 'Parent', 'Phone']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [59, 130, 246] }
  })
  
  doc.save(`student-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const generateTeacherReport = (teachers, schoolName) => {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text(`${schoolName || 'School'} - Teacher Report`, 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  
  const tableData = teachers.map(teacher => [
    `${teacher.firstName} ${teacher.lastName}`,
    teacher.email || 'N/A',
    teacher.phoneNumber || 'N/A',
    teacher.qualification || 'N/A',
    teacher.specialization || 'N/A'
  ])
  
  doc.autoTable({
    startY: 35,
    head: [['Name', 'Email', 'Phone', 'Qualification', 'Specialization']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [16, 185, 129] }
  })
  
  doc.save(`teacher-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const generateAttendanceReport = (attendance, students, teachers, classes, userRole, schoolName) => {
  const doc = new jsPDF()
  
  doc.setFontSize(18)
  doc.text(`${schoolName || 'School'} - Attendance Report`, 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  
  const tableData = attendance.map(record => {
    if (userRole === 'school_admin') {
      const teacher = teachers.find(t => t.id === record.teacherId)
      return [
        teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
        new Date(record.date).toLocaleDateString(),
        record.status,
        new Date(record.createdAt).toLocaleTimeString()
      ]
    } else {
      const student = students.find(s => s.id === record.studentId)
      const studentClass = classes.find(c => c.id === record.classId)
      return [
        student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        studentClass?.name || 'N/A',
        new Date(record.date).toLocaleDateString(),
        record.status,
        new Date(record.createdAt).toLocaleTimeString()
      ]
    }
  })
  
  const headers = userRole === 'school_admin' 
    ? [['Teacher', 'Date', 'Status', 'Time']]
    : [['Student', 'Class', 'Date', 'Status', 'Time']]
  
  doc.autoTable({
    startY: 35,
    head: headers,
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246] }
  })
  
  doc.save(`attendance-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const generateComprehensiveReport = (stats, students, teachers, parents, classes, attendance, userRole, schoolName) => {
  const doc = new jsPDF()
  
  doc.setFontSize(20)
  doc.text(`${schoolName || 'School'} - Comprehensive Report`, 14, 20)
  doc.setFontSize(11)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)
  
  // Summary Statistics
  doc.setFontSize(14)
  doc.text('Summary Statistics', 14, 40)
  doc.setFontSize(11)
  doc.text(`Total Students: ${stats.totalStudents || students.length || 0}`, 20, 48)
  doc.text(`Total Teachers: ${stats.totalTeachers || teachers.length || 0}`, 20, 55)
  doc.text(`Total Parents: ${stats.totalParents || parents.length || 0}`, 20, 62)
  doc.text(`Total Classes: ${stats.totalClasses || classes.length || 0}`, 20, 69)
  
  // Attendance Summary
  const presentToday = attendance.filter(a => a.status === 'present').length
  const absentToday = attendance.filter(a => a.status === 'absent').length
  const lateToday = attendance.filter(a => a.status === 'late').length
  
  doc.setFontSize(14)
  doc.text('Today\'s Attendance', 14, 82)
  doc.setFontSize(11)
  doc.text(`Present: ${presentToday}`, 20, 90)
  doc.text(`Absent: ${absentToday}`, 20, 97)
  doc.text(`Late: ${lateToday}`, 20, 104)
  
  doc.save(`comprehensive-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const generateExcelReport = (students, teachers, parents, classes, schoolName) => {
  const wb = XLSX.utils.book_new()
  
  // Students Sheet
  const studentsData = students.map(student => {
    const studentClass = classes.find(c => c.id === student.classId)
    const parent = parents.find(p => p.id === student.parentId)
    return {
      'Admission No': student.admissionNumber || 'N/A',
      'First Name': student.firstName,
      'Last Name': student.lastName,
      'Class': studentClass?.name || 'N/A',
      'Gender': student.gender || 'N/A',
      'Parent': parent?.name || 'N/A',
      'Phone': student.phoneNumber || 'N/A',
      'Email': student.email || 'N/A'
    }
  })
  const wsStudents = XLSX.utils.json_to_sheet(studentsData)
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Students')
  
  // Teachers Sheet
  const teachersData = teachers.map(teacher => ({
    'First Name': teacher.firstName,
    'Last Name': teacher.lastName,
    'Email': teacher.email || 'N/A',
    'Phone': teacher.phoneNumber || 'N/A',
    'Qualification': teacher.qualification || 'N/A',
    'Specialization': teacher.specialization || 'N/A'
  }))
  const wsTeachers = XLSX.utils.json_to_sheet(teachersData)
  XLSX.utils.book_append_sheet(wb, wsTeachers, 'Teachers')
  
  // Parents Sheet
  const parentsData = parents.map(parent => ({
    'Name': parent.name,
    'Email': parent.email || 'N/A',
    'Phone': parent.phoneNumber || 'N/A',
    'Address': parent.address || 'N/A',
    'Children': students.filter(s => s.parentId === parent.id).length
  }))
  const wsParents = XLSX.utils.json_to_sheet(parentsData)
  XLSX.utils.book_append_sheet(wb, wsParents, 'Parents')
  
  XLSX.writeFile(wb, `${schoolName || 'school'}-report-${new Date().toISOString().split('T')[0]}.xlsx`)
}
