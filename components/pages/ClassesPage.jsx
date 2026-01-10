'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Edit, Trash2, School } from 'lucide-react'

export default function ClassesPage({
  classes,
  students,
  showClassModal,
  setShowClassModal,
  classForm,
  setClassForm,
  handleCreateClass,
  handleDeleteClass,
  readOnly = false
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{readOnly ? 'My Classes' : 'Classes Management'}</h2>
          <p className="text-blue-200/60 text-sm mt-1">Manage classes and student capacity</p>
        </div>
        {!readOnly && (
          <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[#0f1d32] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{classForm.id ? 'Edit Class' : 'Create New Class'}</DialogTitle>
                <DialogDescription className="text-blue-200/60">
                  Set up a new class with capacity and academic year information.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Class Information</h3>

                    <div className="space-y-2">
                      <Label htmlFor="className" className="text-blue-200/80">Class Name</Label>
                      <Input
                        id="className"
                        value={classForm.name}
                        onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Grade 1A, JSS 2, Year 10"
                        required
                        className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classDescription" className="text-blue-200/80">Description</Label>
                      <Textarea
                        id="classDescription"
                        value={classForm.description}
                        onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the class"
                        rows={2}
                        className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="classCapacity" className="text-blue-200/80">Capacity</Label>
                        <Input
                          id="classCapacity"
                          type="number"
                          value={classForm.capacity}
                          onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Maximum number of students"
                          min="1"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="academicYear" className="text-blue-200/80">Academic Year</Label>
                        <Input
                          id="academicYear"
                          value={classForm.academicYear}
                          onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                          placeholder="e.g., 2024"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowClassModal(false)} className="bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    {classForm.id ? 'Update Class' : 'Create Class'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Data Table */}
      <Card className="border-0 bg-white/5 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0f1d32] border-b border-white/10 hover:bg-[#0f1d32]">
                <TableHead className="text-white font-semibold">Class Name</TableHead>
                <TableHead className="text-white font-semibold">Description</TableHead>
                <TableHead className="text-white font-semibold">Capacity</TableHead>
                <TableHead className="text-white font-semibold">Academic Year</TableHead>
                <TableHead className="text-white font-semibold">Students</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => {
                const enrolledStudents = students.filter(student => student.classId === cls.id).length
                const isFull = enrolledStudents >= parseInt(cls.capacity)

                return (
                  <TableRow key={cls.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium text-white">{cls.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-blue-200/70">{cls.description || 'No description'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{enrolledStudents}/{cls.capacity}</span>
                        {isFull && (
                          <Badge className="text-xs bg-red-500/20 text-red-300 border-red-400/30">Full</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-blue-200/70">{cls.academicYear}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                        {enrolledStudents} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cls.active
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                        : "bg-red-500/20 text-red-300 border-red-400/30"
                      }>
                        {cls.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-transparent border-white/10 text-blue-200/70 hover:bg-white/10 hover:text-white"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!readOnly && <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setClassForm(cls)
                              setShowClassModal(true)
                            }}
                            className="bg-transparent border-white/10 text-blue-200/70 hover:bg-white/10 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { if (window.confirm('Are you sure you want to delete this class?')) handleDeleteClass(cls.id) }}
                            className="bg-transparent border-red-500/30 text-red-400 hover:bg-red-500/20"
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
      {(!classes || classes.length === 0) && (
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <School className="h-12 w-12 text-blue-200/40 mx-auto mb-4" />
            <p className="text-white">No classes created yet.</p>
            <p className="text-sm text-blue-200/60 mt-1">Add your first class to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
