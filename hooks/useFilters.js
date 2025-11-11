import { useState } from 'react'

export function useFilters() {
  const [studentSearch, setStudentSearch] = useState('')
  const [teacherSearch, setTeacherSearch] = useState('')
  const [parentSearch, setParentSearch] = useState('')
  
  const [studentFilters, setStudentFilters] = useState({ class: 'all_classes', gender: 'all_genders', status: 'all_status' })
  const [teacherFilters, setTeacherFilters] = useState({ specialization: '', status: 'all_status' })
  const [parentFilters, setParentFilters] = useState({ childrenCount: 'all_parents', status: 'all_status' })

  const filterStudents = (students) => {
    return students.filter((student) => {
      const matchesSearch = !studentSearch || 
        student.firstName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.lastName?.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.admissionNumber?.toLowerCase().includes(studentSearch.toLowerCase())
      
      const matchesClass = studentFilters.class === 'all_classes' || student.classId === studentFilters.class
      const matchesGender = studentFilters.gender === 'all_genders' || student.gender === studentFilters.gender
      const matchesStatus = studentFilters.status === 'all_status' || 
        (studentFilters.status === 'active' && student.active) ||
        (studentFilters.status === 'inactive' && !student.active)
      
      return matchesSearch && matchesClass && matchesGender && matchesStatus
    })
  }

  const filterTeachers = (teachers) => {
    return teachers.filter((teacher) => {
      const matchesSearch = !teacherSearch ||
        teacher.firstName?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.lastName?.toLowerCase().includes(teacherSearch.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(teacherSearch.toLowerCase())
      
      const matchesSpecialization = !teacherFilters.specialization || 
        teacher.specialization?.toLowerCase().includes(teacherFilters.specialization.toLowerCase())
      const matchesStatus = teacherFilters.status === 'all_status' ||
        (teacherFilters.status === 'active' && teacher.active) ||
        (teacherFilters.status === 'inactive' && !teacher.active)
      
      return matchesSearch && matchesSpecialization && matchesStatus
    })
  }

  const filterParents = (parents, students = []) => {
    return parents.filter((parent) => {
      const matchesSearch = !parentSearch ||
        parent.name?.toLowerCase().includes(parentSearch.toLowerCase()) ||
        parent.email?.toLowerCase().includes(parentSearch.toLowerCase())
      
      const childrenCount = students.filter(s => s.parentId === parent.id).length
      const matchesChildrenCount = parentFilters.childrenCount === 'all_parents' ||
        (parentFilters.childrenCount === '1' && childrenCount === 1) ||
        (parentFilters.childrenCount === '2+' && childrenCount >= 2)
      
      const matchesStatus = parentFilters.status === 'all_status' ||
        (parentFilters.status === 'active' && parent.active) ||
        (parentFilters.status === 'inactive' && !parent.active)
      
      return matchesSearch && matchesChildrenCount && matchesStatus
    })
  }

  return {
    studentSearch, setStudentSearch, teacherSearch, setTeacherSearch, parentSearch, setParentSearch,
    studentFilters, setStudentFilters, teacherFilters, setTeacherFilters, parentFilters, setParentFilters,
    filterStudents, filterTeachers, filterParents
  }
}
