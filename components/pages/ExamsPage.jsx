'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, FileText, Edit, Trash2, Award, ArrowLeft, Download } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ExamsPage({ exams, classes, subjects, students, showModal, setShowModal, showGradeModal, setShowGradeModal, form, setForm, gradeForm, setGradeForm, handleSubmit, handleGradeSubmit, handleDelete, onBack, school, schoolSettings }) {
  
  const generateReportCards = (exam) => {
    const doc = new jsPDF()
    const cls = classes.find(c => c.id === exam.classId || c._id === exam.classId)
    const subject = subjects.find(s => s.id === exam.subjectId || s._id === exam.subjectId)
    const grades = exam.grades || []
    const schoolName = school?.name || schoolSettings?.schoolName || 'School Name'
    
    grades.forEach((grade, index) => {
      if (index > 0) doc.addPage()
      
      const student = students.find(s => s.id === grade.studentId || s._id === grade.studentId)
      const percentage = ((grade.marksObtained / exam.totalMarks) * 100).toFixed(2)
      const passed = grade.marksObtained >= exam.passingMarks
      
      // Header
      doc.setFontSize(18)
      doc.setTextColor(37, 99, 235)
      doc.text(schoolName, 105, 20, { align: 'center' })
      
      doc.setFontSize(14)
      doc.setTextColor(0, 0, 0)
      doc.text('EXAM REPORT CARD', 105, 30, { align: 'center' })
      
      doc.setFontSize(10)
      doc.setTextColor(100, 100, 100)
      doc.text(`Academic Year: ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, 105, 37, { align: 'center' })
      
      // Student Info
      doc.setFontSize(11)
      doc.setTextColor(0, 0, 0)
      doc.text('Student Information', 20, 50)
      
      autoTable(doc, {
        startY: 55,
        head: [['Field', 'Details']],
        body: [
          ['Student Name', `${student?.firstName || ''} ${student?.lastName || ''}`],
          ['Class', cls?.name || 'N/A'],
          ['Term', exam.term || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 20, right: 20 }
      })
      
      // Exam Details
      const examY = doc.previousAutoTable?.finalY + 10 || 100
      doc.text('Exam Details', 20, examY)
      
      autoTable(doc, {
        startY: examY + 5,
        head: [['Field', 'Details']],
        body: [
          ['Exam Title', exam.title],
          ['Subject', subject?.name || 'N/A'],
          ['Date', new Date(exam.date).toLocaleDateString()],
          ['Duration', `${exam.duration} minutes`]
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        margin: { left: 20, right: 20 }
      })
      
      // Results
      const resultY = doc.previousAutoTable?.finalY + 10 || 150
      doc.text('Results', 20, resultY)
      
      autoTable(doc, {
        startY: resultY + 5,
        head: [['Metric', 'Value']],
        body: [
          ['Marks Obtained', `${grade.marksObtained}/${exam.totalMarks}`],
          ['Percentage', `${percentage}%`],
          ['Grade', grade.grade],
          ['Status', passed ? 'PASSED' : 'FAILED'],
          ['Remarks', grade.remarks || 'N/A']
        ],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235] },
        bodyStyles: (data) => {
          if (data.row.index === 3) {
            return { fillColor: passed ? [220, 252, 231] : [254, 226, 226], textColor: passed ? [22, 101, 52] : [153, 27, 27] }
          }
        },
        margin: { left: 20, right: 20 }
      })
      
      // Footer
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 280, { align: 'center' })
    })
    
    doc.save(`${exam.title}-Report-Cards-${new Date().getFullYear()}.pdf`)
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-slate-900">Exams & Grading</h2>
        </div>
        <Button onClick={() => { setForm({ classId: '', subjectId: '', title: '', date: '', totalMarks: '', passingMarks: '', duration: '', term: '' }); setShowModal(true) }} className="bg-sky-500 hover:bg-sky-600 text-white">
          <Plus className="h-4 w-4 mr-2" /> Create Exam
        </Button>
      </div>

      <div className="grid gap-4">
        {exams.map(exam => {
          const cls = classes.find(c => c.id === exam.classId)
          const subject = subjects.find(s => s.id === exam.subjectId)
          const grades = exam.grades || []
          return (
            <Card key={exam.id || exam._id} className="border border-slate-200/80 bg-white/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-sky-600" />
                    {exam.title}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => { setGradeForm({ examId: exam.id || exam._id, studentId: '', marksObtained: '', grade: '', remarks: '' }); setShowGradeModal(true) }}>
                      <Award className="h-4 w-4 mr-1" /> Add Grade
                    </Button>
                    {grades.length > 0 && (
                      <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => generateReportCards(exam)}>
                        <Download className="h-4 w-4 mr-1" /> Report Cards
                      </Button>
                    )}
                    <Button size="sm" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => { setForm(exam); setShowModal(true) }}><Edit className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(exam.id || exam._id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div><span className="text-slate-500">Class:</span> <span className="font-semibold text-slate-800">{cls?.name}</span></div>
                  <div><span className="text-slate-500">Subject:</span> <span className="font-semibold text-slate-800">{subject?.name}</span></div>
                  <div><span className="text-slate-500">Date:</span> <span className="font-semibold text-slate-800">{new Date(exam.date).toLocaleDateString()}</span></div>
                  <div><span className="text-slate-500">Total Marks:</span> <span className="font-semibold text-slate-800">{exam.totalMarks}</span></div>
                </div>
                {grades.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr>
                          <th className="p-2 text-left text-slate-600">Student</th>
                          <th className="p-2 text-center text-slate-600">Marks</th>
                          <th className="p-2 text-center text-slate-600">Grade</th>
                          <th className="p-2 text-left text-slate-600">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {grades.map((g, i) => {
                          const student = students.find(s => s.id === g.studentId)
                          return (
                            <tr key={i} className="border-t border-slate-200/70">
                              <td className="p-2 text-slate-700">{student?.firstName} {student?.lastName}</td>
                              <td className="p-2 text-center text-slate-700">{g.marksObtained}/{exam.totalMarks}</td>
                              <td className="p-2 text-center"><span className="px-2 py-1 bg-sky-100 text-sky-700 rounded">{g.grade}</span></td>
                              <td className="p-2 text-slate-600">{g.remarks}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
          <DialogHeader><DialogTitle>{form.id || form._id ? 'Edit' : 'Create'} Exam</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input className="bg-white border-slate-200 text-slate-800" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({...form, classId: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">{classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Subject</Label>
                <Select value={form.subjectId} onValueChange={(v) => setForm({...form, subjectId: v})}>
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">{subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Date</Label>
                <Input className="bg-white border-slate-200 text-slate-800" type="date" value={form.date} onChange={(e) => setForm({...form, date: e.target.value})} required />
              </div>
              <div>
                <Label>Duration (mins)</Label>
                <Input className="bg-white border-slate-200 text-slate-800" type="number" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} required />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Total Marks</Label>
                <Input className="bg-white border-slate-200 text-slate-800" type="number" value={form.totalMarks} onChange={(e) => setForm({...form, totalMarks: e.target.value})} required />
              </div>
              <div>
                <Label>Passing Marks</Label>
                <Input className="bg-white border-slate-200 text-slate-800" type="number" value={form.passingMarks} onChange={(e) => setForm({...form, passingMarks: e.target.value})} required />
              </div>
            </div>
            <div>
              <Label>Term</Label>
              <Select value={form.term} onValueChange={(v) => setForm({...form, term: v})}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800">
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white">{form.id || form._id ? 'Update' : 'Create'} Exam</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showGradeModal} onOpenChange={setShowGradeModal}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
          <DialogHeader><DialogTitle>Add Grade</DialogTitle></DialogHeader>
          <form onSubmit={handleGradeSubmit} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={gradeForm.studentId} onValueChange={(v) => setGradeForm({...gradeForm, studentId: v})}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800">{students.map(s => <SelectItem key={s.id} value={s.id}>{s.firstName} {s.lastName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Marks Obtained</Label>
              <Input className="bg-white border-slate-200 text-slate-800" type="number" value={gradeForm.marksObtained} onChange={(e) => setGradeForm({...gradeForm, marksObtained: e.target.value})} required />
            </div>
            <div>
              <Label>Grade</Label>
              <Select value={gradeForm.grade} onValueChange={(v) => setGradeForm({...gradeForm, grade: v})}>
                <SelectTrigger className="bg-white border-slate-200 text-slate-800"><SelectValue placeholder="Select grade" /></SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800">
                  <SelectItem value="A">A - Excellent</SelectItem>
                  <SelectItem value="B">B - Very Good</SelectItem>
                  <SelectItem value="C">C - Good</SelectItem>
                  <SelectItem value="D">D - Fair</SelectItem>
                  <SelectItem value="F">F - Fail</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Remarks</Label>
              <Textarea className="bg-white border-slate-200 text-slate-800" value={gradeForm.remarks} onChange={(e) => setGradeForm({...gradeForm, remarks: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white">Add Grade</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
