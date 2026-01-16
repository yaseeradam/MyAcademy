'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Download, Eye, Edit, Users, Trash2, Search } from 'lucide-react'
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
  onEdit,
  onDelete,
  readOnly = false
}) {
  const [viewStudent, setViewStudent] = useState(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{readOnly ? 'My Students' : 'Students Management'}</h2>
          <p className="text-slate-500 text-sm mt-1">Manage student records and enrollment</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportStudentsToCSV(students, classes, parents, school?.name)}
            className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {!readOnly && (
            <Button
              onClick={() => setShowFormView('student')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Student
            </Button>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search students by name, admission number..."
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="pl-11 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={studentFilters.class} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, class: value }))}>
            <SelectTrigger className="w-48 bg-white border-slate-200 text-slate-800">
              <SelectValue placeholder="Filter by class" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all_classes" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">All Classes</SelectItem>
              {classes.map((cls) => (
                <SelectItem key={cls.id} value={cls.id} className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={studentFilters.gender} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, gender: value }))}>
            <SelectTrigger className="w-48 bg-white border-slate-200 text-slate-800">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all_genders" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">All Genders</SelectItem>
              <SelectItem value="male" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">Male</SelectItem>
              <SelectItem value="female" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">Female</SelectItem>
            </SelectContent>
          </Select>

          <Select value={studentFilters.status} onValueChange={(value) => setStudentFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-48 bg-white border-slate-200 text-slate-800">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all_status" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">All Status</SelectItem>
              <SelectItem value="active" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">Active</SelectItem>
              <SelectItem value="inactive" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200/80 hover:bg-slate-50/80">
                <TableHead className="text-slate-700 font-semibold">Name</TableHead>
                <TableHead className="text-slate-700 font-semibold">Admission #</TableHead>
                <TableHead className="text-slate-700 font-semibold">Class</TableHead>
                <TableHead className="text-slate-700 font-semibold">Parent</TableHead>
                <TableHead className="text-slate-700 font-semibold">Phone</TableHead>
                <TableHead className="text-slate-700 font-semibold">Gender</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterStudents(students).map((student) => {
                const studentClass = classes.find(c => c.id === student.classId)
                const studentParent = parents.find(p => p.id === student.parentId)
                return (
                  <TableRow key={student.id} className="border-slate-200/80 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">
                      {student.firstName} {student.lastName}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-slate-600">{student.admissionNumber}</TableCell>
                    <TableCell className="text-slate-600">{studentClass?.name || 'Not assigned'}</TableCell>
                    <TableCell className="max-w-xs truncate text-slate-600">{studentParent?.name || 'Not assigned'}</TableCell>
                    <TableCell className="text-slate-600">{student.phoneNumber || 'N/A'}</TableCell>
                    <TableCell className="capitalize text-slate-600">{student.gender || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={student.active
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-rose-100 text-rose-700 border-rose-200"
                      }>
                        {student.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleView(student)}
                          className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!readOnly && <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { setViewStudent(student); onEdit(student); }}
                            className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { if (window.confirm('Are you sure?')) onDelete(student.id) }}
                            className="bg-white/80 border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Empty State */}
      {(!students || students.length === 0) && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700">No students enrolled yet.</p>
            <p className="text-sm text-slate-500 mt-1">Add your first student to get started.</p>
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
