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
          <h2 className="text-2xl font-bold text-white">{readOnly ? 'Parents' : 'Parents Management'}</h2>
          <p className="text-blue-200/60 text-sm mt-1">Manage parent accounts and contact information</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportParentsToCSV(parents, students, school?.name)}
            className="bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white"
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
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200/40" />
          <Input
            type="text"
            placeholder="Search parents by name, email, phone..."
            value={parentSearch}
            onChange={(e) => setParentSearch(e.target.value)}
            className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 focus:border-amber-500/50"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={parentFilters.childrenCount} onValueChange={(value) => setParentFilters(prev => ({ ...prev, childrenCount: value }))}>
            <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Filter by children count" />
            </SelectTrigger>
            <SelectContent className="bg-[#0f1d32] border-white/10">
              <SelectItem value="all_parents" className="text-white hover:bg-white/10">All Parents</SelectItem>
              <SelectItem value="1" className="text-white hover:bg-white/10">1 Child</SelectItem>
              <SelectItem value="2+" className="text-white hover:bg-white/10">2+ Children</SelectItem>
            </SelectContent>
          </Select>

          <Select value={parentFilters.status} onValueChange={(value) => setParentFilters(prev => ({ ...prev, status: value }))}>
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
                <TableHead className="text-white font-semibold">Address</TableHead>
                <TableHead className="text-white font-semibold">Children</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterParents(parents, students).map((parent) => (
                <TableRow key={parent.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{parent.name}</TableCell>
                  <TableCell className="max-w-xs truncate text-blue-200/70">{parent.email}</TableCell>
                  <TableCell className="text-blue-200/70">{parent.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate text-blue-200/70">{parent.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                      {students.filter(s => s.parentId === parent.id).length} children
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={parent.active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : "bg-red-500/20 text-red-300 border-red-400/30"
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
                          className="bg-transparent border-white/10 text-blue-200/70 hover:bg-white/10 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { if (confirm('Are you sure?')) onDelete(parent.id) }}
                          className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/20"
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
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <Users2 className="h-12 w-12 text-blue-200/40 mx-auto mb-4" />
            <p className="text-white">No parents registered yet.</p>
            <p className="text-sm text-blue-200/60 mt-1">Add your first parent to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
