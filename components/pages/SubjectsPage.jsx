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
import { Plus, Eye, Edit, Trash2, BookOpen } from 'lucide-react'

export default function SubjectsPage({
  subjects,
  showSubjectModal,
  setShowSubjectModal,
  subjectForm,
  setSubjectForm,
  handleCreateSubject,
  handleDeleteSubject,
  readOnly = false
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">{readOnly ? 'My Subjects' : 'Subjects Management'}</h2>
          <p className="text-blue-200/60 text-sm mt-1">Manage curriculum subjects and credits</p>
        </div>
        {!readOnly && (
          <Dialog open={showSubjectModal} onOpenChange={setShowSubjectModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-[#0f1d32] border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{subjectForm.id ? 'Edit Subject' : 'Create New Subject'}</DialogTitle>
                <DialogDescription className="text-blue-200/60">
                  Add a new subject to the curriculum.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateSubject}>
                <div className="grid gap-4 py-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-white">Subject Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="subjectName" className="text-blue-200/80">Subject Name</Label>
                        <Input
                          id="subjectName"
                          value={subjectForm.name}
                          onChange={(e) => setSubjectForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Mathematics, English Language"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subjectCode" className="text-blue-200/80">Subject Code</Label>
                        <Input
                          id="subjectCode"
                          value={subjectForm.code}
                          onChange={(e) => setSubjectForm(prev => ({ ...prev, code: e.target.value }))}
                          placeholder="e.g., MATH101, ENG201"
                          required
                          className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subjectDescription" className="text-blue-200/80">Description</Label>
                      <Textarea
                        id="subjectDescription"
                        value={subjectForm.description}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description of the subject"
                        rows={2}
                        className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subjectCredits" className="text-blue-200/80">Credits</Label>
                      <Input
                        id="subjectCredits"
                        type="number"
                        value={subjectForm.credits}
                        onChange={(e) => setSubjectForm(prev => ({ ...prev, credits: e.target.value }))}
                        placeholder="Number of credits"
                        min="1"
                        step="0.5"
                        className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowSubjectModal(false)} className="bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                    {subjectForm.id ? 'Update Subject' : 'Create Subject'}
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
                <TableHead className="text-white font-semibold">Subject Name</TableHead>
                <TableHead className="text-white font-semibold">Code</TableHead>
                <TableHead className="text-white font-semibold">Description</TableHead>
                <TableHead className="text-white font-semibold">Credits</TableHead>
                <TableHead className="text-white font-semibold">Status</TableHead>
                <TableHead className="text-white font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subjects.map((subject) => (
                <TableRow key={subject.id} className="border-white/5 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{subject.name}</TableCell>
                  <TableCell className="font-mono text-sm text-blue-200/70">{subject.code}</TableCell>
                  <TableCell className="max-w-xs truncate text-blue-200/70">{subject.description || 'No description'}</TableCell>
                  <TableCell className="text-blue-200/70">{subject.credits || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge className={subject.active
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
                      : "bg-red-500/20 text-red-300 border-red-400/30"
                    }>
                      {subject.active ? 'Active' : 'Inactive'}
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
                            setSubjectForm(subject)
                            setShowSubjectModal(true)
                          }}
                          className="bg-transparent border-white/10 text-blue-200/70 hover:bg-white/10 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => { if (window.confirm('Are you sure you want to delete this subject?')) handleDeleteSubject(subject.id) }}
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
      {(!subjects || subjects.length === 0) && (
        <Card className="border-0 bg-white/5 backdrop-blur-xl">
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-blue-200/40 mx-auto mb-4" />
            <p className="text-white">No subjects added yet.</p>
            <p className="text-sm text-blue-200/60 mt-1">Add your first subject to get started.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
