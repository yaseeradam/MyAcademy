'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, UserPlus, Edit, UserCheck, UserX, Trash2 } from 'lucide-react'
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Teachers Management</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportTeachersToCSV(teachers, school?.name)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={() => setShowFormView('teacher')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Teacher
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search teachers by name, email, qualification..."
            value={teacherSearch}
            onChange={(e) => setTeacherSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Filter by specialization"
            value={teacherFilters.specialization}
            onChange={(e) => setTeacherFilters(prev => ({ ...prev, specialization: e.target.value }))}
            className="w-48"
          />

          <Select value={teacherFilters.status} onValueChange={(value) => setTeacherFilters(prev => ({ ...prev, status: value }))}>
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
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterTeachers(teachers).map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium">
                    {teacher.firstName} {teacher.lastName}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{teacher.email}</TableCell>
                  <TableCell>{teacher.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">{teacher.qualification || 'N/A'}</TableCell>
                  <TableCell>{teacher.specialization || 'N/A'}</TableCell>
                  <TableCell>{teacher.experience || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={teacher.active ? "default" : "secondary"}>
                      {teacher.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {!readOnly && (
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onEdit(teacher)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => { if (window.confirm('Are you sure you want to delete this teacher?')) onDelete(teacher.id) }}>
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

      {(!teachers || teachers.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No teachers added yet.</p>
            <p className="text-sm text-gray-500 mt-1">Add your first teacher to get started.</p>
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
