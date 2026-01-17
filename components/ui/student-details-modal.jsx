'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Download, User, Mail, Phone, MapPin, Calendar, Hash, Users, School } from 'lucide-react'
import jsPDF from 'jspdf'

export function StudentDetailsModal({ open, onOpenChange, student, parentName, className, schoolName, schoolLogo, schoolMeta }) {
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
    const headerHeight = 28
    const logoSize = 16
    const contentTop = headerHeight + 16

    doc.setFillColor(15, 23, 42)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.text(schoolName || 'School', margin, 18)

    const logoData = await loadImageData(schoolLogo)
    if (logoData) {
      doc.addImage(logoData, getImageFormat(logoData), pageWidth - margin - logoSize, 6, logoSize, logoSize)
    }

    doc.setTextColor(100, 116, 139)
    doc.setFontSize(9)
    const metaLine = [schoolMeta?.address, schoolMeta?.phoneNumber, schoolMeta?.email].filter(Boolean).join(' | ')
    if (metaLine) {
      doc.text(metaLine, margin, headerHeight + 8)
    }

    doc.setTextColor(15, 23, 42)
    doc.setFontSize(14)
    doc.text('Student Admission Form', margin, contentTop)
    if (student.photo && student.photo.startsWith('data:image')) {
      const photoFormat = getImageFormat(student.photo)
      doc.addImage(student.photo, photoFormat, pageWidth - margin - 22, contentTop - 6, 22, 22)
    }

    doc.setDrawColor(226, 232, 240)
    doc.line(margin, contentTop + 4, pageWidth - margin, contentTop + 4)

    doc.setFontSize(11)
    const lineHeight = 8
    let y = contentTop + 14

    const addLabelValue = (label, value, x) => {
      doc.setTextColor(100, 116, 139)
      doc.text(label, x, y)
      doc.setTextColor(15, 23, 42)
      doc.text(value || 'N/A', x + 38, y)
      y += lineHeight
    }

    addLabelValue('Admission No:', student.admissionNumber, margin)
    addLabelValue('Full Name:', `${student.firstName} ${student.lastName}`, margin)
    addLabelValue('Date of Birth:', student.dateOfBirth || 'N/A', margin)
    addLabelValue('Gender:', student.gender || 'N/A', margin)
    addLabelValue('Class:', className || 'N/A', margin)
    addLabelValue('Parent:', parentName || 'N/A', margin)
    if (student.phoneNumber) addLabelValue('Phone:', student.phoneNumber, margin)
    if (student.email) addLabelValue('Email:', student.email, margin)
    if (student.emergencyContact) addLabelValue('Emergency:', student.emergencyContact, margin)
    if (student.address) {
      doc.setTextColor(100, 116, 139)
      doc.text('Address:', margin, y)
      doc.setTextColor(15, 23, 42)
      const addressLines = doc.splitTextToSize(student.address, pageWidth - margin * 2 - 38)
      doc.text(addressLines, margin + 38, y)
      y += lineHeight * addressLines.length
    }

    doc.setTextColor(148, 163, 184)
    doc.setFontSize(9)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, doc.internal.pageSize.getHeight() - 10)

    doc.save(`${student.firstName}_${student.lastName}_Admission.pdf`)
  }

  if (!student) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-hidden bg-slate-950 text-white border-slate-800 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="sr-only">Student admission details</DialogTitle>
        </DialogHeader>
        <div className="relative overflow-hidden rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
          <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="relative p-5 flex items-center gap-4">
            {schoolLogo ? (
              <img src={schoolLogo} alt={schoolName} className="h-12 w-12 rounded-xl object-cover ring-2 ring-white/20" />
            ) : (
              <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center">
                <School className="h-6 w-6 text-white/80" />
              </div>
            )}
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/60">Admission Form</p>
              <h2 className="text-xl font-semibold">{schoolName || 'School'}</h2>
              <p className="text-xs text-white/60">{schoolMeta?.address || 'Address not set'}</p>
            </div>
            <div className="hidden sm:flex flex-col items-end text-xs text-white/60">
              <span>{schoolMeta?.phoneNumber || 'Phone not set'}</span>
              <span>{schoolMeta?.email || 'Email not set'}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 overflow-y-auto pr-2 max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Student</p>
              <div className="mt-3 flex items-center gap-3">
                {student.photo ? (
                  <img src={student.photo} alt="Student" className="h-14 w-14 rounded-xl object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-white/10 flex items-center justify-center">
                    <User className="h-6 w-6 text-white/70" />
                  </div>
                )}
                <div>
                  <p className="text-base font-semibold">{student.firstName} {student.lastName}</p>
                  <p className="text-xs text-white/60">Admission #{student.admissionNumber}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-white/80">
                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-white/50" /><span>{student.dateOfBirth || 'N/A'}</span></div>
                <div className="flex items-center gap-2"><Users className="h-4 w-4 text-white/50" /><span>{className}</span></div>
                {student.phoneNumber && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-white/50" /><span>{student.phoneNumber}</span></div>}
                {student.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-white/50" /><span>{student.email}</span></div>}
              </div>
            </div>

            <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Guardian</p>
              <div className="mt-3 space-y-2 text-sm text-white/80">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-white/50" /><span>{parentName}</span></div>
                {student.emergencyContact && <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-white/50" /><span>{student.emergencyContact}</span></div>}
                {student.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-white/50 mt-0.5" />
                    <span className="text-white/70">{student.address}</span>
                  </div>
                )}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-white/60">
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2">
                  <p className="uppercase tracking-[0.2em] text-[10px] text-white/40">Gender</p>
                  <p className="text-sm text-white/80 capitalize">{student.gender || 'N/A'}</p>
                </div>
                <div className="rounded-lg border border-slate-800 bg-slate-900/80 p-2">
                  <p className="uppercase tracking-[0.2em] text-[10px] text-white/40">Admission Date</p>
                  <p className="text-sm text-white/80">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button onClick={downloadPDF} className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10" variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Admission PDF
          </Button>
          <Button onClick={() => onOpenChange(false)} className="w-full bg-sky-500 hover:bg-sky-600 text-white border-none">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
