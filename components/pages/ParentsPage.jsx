'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, UserPlus, Edit, Users2, Trash2, Search } from 'lucide-react'
import { exportParentsToCSV } from '@/lib/csv-export'


export default function ParentsPage({
  parents,
  students,
  school,
  parentSearch,
  setParentSearch,
  parentFilters,
  setParentFilters,
  setShowFormView,
  filterParents,
  modal,
  toast,
  apiCall,
  loadDashboardData,
  onEdit,
  onDelete,
  readOnly = false
}) {
  const handleEdit = (parent) => {
    modal?.showSuccess('Coming Soon', 'Edit functionality coming soon!')
  }

  const handleDeactivate = async (parent) => {
    if (!confirm(`Are you sure you want to ${parent.active ? 'deactivate' : 'activate'} ${parent.name}?`)) {
      return
    }

    try {
      await apiCall(`parents?id=${parent.id}`, {
        method: 'DELETE'
      })
      toast.success(`✅ Parent ${parent.active ? 'deactivated' : 'activated'} successfully!`)
      loadDashboardData()
    } catch (error) {
      toast.error('❌ Failed to update parent status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{readOnly ? 'Parents' : 'Parents Management'}</h2>
          <p className="text-slate-500 text-sm mt-1">Manage parent accounts and contact information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportParentsToCSV(parents, students, school?.name)}
            className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {!readOnly && (
            <Button
              onClick={() => setShowFormView('parent')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add Parent
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
            placeholder="Search parents by name, email, phone..."
            value={parentSearch}
            onChange={(e) => setParentSearch(e.target.value)}
            className="pl-11 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-sky-300"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={parentFilters.childrenCount} onValueChange={(value) => setParentFilters(prev => ({ ...prev, childrenCount: value }))}>
            <SelectTrigger className="w-48 bg-white border-slate-200 text-slate-800">
              <SelectValue placeholder="Filter by children count" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200">
              <SelectItem value="all_parents" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">All Parents</SelectItem>
              <SelectItem value="1" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">1 Child</SelectItem>
              <SelectItem value="2+" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">2+ Children</SelectItem>
            </SelectContent>
          </Select>

          <Select value={parentFilters.status} onValueChange={(value) => setParentFilters(prev => ({ ...prev, status: value }))}>
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
                <TableHead className="text-slate-700 font-semibold">Address</TableHead>
                <TableHead className="text-slate-700 font-semibold">Children</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterParents(parents, students).map((parent) => (
                <TableRow key={parent.id} className="border-slate-200/80 hover:bg-slate-50">
                  <TableCell className="font-medium text-slate-900">{parent.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">{parent.email}</TableCell>
                  <TableCell className="text-slate-600">{parent.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate text-slate-600">{parent.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                      {students.filter(s => s.parentId === parent.id).length} children
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={parent.active
                      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                      : "bg-rose-100 text-rose-700 border-rose-200"
                    }>
                      {parent.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!readOnly && <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEdit(parent)}
                          className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { if (confirm('Are you sure?')) onDelete(parent.id) }}
                          className="bg-white/80 border-rose-200 text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {parents.length === 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <Users2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700">No parents registered yet.</p>
            <p className="text-sm text-slate-500 mt-1">Add your first parent to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
