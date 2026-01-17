'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, BookOpen, Upload, CheckCircle, Clock, XCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react'

export default function HomeworkPage({ homework, classes, subjects, students, userRole, showModal, setShowModal, form, setForm, handleSubmit, handleGrade, handleDelete, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-slate-900">Homework Management</h2>
        </div>
        {userRole === 'school_admin' && (
          <Button onClick={() => { setForm({ classId: '', subjectId: '', title: '', description: '', dueDate: '', attachments: [] }); setShowModal(true) }} className="bg-sky-500 hover:bg-sky-600 text-white">
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
            <Card key={hw._id} className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-sky-600" />
                    <span className="text-slate-900">{hw.title}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">Due: {new Date(hw.dueDate).toLocaleDateString()}</span>
                    <span className={`px-3 py-1 rounded ${new Date(hw.dueDate) > new Date() ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {new Date(hw.dueDate) > new Date() ? 'Active' : 'Overdue'}
                    </span>
                    {userRole === 'school_admin' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => { setForm(hw); setShowModal(true) }}>
                          <Edit className="h-4 w-4 text-sky-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => { if(confirm('Delete this homework?')) handleDelete(hw.id || hw._id) }}>
                          <Trash2 className="h-4 w-4 text-rose-600" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div><span className="text-slate-500">Class:</span> <span className="font-semibold text-slate-800">{cls?.name}</span></div>
                    <div><span className="text-slate-500">Subject:</span> <span className="font-semibold text-slate-800">{subject?.name}</span></div>
                    <div><span className="text-slate-500">Submissions:</span> <span className="font-semibold text-slate-800">{submittedCount}/{totalStudents}</span></div>
                    <div><span className="text-slate-500">Completion:</span> <span className="font-semibold text-slate-800">{totalStudents > 0 ? Math.round((submittedCount/totalStudents)*100) : 0}%</span></div>
                  </div>
                  <div>
                    <p className="text-slate-600">{hw.description}</p>
                  </div>
                  {submissions.length > 0 && (
                    <div className="border-t border-slate-200/70 pt-4">
                      <h4 className="font-semibold mb-2 text-slate-800">Submissions</h4>
                      <div className="space-y-2">
                        {submissions.map((sub, i) => {
                          const student = students.find(s => s._id === sub.studentId)
                          return (
                            <div key={i} className="flex items-center justify-between p-3 bg-white/80 border border-slate-200/70 rounded-xl">
                              <div className="flex items-center gap-3">
                                {sub.graded ? <CheckCircle className="h-5 w-5 text-emerald-600" /> : <Clock className="h-5 w-5 text-amber-600" />}
                                <div>
                                  <div className="font-medium text-slate-800">{student?.name}</div>
                                  <div className="text-sm text-slate-500">Submitted: {new Date(sub.submittedAt).toLocaleString()}</div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {sub.graded && <span className="px-2 py-1 bg-sky-100 text-sky-700 rounded">{sub.marks}/{hw.totalMarks}</span>}
                                {!sub.graded && userRole === 'school_admin' && (
                                  <Button size="sm" className="bg-sky-500 hover:bg-sky-600 text-white" onClick={() => handleGrade(hw._id, sub.studentId)}>Grade</Button>
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
        <DialogContent className="max-w-2xl bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
          <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input className="bg-white border-slate-200 text-slate-800" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({...form, classId: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">{classes.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({...form, subjectId: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">{subjects.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="bg-white border-slate-200 text-slate-800" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={4} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Due Date</Label>
                <Input className="bg-white border-slate-200 text-slate-800" type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} required />
              </div>
              <div>
                <Label>Total Marks</Label>
                <Input className="bg-white border-slate-200 text-slate-800" type="number" value={form.totalMarks} onChange={(e) => setForm({...form, totalMarks: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white">{form.id || form._id ? 'Update Homework' : 'Assign Homework'}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
