'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, UserPlus, Edit, UserCheck, Trash2, Search } from 'lucide-react'
import { exportTeachersToCSV } from '@/lib/csv-export'
import { EditTeacherModal } from '@/components/modals/EditTeacherModal'

export default function TeachersPage({
  teachers,
  school,
  teacherSearch,
  setTeacherSearch,
  teacherFilters,
  setTeacherFilters,
  setShowFormView,
  filterTeachers,
  modal,
  toast,
  apiCall,
  loadDashboardData,
  onEdit,
  onDelete,
  readOnly = false
}) {
  const [editTeacher, setEditTeacher] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const handleEdit = (teacher) => {
    setEditTeacher(teacher)
    setShowEditModal(true)
  }

  const handleSave = async (updatedTeacher) => {
    modal?.showLoading('Updating teacher...')
    try {
      const { id, schoolId, createdAt, active, plainPassword, email, ...teacherData } = updatedTeacher
      await apiCall(`teachers?id=${id}`, { method: 'PUT', body: JSON.stringify(teacherData) })
      await loadDashboardData(true)
      setShowEditModal(false)
      modal?.showSuccess('Teacher Updated', 'Teacher information updated successfully!')
    } catch (error) {
      console.error('Teacher update error:', error)
      modal?.showError('Update Failed', error.message || 'Failed to update teacher')
    }
  }

  const handleDeactivate = async (teacher) => {
    if (!confirm(`Are you sure you want to ${teacher.active ? 'deactivate' : 'activate'} ${teacher.firstName} ${teacher.lastName}?`)) {
      return
    }

    modal?.showLoading(`${teacher.active ? 'Deactivating' : 'Activating'} teacher...`)
    try {
      await apiCall(`teachers?id=${teacher.id}`, {
        method: 'DELETE'
      })
      await loadDashboardData(true)
      modal?.showSuccess(
        `Teacher ${teacher.active ? 'Deactivated' : 'Activated'}`,
        `Teacher ${teacher.active ? 'deactivated' : 'activated'} successfully!`
      )
    } catch (error) {
      modal?.showError('Update Failed', error.message || 'Failed to update teacher status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Teachers Management</h2>
          <p className="text-slate-500 text-sm mt-1">Manage teaching staff and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportTeachersToCSV(teachers, school?.name)}
            className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button
            onClick={() => setShowFormView('teacher')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            type="text"
            placeholder="Search teachers by name, email, qualification..."
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            className="pl-11 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Filter by specialization"
            value={teacherFilters.specialization}
            onChange={(e) => setTeacherFilters(prev => ({ ...prev, specialization: e.target.value }))}
            className="w-48 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
          />

          <Select value={teacherFilters.status} onValueChange={(value) => setTeacherFilters(prev => ({ ...prev, status: value }))}>
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
                <TableHead className="text-slate-700 font-semibold">Email</TableHead>
                <TableHead className="text-slate-700 font-semibold">Phone</TableHead>
                <TableHead className="text-slate-700 font-semibold">Qualification</TableHead>
                <TableHead className="text-slate-700 font-semibold">Specialization</TableHead>
                <TableHead className="text-slate-700 font-semibold">Experience</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterTeachers(teachers).map((teacher) => (
                <TableRow key={teacher.id} className="border-slate-200/80 hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">
                    {teacher.firstName} {teacher.lastName}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">{teacher.email}</TableCell>
                  <TableCell className="text-slate-600">{teacher.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">{teacher.qualification || 'N/A'}</TableCell>
                  <TableCell className="text-slate-600">{teacher.specialization || 'N/A'}</TableCell>
                  <TableCell className="text-slate-600">{teacher.experience || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={teacher.active
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-rose-100 text-rose-700 border-rose-200"
                    }>
                      {teacher.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!readOnly && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(teacher)}
                          className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { if (window.confirm('Are you sure you want to delete this teacher?')) onDelete(teacher.id) }}
                          className="bg-white/80 border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {(!teachers || teachers.length === 0) && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <UserCheck className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700">No teachers added yet.</p>
            <p className="text-sm text-slate-500 mt-1">Add your first teacher to get started.</p>
          </CardContent>
        </Card>
      )}

      <EditTeacherModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        teacher={editTeacher}
        onSave={handleSave}
      />
    </div>
  )
}
