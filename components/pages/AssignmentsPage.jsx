'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, Edit, GraduationCap, Trash2 } from 'lucide-react'

export default function AssignmentsPage({
  assignments,
  teachers,
  classes,
  subjects,
  showAssignmentModal,
  setShowAssignmentModal,
  assignmentForm,
  setAssignmentForm,
  handleCreateAssignment,
  handleDeleteAssignment
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Teacher Assignments</h2>
        <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
          <DialogTrigger asChild>
            <Button className="bg-sky-500 hover:bg-sky-600 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Assign Teacher
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
            <DialogHeader>
              <DialogTitle className="text-slate-900">{assignmentForm.id ? 'Edit Assignment' : 'Assign Teacher to Subject'}</DialogTitle>
              <DialogDescription className="text-slate-500">
                Assign a teacher to teach a specific subject for a class.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateAssignment}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Teacher</Label>
                  <Select
                    value={assignmentForm.teacherId}
                    onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, teacherId: value }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {teachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName} - {teacher.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={assignmentForm.classId}
                    onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, classId: value }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={assignmentForm.subjectId}
                    onValueChange={(value) => setAssignmentForm(prev => ({ ...prev, subjectId: value }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-slate-200 text-slate-800">
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">
                  {assignmentForm.id ? 'Update Assignment' : 'Assign Teacher'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="text-slate-600">Teacher</TableHead>
                <TableHead className="text-slate-600">Subject</TableHead>
                <TableHead className="text-slate-600">Class</TableHead>
                <TableHead className="text-slate-600">Assigned Date</TableHead>
                <TableHead className="text-slate-600">Status</TableHead>
                <TableHead className="text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assignments.map((assignment) => {
                const teacher = teachers.find(t => t.id === assignment.teacherId)
                return (
                  <TableRow key={assignment.id} className="border-t border-slate-200/70">
                    <TableCell>
                      <span className="text-slate-800">{teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown Teacher'}</span>
                    </TableCell>
                    <TableCell className="text-slate-700">{assignment.subjectName}</TableCell>
                    <TableCell className="text-slate-700">{assignment.className}</TableCell>
                    <TableCell className="text-slate-600">
                      {new Date(assignment.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge className={assignment.active ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600 border border-slate-200'}>
                        {assignment.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-200 text-slate-600 hover:bg-slate-100"
                          onClick={() => {
                            setAssignmentForm({
                              id: assignment.id,
                              teacherId: assignment.teacherId,
                              classId: assignment.classId,
                              subjectId: assignment.subjectId,
                              subjectName: assignment.subjectName,
                              className: assignment.className
                            })
                            setShowAssignmentModal(true)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this assignment?')) {
                              handleDeleteAssignment(assignment.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {assignments.length === 0 && (
        <Card className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <GraduationCap className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No teacher assignments yet.</p>
            <p className="text-sm text-slate-500 mt-1">Assign teachers to subjects and classes to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
