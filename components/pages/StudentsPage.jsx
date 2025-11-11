'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Download, Eye, Edit, Users, UserX } from 'lucide-react'
import { exportStudentsToCSV } from '@/lib/csv-export'
import { ViewStudentModal } from '@/components/modals/ViewStudentModal'
import { EditStudentModal } from '@/components/modals/EditStudentModal'

export default function StudentsPage({ 
  students, 
  classes, 
  parents, 
  school,
  studentSearch,
  setStudentSearch,
  studentFilters,
  setStudentFilters,
  setShowFormView,
  filterStudents,
  modal,
  onUpdateStudent,
  toast,
  apiCall,
  loadDashboardData,
  readOnly = false
}) {
  const [viewStudent, setViewStudent] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  console.log('StudentsPage - students:', students?.length, students)

  const handleView = (student) => {
    setViewStudent(student)
    setShowViewModal(true)
  }

  const handleEdit = () => {
    setShowViewModal(false)
    setEditStudent(viewStudent)
    setShowEditModal(true)
  }

  const handleSave = async (updatedStudent) => {
    setShowEditModal(false)
    if (onUpdateStudent) {
      await onUpdateStudent(updatedStudent)
    }
  }

  const handleDeactivate = async (student) => {
    if (!confirm(`Are you sure you want to ${student.active ? 'deactivate' : 'activate'} ${student.firstName} ${student.lastName}?`)) {
      return
    }

    try {
      await apiCall(`students?id=${student.id}`, {
        method: 'DELETE'
      })
      toast.success(`✅ Student ${student.active ? 'deactivated' : 'activated'} successfully!`)
      loadDashboardData()
    } catch (error) {
      toast.error('❌ Failed to update student status')
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{readOnly ? 'My Students' : 'Students Management'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportStudentsToCSV(students, classes, parents, school?.name)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {!readOnly && <Button onClick={() => setShowFormView('student')}>
            <Plus className="h-4 w-4 mr-2" />
            Add Student
          </Button>}
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search students by name, admission number..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select value={studentFilters.class} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, class: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_classes">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={studentFilters.gender} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_genders">All Genders</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={studentFilters.status} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_status">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Admission Number</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterStudents(students).map((student) => {
                const studentClass = classes.find(c => c.id === student.classId)
                const studentParent = parents.find(p => p.id === student.parentId)
                return (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{student.admissionNumber}</TableCell>
                    <TableCell>{studentClass?.name || 'Not assigned'}</TableCell>
                    <TableCell className="max-w-xs truncate">{studentParent?.name || 'Not assigned'}</TableCell>
                    <TableCell>{student.phoneNumber || 'N/A'}</TableCell>
                    <TableCell className="capitalize">{student.gender || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={student.active ? "default" : "secondary"}>
                        {student.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleView(student)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!readOnly && <>
                          <Button size="sm" variant="outline" onClick={() => { setViewStudent(student); handleEdit(); }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant={student.active ? "destructive" : "default"}
                            onClick={() => handleDeactivate(student)}
                          >
                            <UserX className="h-4 w-4" />
                          </Button>
                        </>}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {(!students || students.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No students enrolled yet.</p>
            <p className="text-sm text-gray-500 mt-1">Add your first student to get started.</p>
          </CardContent>
        </Card>
      )}

      <ViewStudentModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        student={viewStudent}
        parent={parents.find(p => p.id === viewStudent?.parentId)}
        classInfo={classes.find(c => c.id === viewStudent?.classId)}
        onEdit={handleEdit}
        schoolName={school?.name}
      />
      
      <EditStudentModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        student={editStudent}
        parents={parents}
        classes={classes}
        onSave={handleSave}
      />
    </div>
  )
}
