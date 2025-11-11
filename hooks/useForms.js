import { useState } from 'react'

export function useForms(apiCall, loadDashboardData, modal) {
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
    modal?.showLoading('Creating teacher...')
    try {
      const result = await apiCall('teachers', { method: 'POST', body: JSON.stringify(teacherForm) })
      modal?.showSuccess('Teacher Created', `Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      setTeacherForm({ teacherData: { firstName: '', lastName: '', email: '', phoneNumber: '', address: '', qualification: '', experience: '', specialization: '', dateOfJoining: '', photo: '' }, credentials: { email: '', password: '' } })
      setTeacherPhotoPreview('')
      loadDashboardData()
      return true
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create teacher')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateParent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    modal?.showLoading('Creating parent account...')
    try {
      const result = await apiCall('parents', { method: 'POST', body: JSON.stringify(parentForm) })
      modal?.showSuccess('Parent Created', `Login: ${result.credentials.email} / ${result.credentials.tempPassword}`)
      setParentForm({ parentData: { name: '', phoneNumber: '', address: '', photo: '' }, parentCredentials: { email: '', password: '' } })
      setParentPhotoPreview('')
      loadDashboardData()
      return true
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create parent')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateStudent = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    modal?.showLoading('Creating student...')
    try {
      const result = await apiCall('students', { method: 'POST', body: JSON.stringify(studentForm) })
      const createdStudent = result.student || { ...studentForm, id: result.id }
      setStudentForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', gender: '', address: '', phoneNumber: '', parentId: '', classId: '', admissionNumber: '', emergencyContact: '', photo: '' })
      setStudentPhotoPreview('')
      loadDashboardData()
      modal?.hideLoading()
      return createdStudent
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create student')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateClass = async (e) => {
    e.preventDefault()
    modal?.showLoading('Creating class...')
    try {
      await apiCall('classes', { method: 'POST', body: JSON.stringify(classForm) })
      modal?.showSuccess('Class Created', 'Class created successfully!')
      setClassForm({ name: '', description: '', capacity: '', academicYear: new Date().getFullYear().toString() })
      loadDashboardData()
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create class')
    }
  }

  const handleCreateSubject = async (e) => {
    e.preventDefault()
    modal?.showLoading('Creating subject...')
    try {
      await apiCall('subjects', { method: 'POST', body: JSON.stringify(subjectForm) })
      modal?.showSuccess('Subject Created', 'Subject created successfully!')
      setSubjectForm({ name: '', code: '', description: '', credits: '' })
      loadDashboardData()
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create subject')
    }
  }

  const handleCreateAssignment = async (e, subjects, classes) => {
    e.preventDefault()
    modal?.showLoading('Assigning teacher...')
    try {
      const selectedSubject = subjects.find(s => s.id === assignmentForm.subjectId)
      const selectedClass = classes.find(c => c.id === assignmentForm.classId)
      await apiCall('teacher-assignments', { method: 'POST', body: JSON.stringify({ ...assignmentForm, subjectName: selectedSubject?.name || '', className: selectedClass?.name || '' }) })
      modal?.showSuccess('Assignment Created', 'Teacher assigned successfully!')
      setAssignmentForm({ teacherId: '', classId: '', subjectId: '', subjectName: '', className: '' })
      loadDashboardData()
    } catch (error) {
      modal?.showError('Assignment Failed', error.message || 'Failed to assign teacher')
    }
  }

  const handleCreateSchool = async (e) => {
    e.preventDefault()
    modal?.showLoading('Creating school...')
    try {
      await apiCall('master/schools', { method: 'POST', body: JSON.stringify(masterSchoolForm) })
      modal?.showSuccess('School Created', 'School created successfully!')
      setMasterSchoolForm({ schoolName: '', adminName: '', adminEmail: '', adminPassword: '' })
      loadDashboardData()
    } catch (error) {
      modal?.showError('Creation Failed', error.message || 'Failed to create school')
    }
  }

  return {
    teacherForm, setTeacherForm, parentForm, setParentForm, studentForm, setStudentForm,
    classForm, setClassForm, subjectForm, setSubjectForm, assignmentForm, setAssignmentForm,
    masterSchoolForm, setMasterSchoolForm, teacherPhotoPreview, parentPhotoPreview, studentPhotoPreview,
    isSubmitting, handlePhotoUpload, handleCreateTeacher, handleCreateParent, handleCreateStudent,
    handleCreateClass, handleCreateSubject, handleCreateAssignment, handleCreateSchool
  }
}
