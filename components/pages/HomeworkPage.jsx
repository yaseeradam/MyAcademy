'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, BookOpen, Upload, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react'

export default function HomeworkPage({ homework, classes, subjects, students, userRole, showModal, setShowModal, form, setForm, handleSubmit, handleGrade, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Homework Management</h2>
        </div>
        {userRole === 'school_admin' && (
          <Button onClick={() => { setForm({ classId: '', subjectId: '', title: '', description: '', dueDate: '', attachments: [] }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" /> Assign Homework
          </Button>
        )}
      </div>

      <div className="grid gap-4">
        {homework.map(hw => {
          const cls = classes.find(c => c._id === hw.classId)
          const subject = subjects.find(s => s._id === hw.subjectId)
          const submissions = hw.submissions || []
          const totalStudents = students.filter(s => s.classId === hw.classId).length
          const submittedCount = submissions.length
          return (
            <Card key={hw._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    {hw.title}
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-600">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                    <span className={`px-3 py-1 rounded ${new Date(hw.dueDate) > new Date() ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {new Date(hw.dueDate) > new Date() ? 'Active' : 'Overdue'}
                    </span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><span className="text-gray-600">Class:</span> <span className="font-semibold">{cls?.name}</span></div>
                    <div><span className="text-gray-600">Subject:</span> <span className="font-semibold">{subject?.name}</span></div>
                    <div><span className="text-gray-600">Submissions:</span> <span className="font-semibold">{submittedCount}/{totalStudents}</span></div>
                    <div><span className="text-gray-600">Completion:</span> <span className="font-semibold">{totalStudents > 0 ? Math.round((submittedCount/totalStudents)*100) : 0}%</span></div>
                  </div>
                  <div>
                    <p className="text-gray-700">{hw.description}</p>
                  </div>
                  {submissions.length > 0 && (
                    <div className="border-t pt-4">
                      <h4 className="font-semibold mb-2">Submissions</h4>
                      <div className="space-y-2">
                        {submissions.map((sub, i) => {
                          const student = students.find(s => s._id === sub.studentId)
                          return (
                            <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                              <div className="flex items-center gap-3">
                                {sub.graded ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-yellow-600" />}
                                <div>
                                  <div className="font-medium">{student?.name}</div>
                                  <div className="text-sm text-gray-600">Submitted: {new Date(sub.submittedAt).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {sub.graded && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">{sub.marks}/{hw.totalMarks}</span>}
                                {!sub.graded && userRole === 'school_admin' && (
                                  <Button size="sm" onClick={() => handleGrade(hw._id, sub.studentId)}>Grade</Button>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({...form, classId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({...form, subjectId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} required />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input type="number" value={form.totalMarks} onChange={(e) => setForm({...form, totalMarks: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Assign Homework</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
