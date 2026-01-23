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
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Eye, Edit, Trash2, School, ArrowRight, GraduationCap } from 'lucide-react'

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
  // Sort classes by grade level for the dropdown
  const sortedClasses = [...classes].sort((a, b) => (a.gradeLevel || 0) - (b.gradeLevel || 0))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{readOnly ? 'My Classes' : 'Classes Management'}</h2>
          <p className="text-slate-500 text-sm mt-1">Manage classes and student capacity</p>
        </div>
        {!readOnly && (
          <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
              <DialogHeader>
                <DialogTitle className="text-slate-900">{classForm.id ? 'Edit Class' : 'Create New Class'}</DialogTitle>
                <DialogDescription className="text-slate-500">
                  Set up a new class with capacity and academic year information.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateClass}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-slate-800">Class Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="className" className="text-slate-600">Class Name</Label>
                        <Input
                          id="className"
                          value={classForm.name}
                          onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Grade 1A, JSS 2, Year 10"
                          required
                          className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="gradeLevel" className="text-slate-600">Grade Level (for ordering)</Label>
                        <Input
                          id="gradeLevel"
                          type="number"
                          value={classForm.gradeLevel || ''}
                          onChange={(e) => setClassForm(prev => ({ ...prev, gradeLevel: parseInt(e.target.value) || 0 }))}
                          placeholder="e.g., 1, 2, 3..."
                          min="1"
                          className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="classDescription" className="text-slate-600">Description</Label>
                      <Textarea
                        id="classDescription"
                        value={classForm.description}
                        onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the class"
                        rows={2}
                        className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="classCapacity" className="text-slate-600">Capacity</Label>
                        <Input
                          id="classCapacity"
                          type="number"
                          value={classForm.capacity}
                          onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                          placeholder="Maximum number of students"
                          min="1"
                          required
                          className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="academicYear" className="text-slate-600">Academic Year</Label>
                        <Input
                          id="academicYear"
                          value={classForm.academicYear}
                          onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                          placeholder="e.g., 2024/2025"
                          required
                          className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                        />
                      </div>
                    </div>

                    {/* Promotion Settings */}
                    <div className="border-t border-slate-200 pt-4 mt-2">
                      <h3 className="font-medium text-slate-800 mb-3 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4 text-amber-500" />
                        Promotion Settings
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nextClassId" className="text-slate-600">Promotes To (Next Class)</Label>
                          <Select
                            value={classForm.nextClassId || 'none'}
                            onValueChange={(value) => setClassForm(prev => ({
                              ...prev,
                              nextClassId: value === 'none' ? null : value,
                              isFinalClass: value === 'none' ? prev.isFinalClass : false
                            }))}
                          >
                            <SelectTrigger className="bg-white border-slate-200">
                              <SelectValue placeholder="Select next class" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No next class</SelectItem>
                              {sortedClasses
                                .filter(c => c.id !== classForm.id)
                                .map(c => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.name} {c.gradeLevel ? `(Level ${c.gradeLevel})` : ''}
                                  </SelectItem>
                                ))
                              }
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-slate-600">Final Class (Graduation)</Label>
                          <div className="flex items-center space-x-2 pt-2">
                            <Switch
                              id="isFinalClass"
                              checked={classForm.isFinalClass || false}
                              onCheckedChange={(checked) => setClassForm(prev => ({
                                ...prev,
                                isFinalClass: checked,
                                nextClassId: checked ? null : prev.nextClassId
                              }))}
                            />
                            <Label htmlFor="isFinalClass" className="text-sm text-slate-600 cursor-pointer">
                              Students graduate from here
                            </Label>
                          </div>
                        </div>
                      </div>

                      {classForm.isFinalClass && (
                        <div className="mt-3 p-3 bg-violet-50 rounded-lg border border-violet-200">
                          <div className="flex items-center gap-2 text-violet-700 text-sm">
                            <GraduationCap className="h-4 w-4" />
                            <span>Students will be marked as "Graduated" during promotion</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowClassModal(false)} className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100">
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
      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl overflow-hidden">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80 border-b border-slate-200/80 hover:bg-slate-50/80">
                <TableHead className="text-slate-700 font-semibold">Class Name</TableHead>
                <TableHead className="text-slate-700 font-semibold">Description</TableHead>
                <TableHead className="text-slate-700 font-semibold">Capacity</TableHead>
                <TableHead className="text-slate-700 font-semibold">Academic Year</TableHead>
                <TableHead className="text-slate-700 font-semibold">Students</TableHead>
                <TableHead className="text-slate-700 font-semibold">Status</TableHead>
                <TableHead className="text-slate-700 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => {
                const enrolledStudents = students.filter(student => student.classId === cls.id).length
                const isFull = enrolledStudents >= parseInt(cls.capacity)

                return (
                  <TableRow key={cls.id} className="border-slate-200/80 hover:bg-slate-50">
                    <TableCell className="font-medium text-slate-900">{cls.name}</TableCell>
                    <TableCell className="max-w-xs truncate text-slate-600">{cls.description || 'No description'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="text-slate-700">{enrolledStudents}/{cls.capacity}</span>
                        {isFull && (
                          <Badge className="text-xs bg-rose-100 text-rose-700 border-rose-200">Full</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">{cls.academicYear}</TableCell>
                    <TableCell>
                      <Badge className="bg-sky-100 text-sky-700 border-sky-200">
                        {enrolledStudents} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cls.active
                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                        : "bg-rose-100 text-rose-700 border-rose-200"
                      }>
                        {cls.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
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
                            className="bg-white/80 border-slate-200 text-slate-600 hover:bg-slate-100"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => { if (window.confirm('Are you sure you want to delete this class?')) handleDeleteClass(cls.id) }}
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
      {(!classes || classes.length === 0) && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <School className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700">No classes created yet.</p>
            <p className="text-sm text-slate-500 mt-1">Add your first class to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
