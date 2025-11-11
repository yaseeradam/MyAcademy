'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, UserPlus, Edit, Users2, UserX } from 'lucide-react'
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{readOnly ? 'Parents' : 'Parents Management'}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => exportParentsToCSV(parents, students, school?.name)}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          {!readOnly && <Button onClick={() => setShowFormView('parent')}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Parent
          </Button>}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search parents by name, email, phone..."
            value={parentSearch}
            onChange={(e) => setParentSearch(e.target.value)}
            className="pl-10 pr-4 py-2 w-full"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <Select value={parentFilters.childrenCount} onValueChange={(value) => setParentFilters(prev => ({ ...prev, childrenCount: value }))}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by children count" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all_parents">All Parents</SelectItem>
              <SelectItem value="1">1 Child</SelectItem>
              <SelectItem value="2+">2+ Children</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={parentFilters.status} onValueChange={(value) => setParentFilters(prev => ({ ...prev, status: value }))}>
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
                <TableHead>Address</TableHead>
                <TableHead>Children</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filterParents(parents, students).map((parent) => (
                <TableRow key={parent.id}>
                  <TableCell className="font-medium">{parent.name}</TableCell>
                  <TableCell className="max-w-xs truncate">{parent.email}</TableCell>
                  <TableCell>{parent.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="max-w-xs truncate">{parent.address || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {students.filter(s => s.parentId === parent.id).length} children
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={parent.active ? "default" : "secondary"}>
                      {parent.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      {!readOnly && <>
                        <Button size="sm" variant="outline" onClick={() => handleEdit(parent)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant={parent.active ? "destructive" : "default"}
                          onClick={() => handleDeactivate(parent)}
                        >
                          <UserX className="h-4 w-4" />
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

      {parents.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Users2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No parents registered yet.</p>
            <p className="text-sm text-gray-500 mt-1">Add your first parent to get started.</p>
          </CardContent>
        </Card>
      )}

    </div>
  )
}
