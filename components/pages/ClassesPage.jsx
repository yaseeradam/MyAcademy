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
import { Plus, Eye, Edit } from 'lucide-react'

export default function ClassesPage({ 
  classes, 
  students,
  showClassModal,
  setShowClassModal,
  classForm,
  setClassForm,
  handleCreateClass,
  readOnly = false
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{readOnly ? 'My Classes' : 'Classes Management'}</h2>
        {!readOnly && <Dialog open={showClassModal} onOpenChange={setShowClassModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Class
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Class</DialogTitle>
              <DialogDescription>
                Set up a new class with capacity and academic year information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClass}>
              <div className="grid gap-4 py-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Class Information</h3>

                  <div className="space-y-2">
                    <Label htmlFor="className">Class Name</Label>
                    <Input
                      id="className"
                      value={classForm.name}
                      onChange={(e) => setClassForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Grade 1A, JSS 2, Year 10"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="classDescription">Description</Label>
                    <Textarea
                      id="classDescription"
                      value={classForm.description}
                      onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the class"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="classCapacity">Capacity</Label>
                      <Input
                        id="classCapacity"
                        type="number"
                        value={classForm.capacity}
                        onChange={(e) => setClassForm(prev => ({ ...prev, capacity: e.target.value }))}
                        placeholder="Maximum number of students"
                        min="1"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Input
                        id="academicYear"
                        value={classForm.academicYear}
                        onChange={(e) => setClassForm(prev => ({ ...prev, academicYear: e.target.value }))}
                        placeholder="e.g., 2024"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Class</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => {
                const enrolledStudents = students.filter(student => student.classId === cls.id).length
                const isFull = enrolledStudents >= parseInt(cls.capacity)

                return (
                  <TableRow key={cls.id}>
                    <TableCell className="font-medium">{cls.name}</TableCell>
                    <TableCell className="max-w-xs truncate">{cls.description || 'No description'}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span>{enrolledStudents}/{cls.capacity}</span>
                        {isFull && (
                          <Badge variant="destructive" className="text-xs">Full</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{cls.academicYear}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {enrolledStudents} students
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={cls.active ? "default" : "secondary"}>
                        {cls.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!readOnly && <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
