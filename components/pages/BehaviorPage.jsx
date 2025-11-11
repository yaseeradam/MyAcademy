'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, ThumbsUp, ThumbsDown, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function BehaviorPage({ behaviors, students, classes, showModal, setShowModal, form, setForm, handleSubmit, onBack }) {
  const positiveCount = behaviors.filter(b => b.type === 'Positive').length
  const negativeCount = behaviors.filter(b => b.type === 'Negative').length

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Student Behavior Tracking</h2>
        </div>
        <Button onClick={() => { setForm({ studentId: '', type: '', category: '', description: '', date: '', actionTaken: '' }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Record Behavior
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <ThumbsUp className="h-5 w-5" />
              Positive Behaviors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{positiveCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <ThumbsDown className="h-5 w-5" />
              Negative Behaviors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">{negativeCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Requires Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-900">
              {students.filter(s => behaviors.filter(b => b.studentId === s.id && b.type === 'Negative').length >= 3).length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Behavior Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {behaviors.map(behavior => {
              const student = students.find(s => s.id === behavior.studentId)
              const cls = classes.find(c => c.id === student?.classId)
              return (
                <div key={behavior._id} className={`p-4 rounded-lg border-l-4 ${
                  behavior.type === 'Positive' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {behavior.type === 'Positive' ? (
                          <ThumbsUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <ThumbsDown className="h-5 w-5 text-red-600" />
                        )}
                        <div>
                          <div className="font-semibold">{student ? `${student.firstName} ${student.lastName}` : 'Unknown Student'}</div>
                          <div className="text-sm text-gray-600">{cls?.name} • {new Date(behavior.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="ml-8">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            behavior.type === 'Positive' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {behavior.category}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{behavior.description}</p>
                        {behavior.actionTaken && (
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Action Taken:</span> {behavior.actionTaken}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Behavior</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({...form, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Positive">Positive</SelectItem>
                  <SelectItem value="Negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {form.type === 'Positive' ? (
                    <>
                      <SelectItem value="Excellent Work">Excellent Work</SelectItem>
                      <SelectItem value="Helpful">Helpful</SelectItem>
                      <SelectItem value="Leadership">Leadership</SelectItem>
                      <SelectItem value="Participation">Participation</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="Late Arrival">Late Arrival</SelectItem>
                      <SelectItem value="Disruptive">Disruptive</SelectItem>
                      <SelectItem value="Incomplete Work">Incomplete Work</SelectItem>
                      <SelectItem value="Misconduct">Misconduct</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} required />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
            </div>
            {form.type === 'Negative' && (
              <div>
                <Label>Action Taken</Label>
                <Textarea value={form.actionTaken} onChange={(e) => setForm({...form, actionTaken: e.target.value})} rows={2} />
              </div>
            )}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Record Behavior</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
