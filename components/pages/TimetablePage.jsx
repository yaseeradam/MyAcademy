'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Clock, Edit, Trash2, ArrowLeft, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function TimetablePage({ timetables, classes, subjects, teachers, showModal, setShowModal, form, setForm, handleSubmit, handleDelete, onBack, school, schoolSettings }) {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const periods = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th']

  const getTimetableForClass = (classId) => {
    return timetables.filter(t => t.classId === classId)
  }

  const downloadTimetablePDF = (cls) => {
    const doc = new jsPDF('l', 'mm', 'a4')
    const pageWidth = doc.internal.pageSize.getWidth()
    
    doc.setFontSize(20)
    doc.setTextColor(37, 99, 235)
    const schoolName = school?.name || schoolSettings?.schoolName || 'School Name'
    doc.text(schoolName, pageWidth / 2, 20, { align: 'center' })
    
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text(`Class Timetable - ${cls.name}`, pageWidth / 2, 30, { align: 'center' })
    
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Academic Year: ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, pageWidth / 2, 37, { align: 'center' })
    
    const classTimetable = getTimetableForClass(cls.id || cls._id)
    const tableData = periods.map(period => {
      const row = [period]
      days.forEach(day => {
        const entry = classTimetable.find(t => t.day === day && t.period === period)
        if (entry) {
          const subject = subjects.find(s => s.id === entry.subjectId || s._id === entry.subjectId)
          const teacher = teachers.find(t => t.id === entry.teacherId || t._id === entry.teacherId)
          row.push(`${subject?.name || 'N/A'}\n${teacher?.firstName || teacher?.name || 'N/A'} ${teacher?.lastName || ''}\n${entry.startTime}-${entry.endTime}`)
        } else {
          row.push('-')
        }
      })
      return row
    })
    
    autoTable(doc, {
      startY: 45,
      head: [['Period', ...days]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235], fontSize: 10, fontStyle: 'bold' },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 0: { cellWidth: 20, fontStyle: 'bold', fillColor: [243, 244, 246] } },
      margin: { left: 10, right: 10 }
    })
    
    const finalY = doc.previousAutoTable?.finalY || 45
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 10, finalY + 10)
    doc.text(`Total Periods: ${classTimetable.length}`, pageWidth - 10, finalY + 10, { align: 'right' })
    
    doc.save(`Timetable-${cls.name}-${new Date().getFullYear()}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Timetable Management</h2>
        </div>
        <Button onClick={() => { setForm({ classId: '', day: '', period: '', subjectId: '', teacherId: '', startTime: '', endTime: '' }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Period
        </Button>
      </div>

      {classes.map(cls => (
        <Card key={cls.id || cls._id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {cls.name} - Timetable
              </div>
              <Button size="sm" variant="outline" onClick={() => downloadTimetablePDF(cls)}>
                <Download className="h-4 w-4 mr-2" /> Download PDF
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left font-semibold">Period</th>
                    {days.map(day => <th key={day} className="border p-2 text-center font-semibold">{day}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {periods.map(period => (
                    <tr key={period}>
                      <td className="border p-2 font-medium bg-gray-50">{period}</td>
                      {days.map(day => {
                        const entry = getTimetableForClass(cls.id || cls._id).find(t => t.day === day && t.period === period)
                        const subject = subjects.find(s => s.id === entry?.subjectId)
                        const teacher = teachers.find(t => t.id === entry?.teacherId)
                        return (
                          <td key={day} className="border p-2 text-center">
                            {entry ? (
                              <div className="space-y-1">
                                <div className="font-semibold text-blue-600">{subject?.name}</div>
                                <div className="text-xs text-gray-600">{teacher?.firstName} {teacher?.lastName}</div>
                                <div className="text-xs text-gray-500">{entry.startTime} - {entry.endTime}</div>
                                <div className="flex gap-1 justify-center mt-1">
                                  <Button size="sm" variant="ghost" onClick={() => { setForm(entry); setShowModal(true) }}><Edit className="h-3 w-3" /></Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDelete(entry.id || entry._id)}><Trash2 className="h-3 w-3 text-red-600" /></Button>
                                </div>
                              </div>
                            ) : <span className="text-gray-400">-</span>}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{form.id || form._id ? 'Edit' : 'Add'} Period</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Class</Label>
              <Select value={form.classId} onValueChange={(v) => setForm({...form, classId: v})}>
                <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Day</Label>
              <Select value={form.day} onValueChange={(v) => setForm({...form, day: v})}>
                <SelectTrigger><SelectValue placeholder="Select day" /></SelectTrigger>
                <SelectContent>{days.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Period</Label>
              <Select value={form.period} onValueChange={(v) => setForm({...form, period: v})}>
                <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                <SelectContent>{periods.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Subject</Label>
              <Select value={form.subjectId} onValueChange={(v) => setForm({...form, subjectId: v})}>
                <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                <SelectContent>{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Teacher</Label>
              <Select value={form.teacherId} onValueChange={(v) => setForm({...form, teacherId: v})}>
                <SelectTrigger><SelectValue placeholder="Select teacher" /></SelectTrigger>
                <SelectContent>{teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Time</Label>
                <Input type="time" value={form.startTime} onChange={(e) => setForm({...form, startTime: e.target.value})} required />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="time" value={form.endTime} onChange={(e) => setForm({...form, endTime: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">{form.id || form._id ? 'Update' : 'Create'} Period</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
