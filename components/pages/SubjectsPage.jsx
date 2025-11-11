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

export default function SubjectsPage({ 
  subjects,
  showSubjectModal,
  setShowSubjectModal,
  subjectForm,
  setSubjectForm,
  handleCreateSubject,
  readOnly = false
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{readOnly ? 'My Subjects' : 'Subjects Management'}</h2>
        {!readOnly && <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Subject</DialogTitle>
              <DialogDescription>
                Add a new subject to the curriculum.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSubject}>
              <div className="grid gap-4 py-4">
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Subject Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="subjectName">Subject Name</Label>
                      <Input
                        id="subjectName"
                        value={subjectForm.name}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g., Mathematics, English Language"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subjectCode">Subject Code</Label>
                      <Input
                        id="subjectCode"
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="e.g., MATH101, ENG201"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectDescription">Description</Label>
                    <Textarea
                      id="subjectDescription"
                      value={subjectForm.description}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Brief description of the subject"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subjectCredits">Credits</Label>
                    <Input
                      id="subjectCredits"
                      type="number"
                      value={subjectForm.credits}
                      onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: e.target.value }))}
                      placeholder="Number of credits"
                      min="1"
                      step="0.5"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create Subject</Button>
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
                <TableHead>Subject Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell className="font-mono text-sm">{subject.code}</TableCell>
                  <TableCell className="max-w-xs truncate">{subject.description || 'No description'}</TableCell>
                  <TableCell>{subject.credits || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={subject.active ? "default" : "secondary"}>
                      {subject.active ? 'Active' : 'Inactive'}
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
