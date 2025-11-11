import { useMemo } from 'react'

export function useTeacherRestrictions(user, assignments, students, classes, subjects) {
  const restrictions = useMemo(() => {
    if (user?.role !== 'teacher') {
      return {
        assignedClassIds: [],
        assignedSubjectIds: [],
        filteredStudents: students,
        filteredClasses: classes,
        filteredSubjects: subjects,
        hasRestrictions: false
      }
    }

    const teacherAssignments = assignments.filter(a => a.teacherId === user.id)
    const assignedClassIds = [...new Set(teacherAssignments.map(a => a.classId))]
    const assignedSubjectIds = [...new Set(teacherAssignments.map(a => a.subjectId))]

    const filteredStudents = students.filter(s => assignedClassIds.includes(s.classId))
    const filteredClasses = classes.filter(c => assignedClassIds.includes(c.id))
    const filteredSubjects = subjects.filter(s => assignedSubjectIds.includes(s.id))

    return {
      assignedClassIds,
      assignedSubjectIds,
      filteredStudents,
      filteredClasses,
      filteredSubjects,
      hasRestrictions: true,
      teacherAssignments
    }
  }, [user, assignments, students, classes, subjects])

  const canAccessStudent = (studentId) => {
    if (user?.role !== 'teacher') return true
    const student = students.find(s => s.id === studentId)
    return student && restrictions.assignedClassIds.includes(student.classId)
  }

  const canAccessClass = (classId) => {
    if (user?.role !== 'teacher') return true
    return restrictions.assignedClassIds.includes(classId)
  }

  const canAccessSubject = (subjectId) => {
    if (user?.role !== 'teacher') return true
    return restrictions.assignedSubjectIds.includes(subjectId)
  }

  const getAssignmentForClassSubject = (classId, subjectId) => {
    return restrictions.teacherAssignments?.find(
      a => a.classId === classId && a.subjectId === subjectId
    )
  }

  return {
    ...restrictions,
    canAccessStudent,
    canAccessClass,
    canAccessSubject,
    getAssignmentForClassSubject
  }
}
