'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, User, Mail, Phone, MapPin, Calendar, Hash, Users } from 'lucide-react'
import jsPDF from 'jspdf'

export function StudentDetailsModal({ open, onOpenChange, student, parentName, className }) {
  const downloadPDF = () => {
    const doc = new jsPDF()
    
    doc.setFontSize(20)
    doc.text('Student Information', 20, 20)
    
    doc.setFontSize(12)
    let y = 40
    const lineHeight = 10
    
    doc.text(`Name: ${student.firstName} ${student.lastName}`, 20, y)
    y += lineHeight
    doc.text(`Admission Number: ${student.admissionNumber}`, 20, y)
    y += lineHeight
    doc.text(`Date of Birth: ${student.dateOfBirth}`, 20, y)
    y += lineHeight
    doc.text(`Gender: ${student.gender}`, 20, y)
    y += lineHeight
    if (student.email) {
      doc.text(`Email: ${student.email}`, 20, y)
      y += lineHeight
    }
    if (student.phoneNumber) {
      doc.text(`Phone: ${student.phoneNumber}`, 20, y)
      y += lineHeight
    }
    if (student.address) {
      doc.text(`Address: ${student.address}`, 20, y)
      y += lineHeight
    }
    doc.text(`Class: ${className}`, 20, y)
    y += lineHeight
    doc.text(`Parent: ${parentName}`, 20, y)
    y += lineHeight
    if (student.emergencyContact) {
      doc.text(`Emergency Contact: ${student.emergencyContact}`, 20, y)
    }
    
    doc.save(`${student.firstName}_${student.lastName}_Details.pdf`)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Student Created Successfully!</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <User className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Full Name</p>
                <p className="font-semibold">{student.firstName} {student.lastName}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
              <Hash className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Admission Number</p>
                <p className="font-semibold">{student.admissionNumber}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Date of Birth</p>
                <p className="font-semibold">{student.dateOfBirth}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-pink-50 rounded-lg">
              <User className="h-5 w-5 text-pink-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Gender</p>
                <p className="font-semibold capitalize">{student.gender}</p>
              </div>
            </div>
            
            {student.email && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <Mail className="h-5 w-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="font-semibold text-sm">{student.email}</p>
                </div>
              </div>
            )}
            
            {student.phoneNumber && (
              <div className="flex items-start gap-3 p-3 bg-teal-50 rounded-lg">
                <Phone className="h-5 w-5 text-teal-600 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600">Phone</p>
                  <p className="font-semibold">{student.phoneNumber}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-lg">
              <Users className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Class</p>
                <p className="font-semibold">{className}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg">
              <User className="h-5 w-5 text-cyan-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Parent</p>
                <p className="font-semibold text-sm">{parentName}</p>
              </div>
            </div>
          </div>
          
          {student.address && (
            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Address</p>
                <p className="font-semibold">{student.address}</p>
              </div>
            </div>
          )}
          
          {student.emergencyContact && (
            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
              <Phone className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600">Emergency Contact</p>
                <p className="font-semibold">{student.emergencyContact}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button onClick={downloadPDF} className="flex-1" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
