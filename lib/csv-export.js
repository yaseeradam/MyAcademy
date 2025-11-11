// CSV Export Utility Functions

export const exportToCSV = (data, filename, schoolName = '') => {
  if (!data || data.length === 0) {
    alert('No data to export')
    return
  }

  // Get headers from the first object
  const headers = Object.keys(data[0])
  
  // Create CSV content
  let csvContent = ''
  
  // Add school name as header if provided
  if (schoolName) {
    csvContent += `${schoolName}\n`
    csvContent += `Export Date: ${new Date().toLocaleDateString()}\n\n`
  }
  
  // Add headers
  csvContent += headers.join(',') + '\n'
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => {
      const value = row[header]
      // Handle values that might contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return value || ''
    })
    csvContent += values.join(',') + '\n'
  })

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    
    // Create filename with school name and timestamp
    const timestamp = new Date().toISOString().split('T')[0]
    const schoolPrefix = schoolName ? `${schoolName.replace(/[^a-zA-Z0-9]/g, '_')}_` : ''
    link.setAttribute('download', `${schoolPrefix}${filename}_${timestamp}.csv`)
    
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

export const exportStudentsToCSV = (students, classes, parents, schoolName) => {
  const exportData = students.map(student => {
    const studentClass = classes.find(c => c.id === student.classId)
    const studentParent = parents.find(p => p.id === student.parentId)
    
    return {
      'First Name': student.firstName || '',
      'Last Name': student.lastName || '',
      'Admission Number': student.admissionNumber || '',
      'Email': student.email || '',
      'Phone Number': student.phoneNumber || '',
      'Date of Birth': student.dateOfBirth || '',
      'Gender': student.gender || '',
      'Address': student.address || '',
      'Class': studentClass?.name || 'Not Assigned',
      'Parent Name': studentParent?.name || 'Not Assigned',
      'Parent Email': studentParent?.email || '',
      'Parent Phone': studentParent?.phoneNumber || '',
      'Emergency Contact': student.emergencyContact || '',
      'Status': student.active ? 'Active' : 'Inactive',
      'Created Date': student.createdAt ? new Date(student.createdAt).toLocaleDateString() : ''
    }
  })
  
  exportToCSV(exportData, 'students', schoolName)
}

export const exportTeachersToCSV = (teachers, schoolName) => {
  const exportData = teachers.map(teacher => ({
    'First Name': teacher.firstName || '',
    'Last Name': teacher.lastName || '',
    'Email': teacher.email || '',
    'Phone Number': teacher.phoneNumber || '',
    'Address': teacher.address || '',
    'Qualification': teacher.qualification || '',
    'Experience': teacher.experience || '',
    'Specialization': teacher.specialization || '',
    'Date of Joining': teacher.dateOfJoining || '',
    'Status': teacher.active ? 'Active' : 'Inactive',
    'Created Date': teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString() : ''
  }))
  
  exportToCSV(exportData, 'teachers', schoolName)
}

export const exportParentsToCSV = (parents, students, schoolName) => {
  const exportData = parents.map(parent => {
    const parentChildren = students.filter(s => s.parentId === parent.id)
    const childrenNames = parentChildren.map(child => `${child.firstName} ${child.lastName}`).join('; ')
    
    return {
      'Name': parent.name || '',
      'Email': parent.email || '',
      'Phone Number': parent.phoneNumber || '',
      'Address': parent.address || '',
      'Children': childrenNames || 'No children assigned',
      'Children Count': parentChildren.length,
      'Status': parent.active ? 'Active' : 'Inactive',
      'Created Date': parent.createdAt ? new Date(parent.createdAt).toLocaleDateString() : ''
    }
  })
  
  exportToCSV(exportData, 'parents', schoolName)
}