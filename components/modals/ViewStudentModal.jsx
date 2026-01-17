'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { User, Mail, Phone, MapPin, Calendar, Hash, Users, Download, School } from 'lucide-react'
import jsPDF from 'jspdf'

export function ViewStudentModal({ open, onOpenChange, student, parent, classInfo, onEdit, schoolName, schoolLogo, schoolMeta }) {
  const loadImageData = async (url) => {
    if (!url) return null
    try {
      const response = await fetch(url)
      if (!response.ok) return null
      const blob = await response.blob()
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.onerror = () => resolve(null)
        reader.readAsDataURL(blob)
      })
    } catch {
      return null
    }
  }

  const getImageFormat = (dataUrl) => {
    if (!dataUrl) return 'PNG'
    return dataUrl.startsWith('data:image/png') ? 'PNG' : 'JPEG'
  }

  const downloadPDF = async () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 14
    const headerHeight = 34
    const logoSize = 18
    const contentTop = headerHeight + 18

    doc.setFillColor(248, 250, 252)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    doc.setDrawColor(226, 232, 240)
    doc.line(0, headerHeight, pageWidth, headerHeight)

    const logoData = await loadImageData(schoolLogo)
    if (logoData) {
      doc.addImage(logoData, getImageFormat(logoData), margin, 8, logoSize, logoSize)
    } else {
      doc.setFillColor(226, 232, 240)
      doc.roundedRect(margin, 8, logoSize, logoSize, 2, 2, 'F')
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(9)
      doc.text('LOGO', margin + 4, 19)
    }

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(16)
    doc.text(schoolName || 'School', margin + logoSize + 6, 18)
    doc.setFontSize(9)
    doc.setTextColor(100, 116, 139)
    const metaLine = [schoolMeta?.address, schoolMeta?.phoneNumber, schoolMeta?.email].filter(Boolean).join(' | ')
    doc.text(metaLine || 'School address and contact', margin + logoSize + 6, 26)

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(14)
    doc.text('Student Record', margin, contentTop)
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, contentTop + 4, pageWidth - margin, contentTop + 4)

    const photoX = pageWidth - margin - 26
    const photoY = contentTop - 6
    doc.setDrawColor(226, 232, 240)
    doc.roundedRect(photoX, photoY, 26, 26, 3, 3, 'S')
    if (student.photo && student.photo.startsWith('data:image')) {
      doc.addImage(student.photo, getImageFormat(student.photo), photoX + 1, photoY + 1, 24, 24)
    }

    doc.setFontSize(10)
    doc.setTextColor(71, 85, 105)
    let y = contentTop + 12

    const sectionTitle = (label) => {
      doc.setFillColor(241, 245, 249)
      doc.rect(margin, y - 5, pageWidth - margin * 2, 7, 'F')
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(10)
      doc.text(label, margin + 2, y)
      y += 10
    }

    const addRow = (label, value, x) => {
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(9)
      doc.text(label, x, y)
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(10)
      doc.text(value || 'N/A', x + 36, y)
      y += 7
    }

    sectionTitle('Student Information')
    addRow('Full Name:', `${student.firstName} ${student.lastName}`, margin)
    addRow('Admission No:', student.admissionNumber, margin)
    addRow('Date of Birth:', student.dateOfBirth || 'N/A', margin)
    addRow('Gender:', student.gender || 'N/A', margin)
    addRow('Status:', student.active ? 'Active' : 'Inactive', margin)

    sectionTitle('Academic Information')
    addRow('Class:', classInfo?.name || 'N/A', margin)
    addRow('Parent:', parent?.name || 'N/A', margin)

    sectionTitle('Contact Information')
    if (student.phoneNumber) addRow('Phone:', student.phoneNumber, margin)
    if (student.email) addRow('Email:', student.email, margin)
    if (parent?.phoneNumber) addRow('Parent Phone:', parent.phoneNumber, margin)
    if (student.emergencyContact) addRow('Emergency:', student.emergencyContact, margin)
    if (student.address) {
      doc.setTextColor(100, 116, 139)
      doc.setFontSize(9)
      doc.text('Address:', margin, y)
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(10)
      const addressLines = doc.splitTextToSize(student.address, pageWidth - margin * 2 - 36)
      doc.text(addressLines, margin + 36, y)
      y += 7 * addressLines.length
    }

    const footerY = doc.internal.pageSize.getHeight() - 18
    doc.setDrawColor(226, 232, 240)
    doc.line(margin, footerY, pageWidth - margin, footerY)
    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, footerY + 8)
    doc.text('Signature: ____________________', pageWidth - margin - 70, footerY + 8)

    doc.save(`${student.firstName}_${student.lastName}_Record.pdf`)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl bg-white text-slate-900 border-slate-200 shadow-xl">
        <DialogHeader>
          <DialogTitle>Student Record</DialogTitle>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-50 to-white p-4 flex items-center gap-4">
          {schoolLogo ? (
            <img src={schoolLogo} alt={schoolName} className="h-12 w-12 rounded-lg object-cover ring-1 ring-slate-200" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
              <School className="h-6 w-6 text-slate-500" />
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs text-slate-500">School</p>
            <h2 className="text-lg font-semibold">{schoolName || 'School'}</h2>
            <p className="text-xs text-slate-500">{schoolMeta?.address || 'Address not set'}</p>
          </div>
          <div className="text-xs text-slate-500 text-right hidden sm:block">
            <div>{schoolMeta?.phoneNumber || 'Phone not set'}</div>
            <div>{schoolMeta?.email || 'Email not set'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-3">
              {student.photo ? (
                <img src={student.photo} alt="Student" className="h-14 w-14 rounded-lg object-cover ring-1 ring-slate-200" />
              ) : (
                <div className="h-14 w-14 rounded-lg bg-slate-100 flex items-center justify-center">
                  <User className="h-6 w-6 text-slate-500" />
                </div>
              )}
              <div>
                <p className="text-sm text-slate-500">Student</p>
                <p className="text-base font-semibold">{student.firstName} {student.lastName}</p>
                <p className="text-xs text-slate-500">Admission #{student.admissionNumber}</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /><span>{student.dateOfBirth || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><Users className="h-4 w-4 text-slate-400" /><span>{classInfo?.name || 'N/A'}</span></div>
              <div className="flex items-center gap-2"><Hash className="h-4 w-4 text-slate-400" /><span className="capitalize">{student.gender || 'N/A'}</span></div>
              {student.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span>{student.phoneNumber}</span></div>}
              {student.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-400" /><span>{student.email}</span></div>}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Guardian</p>
            <div className="mt-2 space-y-2 text-sm text-slate-700">
              <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /><span>{parent?.name || 'N/A'}</span></div>
              {parent?.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span>{parent.phoneNumber}</span></div>}
              {student.emergencyContact && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" /><span>{student.emergencyContact}</span></div>}
              {student.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-slate-400 mt-0.5" />
                  <span>{student.address}</span>
                </div>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-500">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p>Status</p>
                <p className="text-sm font-medium text-slate-700">{student.active ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                <p>Admission Date</p>
                <p className="text-sm font-medium text-slate-700">{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <Button onClick={downloadPDF} variant="outline" className="flex-1">
            <Download className="h-4 w-4 mr-2" />Download PDF
          </Button>
          <Button onClick={onEdit} variant="outline" className="flex-1">Edit</Button>
          <Button onClick={() => onOpenChange(false)} className="flex-1">Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
