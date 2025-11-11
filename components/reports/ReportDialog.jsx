'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, Download, FileSpreadsheet } from 'lucide-react'
import { generateStudentReport, generateTeacherReport, generateAttendanceReport, generateComprehensiveReport, generateExcelReport } from '@/lib/report-generator'
import { useModal } from '@/hooks/useModal'
import { LoadingModal } from '@/components/ui/loading-modal'
import { StatusModal } from '@/components/ui/status-modal'

export default function ReportDialog({ open, onOpenChange, students, teachers, parents, classes, attendance, stats, userRole, schoolName }) {
  const modal = useModal()
  const [reportType, setReportType] = useState('comprehensive')
  const [format, setFormat] = useState('pdf')

  const handleGenerate = () => {
    try {
      modal.showLoading('Generating report...')
      if (format === 'pdf') {
        switch (reportType) {
          case 'students':
            generateStudentReport(students, classes, parents, schoolName)
            break
          case 'teachers':
            generateTeacherReport(teachers, schoolName)
            break
          case 'attendance':
            generateAttendanceReport(attendance, students, teachers, classes, userRole, schoolName)
            break
          case 'comprehensive':
            generateComprehensiveReport(stats, students, teachers, parents, classes, attendance, userRole, schoolName)
            break
        }
      } else {
        generateExcelReport(students, teachers, parents, classes, schoolName)
      }
      modal.showSuccess('Report Generated', 'Report generated successfully!')
      onOpenChange(false)
    } catch (error) {
      modal.showError('Generation Failed', 'Failed to generate report')
      console.error(error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Report
          </DialogTitle>
          <DialogDescription>
            Select the type of report and format you want to generate
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                <SelectItem value="students">Students Report</SelectItem>
                <SelectItem value="teachers">Teachers Report</SelectItem>
                <SelectItem value="attendance">Attendance Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Document
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Excel Spreadsheet
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p className="text-blue-900 font-medium mb-1">Report Preview:</p>
            <p className="text-blue-700">
              {reportType === 'comprehensive' && 'Complete overview with all statistics'}
              {reportType === 'students' && `${students.length} students with class and parent info`}
              {reportType === 'teachers' && `${teachers.length} teachers with qualifications`}
              {reportType === 'attendance' && `${attendance.length} attendance records`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleGenerate} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
      </DialogContent>
      
      <LoadingModal open={modal.loading} message={modal.loadingMessage} />
      <StatusModal 
        open={modal.status.open} 
        onOpenChange={modal.closeStatus}
        type={modal.status.type}
        title={modal.status.title}
        message={modal.status.message}
      />
    </Dialog>
  )
}
