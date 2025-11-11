'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, Calendar, Hash, Users, Download } from 'lucide-react'
import jsPDF from 'jspdf'

export function ViewStudentModal({ open, onOpenChange, student, parent, classInfo, onEdit, schoolName }) {
  const downloadPDF = () => {
    const doc = new jsPDF()
    
    // Colorful header with gradient effect
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setFillColor(37, 99, 235)
    doc.rect(0, 30, 210, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('STUDENT RECORD', 105, 15, { align: 'center' })
    doc.setFontSize(14)
    doc.text(schoolName || 'School Name', 105, 25, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Official Academic Document', 105, 33, { align: 'center' })
    
    // Add student photo if available
    if (student.photo) {
      try {
        // Add white background for photo
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
        
        // Add photo
        doc.addImage(student.photo, 'JPEG', 15, 50, 40, 40)
        
        // Add blue border around photo
        doc.setDrawColor(59, 130, 246)
        doc.setLineWidth(3)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'S')
      } catch (e) {
        // If photo fails, add placeholder
        doc.setFillColor(229, 231, 235)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
        doc.setTextColor(107, 114, 128)
        doc.setFontSize(10)
        doc.text('No Photo', 35, 73, { align: 'center' })
      }
    } else {
      // Add placeholder if no photo
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(10)
      doc.text('No Photo', 35, 73, { align: 'center' })
    }
    
    // Student name section
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text(`${student.firstName} ${student.lastName}`, 60, 60)
    
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Admission No: ${student.admissionNumber}`, 60, 68)
    
    // Personal Information Box
    let y = 100
    doc.setFillColor(239, 246, 255)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(37, 99, 235)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('PERSONAL INFORMATION', 20, y + 6)
    
    y += 15
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    doc.setFont(undefined, 'bold')
    doc.text('Date of Birth:', 20, y)
    doc.setFont(undefined, 'normal')
    doc.text(student.dateOfBirth, 60, y)
    
    doc.setFont(undefined, 'bold')
    doc.text('Gender:', 120, y)
    doc.setFont(undefined, 'normal')
    doc.text(student.gender, 145, y)
    
    y += 8
    if (student.email) {
      doc.setFont(undefined, 'bold')
      doc.text('Email:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(student.email, 60, y)
      y += 8
    }
    
    if (student.phoneNumber) {
      doc.setFont(undefined, 'bold')
      doc.text('Phone:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(student.phoneNumber, 60, y)
      y += 8
    }
    
    if (student.address) {
      doc.setFont(undefined, 'bold')
      doc.text('Address:', 20, y)
      doc.setFont(undefined, 'normal')
      const splitAddress = doc.splitTextToSize(student.address, 130)
      doc.text(splitAddress, 60, y)
      y += splitAddress.length * 5 + 3
    }
    
    // Academic Information Box
    y += 5
    doc.setFillColor(243, 232, 255)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(126, 34, 206)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('ACADEMIC INFORMATION', 20, y + 6)
    
    y += 15
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Class:', 20, y)
    doc.setFont(undefined, 'normal')
    doc.text(classInfo?.name || 'N/A', 60, y)
    
    y += 8
    doc.setFont(undefined, 'bold')
    doc.text('Parent/Guardian:', 20, y)
    doc.setFont(undefined, 'normal')
    doc.text(parent?.name || 'N/A', 60, y)
    
    if (parent?.phoneNumber) {
      y += 8
      doc.setFont(undefined, 'bold')
      doc.text('Parent Contact:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(parent.phoneNumber, 60, y)
    }
    
    if (student.emergencyContact) {
      y += 8
      doc.setFont(undefined, 'bold')
      doc.text('Emergency Contact:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(student.emergencyContact, 60, y)
    }
    
    // Footer
    doc.setFillColor(59, 130, 246)
    doc.rect(0, 280, 210, 17, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 288, { align: 'center' })
    doc.text('This is an official document', 105, 293, { align: 'center' })
    
    doc.save(`${student.firstName}_${student.lastName}_Record.pdf`)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Student Details</DialogTitle></DialogHeader>
        {student.photo && (
          <div className="flex justify-center py-4">
            <img src={student.photo} alt="Student" className="h-32 w-32 rounded-full object-cover border-4 border-blue-500 shadow-lg" />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
            <div><p className="text-xs text-gray-600">Name</p><p className="font-semibold">{student.firstName} {student.lastName}</p></div>
          </div>
          <div className="flex gap-2 p-3 bg-purple-50 rounded-lg">
            <Hash className="h-5 w-5 text-purple-600" />
            <div><p className="text-xs text-gray-600">Admission</p><p className="font-semibold">{student.admissionNumber}</p></div>
          </div>
          <div className="flex gap-2 p-3 bg-green-50 rounded-lg">
            <Calendar className="h-5 w-5 text-green-600" />
            <div><p className="text-xs text-gray-600">DOB</p><p className="font-semibold">{student.dateOfBirth}</p></div>
          </div>
          <div className="flex gap-2 p-3 bg-pink-50 rounded-lg">
            <User className="h-5 w-5 text-pink-600" />
            <div><p className="text-xs text-gray-600">Gender</p><p className="font-semibold capitalize">{student.gender}</p></div>
          </div>
          {student.email && (
            <div className="flex gap-2 p-3 bg-orange-50 rounded-lg">
              <Mail className="h-5 w-5 text-orange-600" />
              <div><p className="text-xs text-gray-600">Email</p><p className="font-semibold text-sm">{student.email}</p></div>
            </div>
          )}
          {student.phoneNumber && (
            <div className="flex gap-2 p-3 bg-teal-50 rounded-lg">
              <Phone className="h-5 w-5 text-teal-600" />
              <div><p className="text-xs text-gray-600">Phone</p><p className="font-semibold">{student.phoneNumber}</p></div>
            </div>
          )}
          <div className="flex gap-2 p-3 bg-indigo-50 rounded-lg">
            <Users className="h-5 w-5 text-indigo-600" />
            <div><p className="text-xs text-gray-600">Class</p><p className="font-semibold">{classInfo?.name || 'N/A'}</p></div>
          </div>
          <div className="flex gap-2 p-3 bg-cyan-50 rounded-lg">
            <User className="h-5 w-5 text-cyan-600" />
            <div><p className="text-xs text-gray-600">Parent</p><p className="font-semibold text-sm">{parent?.name || 'N/A'}</p></div>
          </div>
          {student.address && (
            <div className="col-span-2 flex gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div><p className="text-xs text-gray-600">Address</p><p className="font-semibold">{student.address}</p></div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadPDF} variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Download</Button>
          <Button onClick={onEdit} variant="outline" className="flex-1">Edit</Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
