import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
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

  autoTable(doc, {
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

  autoTable(doc, {
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

  autoTable(doc, {
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

export const generateClassReportCards = (students, subjects, allScores, schoolName, className, gradingScale = [], schoolLogo = null) => {
  const doc = new jsPDF()

  // pre-calculate averages and positions
  const studentStats = students.map(student => {
    const studentScores = allScores.filter(s => s.studentId === student.id)
    const totalScore = studentScores.reduce((sum, s) => sum + (s.total || 0), 0)
    // Avoid division by zero; if no subjects, average is 0
    const average = studentScores.length > 0 ? (totalScore / studentScores.length) : 0
    return {
      studentId: student.id,
      average: average,
      totalScore: totalScore,
      subjectCount: studentScores.length
    }
  })

  // Sort by average descending to determine rank
  studentStats.sort((a, b) => b.average - a.average)

  students.forEach((student, index) => {
    if (index > 0) doc.addPage()

    // Find rank
    const rankIndex = studentStats.findIndex(s => s.studentId === student.id)
    const position = rankIndex !== -1 ? rankIndex + 1 : '-'
    const stats = studentStats[rankIndex]

    // Calculate Remarks based on Average
    let overallRemark = 'Pass'
    if (gradingScale.length > 0) {
      // Find grade for the average score
      const scale = gradingScale.sort((a, b) => b.min - a.min)
      const gradeObj = scale.find(g => stats.average >= g.min && stats.average <= g.max)
      if (gradeObj) overallRemark = gradeObj.remark || 'Pass'
    } else {
      if (stats.average >= 70) overallRemark = 'Excellent'
      else if (stats.average >= 60) overallRemark = 'Very Good'
      else if (stats.average >= 50) overallRemark = 'Good'
      else if (stats.average >= 40) overallRemark = 'Fair'
      else overallRemark = 'Fail'
    }

    let headerY = 15

    // Add School Logo if provided
    if (schoolLogo) {
      try {
        // Center the logo at the top
        doc.addImage(schoolLogo, 'PNG', 90, 10, 25, 25)
        headerY = 40
      } catch (e) {
        console.error('Error adding logo to PDF:', e)
      }
    }

    // Header
    doc.setFontSize(22)
    doc.setTextColor(41, 128, 185) // Blue color
    doc.text(schoolName || 'SCHOOL NAME', 105, headerY, { align: 'center' })

    const subtitleY = headerY + 15
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('OFFICIAL REPORT CARD', 105, subtitleY, { align: 'center' })

    // Student Info Box
    const infoBoxY = subtitleY + 10
    doc.setDrawColor(0)
    doc.setFillColor(245, 245, 245)
    doc.rect(14, infoBoxY, 182, 35, 'F')
    doc.rect(14, infoBoxY, 182, 35, 'S')

    doc.setFontSize(11)
    doc.text(`Name: ${student.firstName} ${student.lastName}`, 20, infoBoxY + 10)
    doc.text(`Admission No: ${student.admissionNumber || 'N/A'}`, 120, infoBoxY + 10)
    doc.text(`Class: ${className}`, 20, infoBoxY + 20)
    doc.text(`Session: ${new Date().getFullYear()}`, 120, infoBoxY + 20)
    doc.text(`Gender: ${student.gender || 'N/A'}`, 20, infoBoxY + 30) // Gender

    // Scores Table
    const studentScores = allScores.filter(s => s.studentId === student.id)

    const tableData = studentScores.map(score => {
      const subject = subjects.find(s => s.id === score.subjectId)
      // Determine remark for this subject
      let remark = '-'
      if (score.grade) {
        // Attempt to find remark from grading scale if available
        const gObj = gradingScale.find(g => g.grade === score.grade)
        if (gObj) remark = gObj.remark
      }
      return [
        subject?.name || 'Unknown',
        score.scores?.firstCA || '-',
        score.scores?.secondCA || '-',
        score.scores?.notebook || '-',
        score.scores?.firstProject || '-',
        score.scores?.secondProject || '-',
        score.scores?.exam || '-',
        score.total || 0,
        score.grade || '-',
        remark
      ]
    })

    autoTable(doc, {
      startY: infoBoxY + 45,
      head: [['Subject', '1st CA', '2nd CA', 'Nbk', '1st Prj', '2nd Prj', 'Exam', 'Total', 'Grade', 'Remark']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9,
        cellPadding: 2,
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'left', cellWidth: 35 },
        9: { cellWidth: 25 }
      }
    })

    // Performance Summary Table
    const summaryY = (doc.lastAutoTable?.finalY || 150) + 10

    autoTable(doc, {
      startY: summaryY,
      head: [['Total Score', 'Average Score', 'Class Position', 'Principal\'s Remark']],
      body: [[
        stats.totalScore.toFixed(1),
        stats.average.toFixed(1) + '%',
        `${position} / ${students.length}`,
        overallRemark
      ]],
      theme: 'plain', // Minimal styles
      headStyles: {
        fillColor: [220, 220, 220],
        textColor: 0,
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 12,
        cellPadding: 4,
        halign: 'center',
        lineWidth: 0.1,
        lineColor: [0, 0, 0]
      }
    })

    const finalY = (doc.lastAutoTable?.finalY || summaryY + 40) + 20

    // Signature lines
    doc.setLineWidth(0.5)
    doc.line(20, finalY + 20, 80, finalY + 20)
    doc.line(130, finalY + 20, 190, finalY + 20)

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Tutor\'s Signature', 35, finalY + 25)
    doc.text('Principal\'s Signature', 145, finalY + 25)

    // Key to Grading
    if (gradingScale.length > 0) {
      doc.setFontSize(8)
      doc.text("Grading Scale: " + gradingScale.map(g => `${g.grade}: ${g.min}-${g.max}`).join(', '), 14, finalY + 40)
    }

    // Footer
    doc.setFontSize(8)
    doc.text('Generated by School Management System', 105, 290, { align: 'center' })
  })

  doc.save(`class-report-cards-${new Date().toISOString().split('T')[0]}.pdf`)
}
