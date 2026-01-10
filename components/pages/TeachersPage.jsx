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
          <h2 className="text-2xl font-bold text-white">Teachers Management</h2>
          <p className="text-blue-200/60 text-sm mt-1">Manage teaching staff and assignments</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportTeachersToCSV(teachers, school?.name)}
            className="bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white"
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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200/40" />
          <Input
            type="text"
            placeholder="Search teachers by name, email, qualification..."
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 focus:border-amber-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Input
            placeholder="Filter by specialization"
            value={teacherFilters.specialization}
            onChange={(e) => setTeacherFilters(prev => ({ ...prev, specialization: e.target.value }))}
            className="w-48 bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
          />

          <Select value={teacherFilters.status} onValueChange={(value) => setTeacherFilters(prev => ({ ...prev, status: value }))}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1d32] border-white/10">
              <SelectItem value="all_status" className="text-white hover:bg-white/10">All Status</SelectItem>
              <SelectItem value="active" className="text-white hover:bg-white/10">Active</SelectItem>
              <SelectItem value="inactive" className="text-white hover:bg-white/10">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Data Table */}
      <Card className="border-0 bg-white/5 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0f1d32] border-b border-white/10 hover:bg-[#0f1d32]">
                <TableHead className="text-white font-semibold">Name</TableHead>
                <TableHead className="text-white font-semibold">Email</TableHead>
                <TableHead className="text-white font-semibold">Phone</TableHead>
                <TableHead className="text-white font-semibold">Qualification</TableHead>
                <TableHead className="text-white font-semibold">Specialization</TableHead>
                <TableHead className="text-white font-semibold">Experience</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterTeachers(teachers).map((teacher) => (
                <TableRow key={teacher.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">
                    {teacher.firstName} {teacher.lastName}
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-blue-200/70">{teacher.email}</TableCell>
                  <TableCell className="text-blue-200/70">{teacher.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate text-blue-200/70">{teacher.qualification || 'N/A'}</TableCell>
                  <TableCell className="text-blue-200/70">{teacher.specialization || 'N/A'}</TableCell>
                  <TableCell className="text-blue-200/70">{teacher.experience || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={teacher.active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : "bg-red-500/20 text-red-300 border-red-400/30"
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
                          className="bg-transparent border-white/10 text-blue-200/70 hover:bg-white/10 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { if (window.confirm('Are you sure you want to delete this teacher?')) onDelete(teacher.id) }}
                          className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/20"
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
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <UserCheck className="h-12 w-12 text-blue-200/40 mx-auto mb-4" />
            <p className="text-white">No teachers added yet.</p>
            <p className="text-sm text-blue-200/60 mt-1">Add your first teacher to get started.</p>
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
