import { useState } from 'react'

export function useForms(apiCall, loadDashboardData, modal, parents = []) {
  const [teacherForm, setTeacherForm] = useState({
    teacherData: { firstName: '', lastName: '', email: '', phoneNumber: '', address: '', qualification: '', experience: '', specialization: '', dateOfJoining: '', photo: '' },
    credentials: { email: '', password: '' }
  })
  const [parentForm, setParentForm] = useState({
    parentData: { name: '', phoneNumber: '', address: '', photo: '' },
    parentCredentials: { email: '', password: '' }
  })
  const [studentForm, setStudentForm] = useState({
    firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', address: '', phoneNumber: '', parentId: '', classId: '', admissionNumber: '', emergencyContact: '', photo: ''
  })
  const [classForm, setClassForm] = useState({ name: '', description: '', capacity: '', academicYear: new Date().getFullYear().toString() })
  const [subjectForm, setSubjectForm] = useState({ name: '', code: '', description: '', credits: '' })
  const [assignmentForm, setAssignmentForm] = useState({ teacherId: '', classId: '', subjectId: '', subjectName: '', className: '' })
  const [masterSchoolForm, setMasterSchoolForm] = useState({ schoolName: '', adminName: '', adminEmail: '', adminPassword: '' })

  const [teacherPhotoPreview, setTeacherPhotoPreview] = useState('')
  const [parentPhotoPreview, setParentPhotoPreview] = useState('')
  const [studentPhotoPreview, setStudentPhotoPreview] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoUpload = (e, formType) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return modal?.showError('Invalid File', 'Please select an image file')
    if (file.size > 5 * 1024 * 1024) return modal?.showError('File Too Large', 'Image size should be less than 5MB')

    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result
      if (formType === 'student') {
        setStudentPhotoPreview(base64String)
        setStudentForm(prev => ({ ...prev, photo: base64String }))
      } else if (formType === 'teacher') {
        setTeacherPhotoPreview(base64String)
        setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, photo: base64String } }))
      } else if (formType === 'parent') {
        setParentPhotoPreview(base64String)
        setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, photo: base64String } }))
      }
    }
    reader.readAsDataURL(file)
  }

  const handleCreateTeacher = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const isUpdate = !!(teacherForm.teacherData.id || teacherForm.teacherData._id)
    modal?.showLoading(isUpdate ? 'Updating teacher...' : 'Creating teacher...')
    try {
      if (isUpdate) {
        await apiCall(`teachers?id=${teacherForm.teacherData.id || teacherForm.teacherData._id}`, { method: 'PUT', body: JSON.stringify(teacherForm.teacherData) })
        modal?.showSuccess('Teacher Updated', 'Teacher updated successfully!')
      } else {
        const result = await apiCall('teachers', { method: 'POST', body: JSON.stringify(teacherForm) })
        modal?.showSuccess('Teacher Created', `Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      }
      setTeacherForm({ teacherData: { firstName: '', lastName: '', email: '', phoneNumber: '', address: '', qualification: '', experience: '', specialization: '', dateOfJoining: '', photo: '' }, credentials: { email: '', password: '' } })
      setTeacherPhotoPreview('')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError(isUpdate ? 'Update Failed' : 'Creation Failed', error.message || 'Failed to process teacher')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTeacher = async (id) => {
    modal?.showLoading('Deleting teacher...')
    try {
      await apiCall(`teachers?id=${id}`, { method: 'DELETE' })
      modal?.showSuccess('Teacher Deleted', 'Teacher deleted successfully')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message)
      return false
    }
  }

  const handleCreateParent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Client-side Validation
    const email = parentForm.parentCredentials.email
    const password = parentForm.parentCredentials.password
    const isUpdate = !!(parentForm.parentData.id || parentForm.parentData._id)

    if (!isUpdate) {
      // Email Uniqueness Check
      if (parents && parents.some(p => p.email === email)) {
        modal?.showError('Email Taken', 'This email is already registered to another parent.')
        setIsSubmitting(false)
        return false
      }
      // Password Length Check
      if (password.length < 8) {
        modal?.showError('Invalid Password', 'Password must be at least 8 characters long.')
        setIsSubmitting(false)
        return false
      }
    }

    modal?.showLoading(isUpdate ? 'Updating parent...' : 'Creating parent account...')
    try {
      if (isUpdate) {
        if (password && password.length > 0 && password.length < 8) {
          modal?.showError('Invalid Password', 'Password must be at least 8 characters long.')
          return false
        }
        await apiCall(`parents?id=${parentForm.parentData.id || parentForm.parentData._id}`, {
          method: 'PUT',
          body: JSON.stringify({
            parentData: parentForm.parentData,
            parentCredentials: parentForm.parentCredentials
          })
        })
        modal?.showSuccess('Parent Updated', 'Parent updated successfully!')
      } else {
        const result = await apiCall('parents', { method: 'POST', body: JSON.stringify(parentForm) })
        modal?.showSuccess('Parent Created', `Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      }
      setParentForm({ parentData: { name: '', phoneNumber: '', address: '', photo: '' }, parentCredentials: { email: '', password: '' } })
      setParentPhotoPreview('')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError(isUpdate ? 'Update Failed' : 'Creation Failed', error.message || 'Failed to process parent')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteParent = async (id) => {
    modal?.showLoading('Deleting parent...')
    try {
      await apiCall(`parents?id=${id}`, { method: 'DELETE' })
      modal?.showSuccess('Parent Deleted', 'Parent deleted successfully')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message)
      return false
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    const isUpdate = !!(studentForm.id || studentForm._id)
    modal?.showLoading(isUpdate ? 'Updating student...' : 'Creating student...')
    try {
      let createdStudent = null
      if (isUpdate) {
        createdStudent = await apiCall(`students?id=${studentForm.id || studentForm._id}`, { method: 'PUT', body: JSON.stringify(studentForm) })
        modal?.showSuccess('Student Updated', 'Student updated successfully!')
      } else {
        const result = await apiCall('students', { method: 'POST', body: JSON.stringify(studentForm) })
        createdStudent = result.student || { ...studentForm, id: result.id }
        modal?.showSuccess('Student Created', `Student created successfully`)
      }
      setStudentForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', address: '', phoneNumber: '', parentId: '', classId: '', admissionNumber: '', emergencyContact: '', photo: '' })
      setStudentPhotoPreview('')
      loadDashboardData(true)
      return createdStudent
    } catch (error) {
      modal?.showError(isUpdate ? 'Update Failed' : 'Creation Failed', error.message || 'Failed to process student')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStudent = async (id) => {
    modal?.showLoading('Deleting student...')
    try {
      await apiCall(`students?id=${id}`, { method: 'DELETE' })
      modal?.showSuccess('Student Deleted', 'Student deleted successfully')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message)
      return false
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    const isUpdate = !!(classForm.id || classForm._id)
    modal?.showLoading(isUpdate ? 'Updating class...' : 'Creating class...')
    try {
      if (isUpdate) {
        await apiCall(`classes?id=${classForm.id || classForm._id}`, { method: 'PUT', body: JSON.stringify(classForm) })
        modal?.showSuccess('Class Updated', 'Class updated successfully!')
      } else {
        await apiCall('classes', { method: 'POST', body: JSON.stringify(classForm) })
        modal?.showSuccess('Class Created', 'Class created successfully!')
      }
      setClassForm({ name: '', description: '', capacity: '', academicYear: new Date().getFullYear().toString() })
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError(isUpdate ? 'Update Failed' : 'Creation Failed', error.message || 'Failed to process class')
      return false
    }
  }

  const handleDeleteClass = async (id) => {
    modal?.showLoading('Deleting class...')
    try {
      await apiCall(`classes?id=${id}`, { method: 'DELETE' })
      modal?.showSuccess('Class Deleted', 'Class deleted successfully')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message)
      return false
    }
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    const isUpdate = !!(subjectForm.id || subjectForm._id)
    modal?.showLoading(isUpdate ? 'Updating subject...' : 'Creating subject...')
    try {
      if (isUpdate) {
        await apiCall(`subjects?id=${subjectForm.id || subjectForm._id}`, { method: 'PUT', body: JSON.stringify(subjectForm) })
        modal?.showSuccess('Subject Updated', 'Subject updated successfully!')
      } else {
        await apiCall('subjects', { method: 'POST', body: JSON.stringify(subjectForm) })
        modal?.showSuccess('Subject Created', 'Subject created successfully!')
      }
      setSubjectForm({ name: '', code: '', description: '', credits: '' })
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError(isUpdate ? 'Update Failed' : 'Creation Failed', error.message || 'Failed to process subject')
      return false
    }
  }

  const handleDeleteSubject = async (id) => {
    modal?.showLoading('Deleting subject...')
    try {
      await apiCall(`subjects?id=${id}`, { method: 'DELETE' })
      modal?.showSuccess('Subject Deleted', 'Subject deleted successfully')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message)
      return false
    }
  }

  const handleCreateAssignment = async (e, subjects, classes) => {
    e.preventDefault()
    modal?.showLoading((assignmentForm.id || assignmentForm._id) ? 'Updating assignment...' : 'Assigning teacher...')
    try {
      const selectedSubject = subjects.find(s => s.id === assignmentForm.subjectId)
      const selectedClass = classes.find(c => c.id === assignmentForm.classId)

      if (assignmentForm.id || assignmentForm._id) {
        await apiCall(`teacher-assignments?id=${assignmentForm.id || assignmentForm._id}`, {
          method: 'PUT',
          body: JSON.stringify({ ...assignmentForm, subjectName: selectedSubject?.name || '', className: selectedClass?.name || '' })
        })
        modal?.showSuccess('Assignment Updated', 'Teacher assignment updated successfully!')
      } else {
        await apiCall('teacher-assignments', {
          method: 'POST',
          body: JSON.stringify({ ...assignmentForm, subjectName: selectedSubject?.name || '', className: selectedClass?.name || '' })
        })
        modal?.showSuccess('Assignment Created', 'Teacher assigned successfully!')
      }

      setAssignmentForm({ teacherId: '', classId: '', subjectId: '', subjectName: '', className: '' })
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Assignment Failed', error.message || 'Failed to assign teacher')
      return false
    }
  }

  const handleDeleteAssignment = async (assignmentId) => {
    modal?.showLoading('Deleting assignment...')
    try {
      await apiCall(`teacher-assignments?id=${assignmentId}`, { method: 'DELETE' })
      modal?.showSuccess('Assignment Deleted', 'Teacher assignment deleted successfully!')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message || 'Failed to delete assignment')
      return false
    }
  }

  const handleCreateSchool = async (e) => {
    e.preventDefault()
    modal?.showLoading('Creating school...')
    try {
      await apiCall('master/schools', { method: 'POST', body: JSON.stringify(masterSchoolForm) })
      modal?.showSuccess('School Created', 'School created successfully!')
      setMasterSchoolForm({ schoolName: '', adminName: '', adminEmail: '', adminPassword: '' })
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create school')
      return false
    }
  }

  const handleDeleteSchool = async (id) => {
    modal?.showLoading('Deleting school...')
    try {
      await apiCall(`master/schools?id=${id}`, { method: 'DELETE' })
      modal?.showSuccess('School Deleted', 'School deleted and account deactivated successfully')
      loadDashboardData(true)
      return true
    } catch (error) {
      modal?.showError('Delete Failed', error.message)
      return false
    }
  }

  const handleAddAdmin = async (schoolId, adminForm) => {
    modal?.showLoading('Adding admin...')
    try {
      const response = await apiCall('school/admins', {
        method: 'POST',
        body: JSON.stringify({ ...adminForm, schoolId })
      })
      modal?.showSuccess('Admin Added', 'School administrator added successfully!')
      loadDashboardData(true)
      return response
    } catch (error) {
      modal?.showError('Action Failed', error.message || 'Failed to add admin')
      throw error
    }
  }

  return {
    teacherForm, setTeacherForm, parentForm, setParentForm, studentForm, setStudentForm,
    classForm, setClassForm, subjectForm, setSubjectForm, assignmentForm, setAssignmentForm,
    masterSchoolForm, setMasterSchoolForm, teacherPhotoPreview, parentPhotoPreview, studentPhotoPreview,
    setTeacherPhotoPreview, setParentPhotoPreview, setStudentPhotoPreview,
    isSubmitting, handlePhotoUpload,
    handleCreateTeacher, handleDeleteTeacher,
    handleCreateParent, handleDeleteParent,
    handleCreateStudent, handleDeleteStudent,
    handleCreateClass, handleDeleteClass,
    handleCreateSubject, handleDeleteSubject,
    handleCreateAssignment, handleDeleteAssignment,
    handleCreateSchool, handleDeleteSchool, handleAddAdmin
  }
}
