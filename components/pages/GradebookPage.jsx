'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Download, Save, FileText } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { generateClassReportCards } from '@/lib/report-generator'

export default function GradebookPage({ 
  currentUser,
  school,
  apiCall,
  modal,
  toast,
  students,
  classes,
  subjects
}) {
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [studentScores, setStudentScores] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [generatingReport, setGeneratingReport] = useState(false)

  // Assessment configuration with maximum marks
  const assessments = [
    { key: 'firstCA', label: '1st CA', max: 10 },
    { key: 'secondCA', label: '2nd CA', max: 10 },
    { key: 'notebook', label: 'Notebook', max: 10 },
    { key: 'firstProject', label: '1st Project', max: 10 },
    { key: 'secondProject', label: '2nd Project', max: 10 },
    { key: 'exam', label: 'Exam', max: 50 }
  ]

  // Filter students by selected class
  const filteredStudents = selectedClass 
    ? students.filter(student => student.classId === selectedClass)
    : []

  // Filter subjects by teacher assignments
  const teacherSubjects = subjects.filter(subject => {
    // This would need to be implemented based on teacher_assignments collection
    return true // For now, show all subjects
  })

  // Calculate total score for a student
  const calculateTotal = (scores) => {
    return assessments.reduce((total, assessment) => {
      const score = parseFloat(scores[assessment.key]) || 0
      return total + score
    }, 0)
  }

  // Calculate letter grade based on custom scale or default
  const calculateGrade = (total) => {
    if (school.gradingScale && school.gradingScale.length > 0) {
      const scale = school.gradingScale.sort((a, b) => b.min - a.min)
      const gradeObj = scale.find(g => total >= g.min && total <= g.max)
      // Handles cases where score might be slightly above max (e.g. bonus) or below min of top tier but above others 
      if (gradeObj) return gradeObj.grade
      
      // Fallback for edge cases not covered by user ranges
      if (total >= scale[0].max) return scale[0].grade
    }

    // Default fallback if no settings
    if (total >= 70) return 'A'
    if (total >= 60) return 'B'
    if (total >= 50) return 'C'
    if (total >= 45) return 'D'
    if (total >= 40) return 'E'
    return 'F'
  }

  // Handle score input with validation
  const handleScoreChange = (studentId, assessmentKey, value) => {
    const assessment = assessments.find(a => a.key === assessmentKey)
    const numericValue = parseFloat(value) || 0
    
    // Validate maximum score
    if (numericValue > assessment.max) {
      toast.error(`Maximum score for ${assessment.label} is ${assessment.max}`)
      return
    }

    setStudentScores(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentKey]: value === '' ? '' : numericValue
      }
    }))
  }

  // Load existing scores when class and subject are selected
  useEffect(() => {
    if (selectedClass && selectedSubject) {
      loadExistingScores()
    }
  }, [selectedClass, selectedSubject])

  const loadExistingScores = async () => {
    try {
      setLoading(true)
      const response = await apiCall(`gradebook/scores?classId=${selectedClass}&subjectId=${selectedSubject}`)
      if (response && response.scores) {
        const scoresMap = {}
        response.scores.forEach(score => {
          scoresMap[score.studentId] = score.scores
        })
        setStudentScores(scoresMap)
      }
    } catch (error) {
      console.error('Error loading scores:', error)
      toast.error('Failed to load existing scores')
    } finally {
      setLoading(false)
    }
  }

  // Save scores to database
  const handleSaveScores = async () => {
    try {
      setSaving(true)
      if (filteredStudents.length === 0) {
        toast.error('No students found in the selected class')
        return
      }
      const scoresData = filteredStudents.map(student => {
        const scores = studentScores[student.id] || {}
        const total = calculateTotal(scores)
        return {
          studentId: student.id,
          classId: selectedClass,
          subjectId: selectedSubject,
          teacherId: currentUser.id,
          schoolId: currentUser.schoolId,
          scores: scores,
          total: total,
          grade: calculateGrade(total)
        }
      })
      await apiCall('gradebook/scores', {
        method: 'POST',
        body: JSON.stringify({ scores: scoresData })
      })
      toast.success('Scores saved successfully!')
    } catch (error) {
      console.error('Error saving scores:', error)
      toast.error('Failed to save scores')
    } finally {
      setSaving(false)
    }
  }

  // Generate PDF report
  const handleDownloadPDF = () => {
    if (!selectedClass || !selectedSubject) {
      toast.error('Please select a class and subject first')
      return
    }

    const selectedClassObj = classes.find(c => c.id === selectedClass)
    const selectedSubjectObj = subjects.find(s => s.id === selectedSubject)

    const doc = new jsPDF()
    
    // Header
    doc.setFontSize(16)
    doc.text('STUDENT SCORESHEET', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Class: ${selectedClassObj?.name || 'N/A'}`, 20, 35)
    doc.text(`Subject: ${selectedSubjectObj?.name || 'N/A'}`, 20, 45)
    doc.text(`Teacher: ${currentUser.name}`, 20, 55)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 65)

    // Table data
    const tableData = filteredStudents.map((student, index) => {
      const scores = studentScores[student.id] || {}
      const total = calculateTotal(scores)
      const row = [
        index + 1,
        `${student.firstName} ${student.lastName}`,
        scores.firstCA || 0,
        scores.secondCA || 0,
        scores.notebook || 0,
        scores.firstProject || 0,
        scores.secondProject || 0,
        scores.exam || 0,
        total,
        calculateGrade(total)
      ]
      return row
    })

    // Table headers
    const headers = ['S/N', 'Student Name', '1st CA', '2nd CA', 'Nbk', '1st Prj', '2nd Prj', 'Exam', 'Total', 'Grd']

    // Generate table
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      styles: { fontSize: 9, cellPadding: 1 },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 40 },
        // Distribute remaining width specifically if needed
      }
    })

    // Save the PDF
    doc.save(`scoresheet-${selectedClassObj?.name || 'class'}-${selectedSubjectObj?.name || 'subject'}-${new Date().toISOString().split('T')[0]}.pdf`)
  }

  // Generate Class Report Cards
  const handleGenerateReportCards = async () => {
    if (!selectedClass) {
      toast.error('Please select a class first')
      return
    }

    try {
      setGeneratingReport(true)
      // Fetch all scores for the class (without subjectId)
      const response = await apiCall(`gradebook/scores?classId=${selectedClass}`)
      
      if (!response || !response.scores) {
        toast.error('Failed to fetch class scores')
        return
      }

      if (response.scores.length === 0) {
        toast.warning('No scores found for this class')
        return
      }

      const selectedClassObj = classes.find(c => c.id === selectedClass)
      
      // We pass the filtered students for this class
      generateClassReportCards(
        filteredStudents, 
        subjects, 
        response.scores, 
        school?.name || currentUser.schoolName || 'School Name', 
        selectedClassObj?.name || 'Class',
        school.gradingScale || []
      )
      
      toast.success('Report cards generated successfully')
    } catch (error) {
      console.error('Error generating report cards:', error)
      toast.error(`Failed to generate report cards: ${error.message || 'Unknown error'}`)
    } finally {
      setGeneratingReport(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gradebook</h1>
        <div className="flex gap-2">
          {selectedClass && (
             <Button onClick={handleGenerateReportCards} variant="secondary" disabled={generatingReport}>
               <FileText className="h-4 w-4 mr-2" />
               {generatingReport ? 'Generating...' : 'Report Cards'}
             </Button>
          )}
          <Button onClick={handleDownloadPDF} variant="outline" disabled={!selectedClass || !selectedSubject || filteredStudents.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download Sheet
          </Button>
          <Button onClick={handleSaveScores} disabled={!selectedClass || !selectedSubject || filteredStudents.length === 0 || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Scores'}
          </Button>
        </div>
      </div>

      {/* Context Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Select Class and Subject
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student Scores Table */}
      {selectedClass && selectedSubject && (
        <Card>
          <CardHeader>
            <CardTitle>Student Scores</CardTitle>
            <p className="text-sm text-gray-600">
              {filteredStudents.length > 0 
                ? `Enter scores for ${filteredStudents.length} students. All fields are required.`
                : 'No students found in the selected class.'}
            </p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading existing scores...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">S/N</TableHead>
                      <TableHead className="w-48">Student Name</TableHead>
                      {assessments.map(assessment => (
                        <TableHead key={assessment.key} className="text-center w-24">
                          <div>
                            <div>{assessment.label}</div>
                            <div className="text-xs text-gray-500">(Max: {assessment.max})</div>
                          </div>
                        </TableHead>
                      ))}
                      <TableHead className="text-center w-24">
                        <div>
                          <div>Total</div>
                          <div className="text-xs text-gray-500">(Max: 100)</div>
                        </div>
                      </TableHead>
                      <TableHead className="text-center w-16">
                        <div>Grade</div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student, index) => {
                      const scores = studentScores[student.id] || {}
                      const total = calculateTotal(scores)
                      const grade = calculateGrade(total)
                      
                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                            </div>
                          </TableCell>
                          {assessments.map(assessment => (
                            <TableCell key={assessment.key} className="text-center">
                              <Input
                                type="number"
                                min="0"
                                max={assessment.max}
                                step="0.5"
                                value={scores[assessment.key] || ''}
                                onChange={(e) => handleScoreChange(student.id, assessment.key, e.target.value)}
                                className="w-20 text-center mx-auto"
                                placeholder="0"
                              />
                            </TableCell>
                          ))}
                          <TableCell className="text-center font-bold">
                            <Badge variant={total >= 70 ? 'success' : total >= 50 ? 'warning' : 'destructive'}>
                              {total.toFixed(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center font-bold">
                            {grade}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {(!selectedClass || !selectedSubject) && (
        <Card>
          <CardContent className="p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Class or Subject Selected</h3>
            <p className="text-gray-600">
              Please select a class and subject above to start entering student scores.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}