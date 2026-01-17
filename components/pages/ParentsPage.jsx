'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
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

      {/* Grid Cards */}
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {filterParents(parents, students).map((parent) => {
          const childCount = students.filter(s => s.parentId === parent.id).length
          const initials = `${parent.name?.split(' ')[0]?.[0] || ''}${parent.name?.split(' ')[1]?.[0] || ''}`.toUpperCase()
          const avatarUrl = parent.profilePicture || parent.avatar || parent.photo
          return (
            <Card key={parent.id} className="border border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-4">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={`${parent.name || ''}`.trim() || 'Parent avatar'}
                      className="h-12 w-12 rounded-2xl object-cover border border-slate-200/80 shadow-sm"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-violet-100 to-sky-100 text-slate-700 font-semibold flex items-center justify-center shadow-sm">
                      {initials || 'PR'}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-lg font-semibold text-slate-900 truncate">{parent.name}</p>
                        <p className="text-sm text-slate-600 truncate">{parent.email}</p>
                      </div>
                      <Badge className={parent.active
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-rose-100 text-rose-700 border-rose-200"
                      }>
                        {parent.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 truncate mt-2">
                      Primary contact: {parent.phoneNumber || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Phone</span>
                    <span className="text-slate-700">{parent.phoneNumber || 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-slate-500">Address</span>
                    <span className="text-slate-700 truncate">{parent.address || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-200/80">
                  <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                    {childCount} {childCount === 1 ? 'child' : 'children'}
                  </Badge>
                  <Badge className="bg-sky-100 text-sky-700 border-sky-200">
                    {parent.address || 'No address'}
                  </Badge>
                  {!readOnly && (
                    <div className="ml-auto flex items-center gap-2">
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
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

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
