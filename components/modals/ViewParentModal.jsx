'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, Users, Download, Key } from 'lucide-react'
import jsPDF from 'jspdf'

export function ViewParentModal({ open, onOpenChange, parent, children, onEdit, schoolName, readOnly = false }) {
  const downloadPDF = () => {
    const doc = new jsPDF()
    
    // Colorful header - Purple theme for parents
    doc.setFillColor(147, 51, 234)
    doc.rect(0, 0, 210, 40, 'F')
    doc.setFillColor(126, 34, 206)
    doc.rect(0, 30, 210, 10, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont(undefined, 'bold')
    doc.text('PARENT RECORD', 105, 15, { align: 'center' })
    doc.setFontSize(14)
    doc.text(schoolName || 'School Name', 105, 25, { align: 'center' })
    doc.setFontSize(10)
    doc.text('Official Guardian Document', 105, 33, { align: 'center' })
    
    // Add parent photo if available
    if (parent.photo) {
      try {
        doc.setFillColor(255, 255, 255)
        doc.roundedRect(14, 49, 42, 42, 3, 3, 'F')
        doc.addImage(parent.photo, 'JPEG', 15, 50, 40, 40)
        doc.setDrawColor(147, 51, 234)
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
    
    // Parent name section
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(18)
    doc.setFont(undefined, 'bold')
    doc.text(parent.name, 60, 60)
    
    doc.setFontSize(11)
    doc.setFont(undefined, 'normal')
    doc.setTextColor(100, 100, 100)
    doc.text(`Email: ${parent.email}`, 60, 68)
    
    // Personal Information Box
    let y = 100
    doc.setFillColor(243, 232, 255)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(126, 34, 206)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('PERSONAL INFORMATION', 20, y + 6)
    
    y += 15
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    
    if (parent.phoneNumber) {
      doc.setFont(undefined, 'bold')
      doc.text('Phone:', 20, y)
      doc.setFont(undefined, 'normal')
      doc.text(parent.phoneNumber, 60, y)
      y += 8
    }
    
    if (parent.address) {
      doc.setFont(undefined, 'bold')
      doc.text('Address:', 20, y)
      doc.setFont(undefined, 'normal')
      const splitAddress = doc.splitTextToSize(parent.address, 130)
      doc.text(splitAddress, 60, y)
      y += splitAddress.length * 5 + 3
    }
    
    // Children Information Box
    y += 5
    doc.setFillColor(219, 234, 254)
    doc.rect(15, y, 180, 8, 'F')
    doc.setTextColor(37, 99, 235)
    doc.setFontSize(12)
    doc.setFont(undefined, 'bold')
    doc.text('CHILDREN INFORMATION', 20, y + 6)
    
    y += 15
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.setFont(undefined, 'bold')
    doc.text('Total Children:', 20, y)
    doc.setFont(undefined, 'normal')
    doc.text(children.length.toString(), 60, y)
    
    if (children.length > 0) {
      y += 10
      doc.setFont(undefined, 'bold')
      doc.text('Children List:', 20, y)
      y += 6
      doc.setFont(undefined, 'normal')
      children.forEach((child, index) => {
        doc.text(`${index + 1}. ${child.firstName} ${child.lastName}`, 25, y)
        y += 6
      })
    }
    
    // Footer
    doc.setFillColor(147, 51, 234)
    doc.rect(0, 280, 210, 17, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(9)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 288, { align: 'center' })
    doc.text('This is an official document', 105, 293, { align: 'center' })
    
    doc.save(`${parent.name}_Record.pdf`)
  }

  if (!parent) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader><DialogTitle>Parent Details</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3 py-4">
          <div className="flex gap-2 p-3 bg-blue-50 rounded-lg">
            <User className="h-5 w-5 text-blue-600" />
            <div><p className="text-xs text-gray-600">Name</p><p className="font-semibold">{parent.name}</p></div>
          </div>
          <div className="flex gap-2 p-3 bg-orange-50 rounded-lg">
            <Mail className="h-5 w-5 text-orange-600" />
            <div><p className="text-xs text-gray-600">Email</p><p className="font-semibold text-sm">{parent.email}</p></div>
          </div>
          {parent.plainPassword && (
            <div className="flex gap-2 p-3 bg-red-50 rounded-lg">
              <Key className="h-5 w-5 text-red-600" />
              <div><p className="text-xs text-gray-600">Password</p><p className="font-semibold">{parent.plainPassword}</p></div>
            </div>
          )}
          {parent.phoneNumber && (
            <div className="flex gap-2 p-3 bg-teal-50 rounded-lg">
              <Phone className="h-5 w-5 text-teal-600" />
              <div><p className="text-xs text-gray-600">Phone</p><p className="font-semibold">{parent.phoneNumber}</p></div>
            </div>
          )}
          <div className="flex gap-2 p-3 bg-purple-50 rounded-lg">
            <Users className="h-5 w-5 text-purple-600" />
            <div><p className="text-xs text-gray-600">Children</p><p className="font-semibold">{children.length}</p></div>
          </div>
          {parent.address && (
            <div className="col-span-2 flex gap-2 p-3 bg-gray-50 rounded-lg">
              <MapPin className="h-5 w-5 text-gray-600" />
              <div><p className="text-xs text-gray-600">Address</p><p className="font-semibold">{parent.address}</p></div>
            </div>
          )}
          {children.length > 0 && (
            <div className="col-span-2 p-3 bg-indigo-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2">Children List</p>
              <div className="space-y-1">
                {children.map(child => (
                  <p key={child.id} className="font-semibold text-sm">{child.firstName} {child.lastName}</p>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          {!readOnly && <Button onClick={downloadPDF} variant="outline" className="flex-1"><Download className="h-4 w-4 mr-2" />Download</Button>}
          {!readOnly && <Button onClick={onEdit} variant="outline" className="flex-1">Edit</Button>}
          <Button onClick={() => onOpenChange(false)} className="flex-1">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
