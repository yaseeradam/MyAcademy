'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, GraduationCap, Briefcase, Download, Key } from 'lucide-react'
import jsPDF from 'jspdf'

export function ViewTeacherModal({ open, onOpenChange, teacher, onEdit, schoolName }) {
  const downloadPDF = () => {
    const doc = new jsPDF()
    
    // Colorful header - Green theme for teachers
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setFillColor(5, 150, 105)
    doc.rect(0, 30, 210, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('TEACHER RECORD', 105, 15, { align: 'center' })
    doc.setFontSize(14)
    doc.text(schoolName || 'School Name', 105, 25, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Official Staff Document', 105, 33, { align: 'center' })
    
    // Add teacher photo if available
    if (teacher.photo) {
      try {
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
        doc.addImage(teacher.photo, 'JPEG', 15, 50, 40, 40)
        doc.setDrawColor(16, 185, 129)
        doc.setLineWidth(3)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'S')
      } catch (e) {
        doc.setFillColor(229, 231, 235)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
        doc.setTextColor(107, 114, 128)
        doc.setFontSize(10)
        doc.text('No Photo', 35, 73, { align: 'center' })
      }
    } else {
      doc.setFillColor(229, 231, 235)
      doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
      doc.setTextColor(107, 114, 128)
      doc.setFontSize(10)
      doc.text('No Photo', 35, 73, { align: 'center' })
    }
    
    // Teacher name section
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text(`${teacher.firstName} ${teacher.lastName}`, 60, 60)
    
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Email: ${teacher.email}`, 60, 68)
    
    // Personal Information Box
    let y = 100
    doc.setFillColor(236, 253, 245)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(5, 150, 105)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('PERSONAL INFORMATION', 20, y + 6)
    
    y += 15
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    if (teacher.phoneNumber) {
      doc.setFont(undefined, 'bold')
      doc.text('Phone:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(teacher.phoneNumber, 60, y)
      y += 8
    }
    
    if (teacher.address) {
      doc.setFont(undefined, 'bold')
      doc.text('Address:', 20, y)
      doc.setFont(undefined, 'normal')
      const splitAddress = doc.splitTextToSize(teacher.address, 130)
      doc.text(splitAddress, 60, y)
      y += splitAddress.length * 5 + 3
    }
    
    // Professional Information Box
    y += 5
    doc.setFillColor(254, 243, 199)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(217, 119, 6)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('PROFESSIONAL INFORMATION', 20, y + 6)
    
    y += 15
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    
    if (teacher.qualification) {
      doc.setFont(undefined, 'bold')
      doc.text('Qualification:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(teacher.qualification, 60, y)
      y += 8
    }
    
    if (teacher.specialization) {
      doc.setFont(undefined, 'bold')
      doc.text('Specialization:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(teacher.specialization, 60, y)
      y += 8
    }
    
    if (teacher.experience) {
      doc.setFont(undefined, 'bold')
      doc.text('Experience:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(`${teacher.experience} years`, 60, y)
      y += 8
    }
    
    if (teacher.dateOfJoining) {
      doc.setFont(undefined, 'bold')
      doc.text('Date of Joining:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(teacher.dateOfJoining, 60, y)
    }
    
    // Footer
    doc.setFillColor(16, 185, 129)
    doc.rect(0, 280, 210, 17, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 288, { align: 'center' })
    doc.text('This is an official document', 105, 293, { align: 'center' })
    
    doc.save(`${teacher.firstName}_${teacher.lastName}_Record.pdf`)
  }

  if (!teacher) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Teacher Details</DialogTitle></DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-4">
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
            <div><p className="text-xs text-gray-600">Name</p><p className="font-semibold">{teacher.firstName} {teacher.lastName}</p></div>
          </div>
          <div className="flex gap-2 p-3 bg-orange-50 rounded-lg">
            <Mail className="h-5 w-5 text-orange-600" />
            <div><p className="text-xs text-gray-600">Email</p><p className="font-semibold text-sm">{teacher.email}</p></div>
          </div>
          {teacher.plainPassword && (
            <div className="flex gap-2 p-3 bg-red-50 rounded-lg">
              <Key className="h-5 w-5 text-red-600" />
              <div><p className="text-xs text-gray-600">Password</p><p className="font-semibold">{teacher.plainPassword}</p></div>
            </div>
          )}
          {teacher.phoneNumber && (
            <div className="flex gap-2 p-3 bg-teal-50 rounded-lg">
              <Phone className="h-5 w-5 text-teal-600" />
              <div><p className="text-xs text-gray-600">Phone</p><p className="font-semibold">{teacher.phoneNumber}</p></div>
            </div>
          )}
          {teacher.qualification && (
            <div className="flex gap-2 p-3 bg-purple-50 rounded-lg">
              <GraduationCap className="h-5 w-5 text-purple-600" />
              <div><p className="text-xs text-gray-600">Qualification</p><p className="font-semibold">{teacher.qualification}</p></div>
            </div>
          )}
          {teacher.specialization && (
            <div className="flex gap-2 p-3 bg-green-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-green-600" />
              <div><p className="text-xs text-gray-600">Specialization</p><p className="font-semibold">{teacher.specialization}</p></div>
            </div>
          )}
          {teacher.experience && (
            <div className="flex gap-2 p-3 bg-pink-50 rounded-lg">
              <Briefcase className="h-5 w-5 text-pink-600" />
              <div><p className="text-xs text-gray-600">Experience</p><p className="font-semibold">{teacher.experience} years</p></div>
            </div>
          )}
          {teacher.address && (
            <div className="col-span-2 flex gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div><p className="text-xs text-gray-600">Address</p><p className="font-semibold">{teacher.address}</p></div>
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
