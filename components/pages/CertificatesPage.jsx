'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, Award, Search, Users, ShieldCheck, GraduationCap } from 'lucide-react'
import jsPDF from 'jspdf'

export default function CertificatesPage({
    school,
    schoolSettings,
    students,
    classes,
    apiCall,
    modal,
    onBack
}) {
    const [selectedClass, setSelectedClass] = useState('all')
    const [searchTerm, setSearchTerm] = useState('')
    const [certificateType, setCertificateType] = useState('merit')
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
    const [reason, setReason] = useState('Outstanding Academic Performance')

    const filteredStudents = students.filter(student => {
        const matchesClass = selectedClass === 'all' || student.classId === selectedClass
        const fullName = `${student.firstName} ${student.lastName}`.toLowerCase()
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
            student.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesClass && matchesSearch
    })

    const schoolName = school?.name || schoolSettings?.schoolName || 'YOUR SCHOOL NAME'
    const schoolLogo = schoolSettings?.logo || school?.logo || null

    const generateCertificate = async (student) => {
        modal?.showLoading(`Generating certificate for ${student.firstName}...`)

        try {
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            })

            const width = doc.internal.pageSize.getWidth()
            const height = doc.internal.pageSize.getHeight()

            // 1. Draw Border
            doc.setDrawColor(41, 128, 185) // Blue
            doc.setLineWidth(2)
            doc.rect(5, 5, width - 10, height - 10)

            doc.setDrawColor(52, 152, 219) // Lighter Blue
            doc.setLineWidth(0.5)
            doc.rect(7, 7, width - 14, height - 14)

            // 2. Add Stylized Corners
            doc.setFillColor(41, 128, 185)
            doc.triangle(5, 5, 25, 5, 5, 25, 'F') // Top Left
            doc.triangle(width - 5, 5, width - 25, 5, width - 5, 25, 'F') // Top Right
            doc.triangle(5, height - 5, 25, height - 5, 5, height - 25, 'F') // Bottom Left
            doc.triangle(width - 5, height - 5, width - 25, height - 5, width - 5, height - 25, 'F') // Bottom Right

            // 3. School Logo (if available)
            if (schoolLogo) {
                try {
                    doc.addImage(schoolLogo, 'PNG', (width / 2) - 15, 15, 30, 30)
                } catch (e) {
                    console.error('Error adding logo:', e)
                }
            }

            // 4. Content
            const startY = schoolLogo ? 50 : 30

            doc.setFont('helvetica', 'bold')
            doc.setFontSize(30)
            doc.setTextColor(41, 128, 185)
            doc.text(schoolName.toUpperCase(), width / 2, startY, { align: 'center' })

            doc.setFont('times', 'italic')
            doc.setFontSize(50)
            doc.setTextColor(0, 0, 0)
            doc.text('Certificate of Achievement', width / 2, startY + 25, { align: 'center' })

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(16)
            doc.text('THIS IS TO CERTIFY THAT', width / 2, startY + 45, { align: 'center' })

            doc.setFont('times', 'bolditalic')
            doc.setFontSize(35)
            doc.setTextColor(44, 62, 80)
            doc.text(`${student.firstName} ${student.lastName}`, width / 2, startY + 65, { align: 'center' })

            doc.setLineWidth(0.5)
            doc.line((width / 2) - 60, startY + 68, (width / 2) + 60, startY + 68)

            doc.setFont('helvetica', 'normal')
            doc.setFontSize(16)
            doc.setTextColor(0, 0, 0)

            let typeText = 'FOR OUTSTANDING PERFORMANCE'
            if (certificateType === 'merit') typeText = 'FOR OUTSTANDING MERIT'
            if (certificateType === 'attendance') typeText = 'FOR PERFECT ATTENDANCE'
            if (certificateType === 'sports') typeText = 'FOR EXCELLENCE IN SPORTS'

            doc.text(typeText, width / 2, startY + 85, { align: 'center' })

            doc.setFontSize(14)
            doc.text(reason, width / 2, startY + 95, { align: 'center' })

            // 5. Signatures
            const sigY = height - 40

            doc.setDrawColor(0)
            doc.setLineWidth(0.5)
            doc.line(40, sigY, 100, sigY)
            doc.line(width - 100, sigY, width - 40, sigY)

            doc.setFontSize(12)
            doc.text('Principal', 70, sigY + 7, { align: 'center' })
            doc.text('Date', width - 70, sigY + 7, { align: 'center' })
            doc.text(new Date(issueDate).toLocaleDateString(), width - 70, sigY - 2, { align: 'center' })

            // 6. Seal / Decoration
            doc.setFillColor(241, 196, 15) // Gold
            doc.circle(width / 2, height - 35, 12, 'F')
            doc.setFontSize(8)
            doc.setTextColor(255, 255, 255)
            doc.text('OFFICIAL', width / 2, height - 36, { align: 'center' })
            doc.text('SEAL', width / 2, height - 32, { align: 'center' })

            doc.save(`Certificate_${student.firstName}_${student.lastName}.pdf`)
            if (apiCall) {
                try {
                    await apiCall('results/certificates', {
                        method: 'POST',
                        body: JSON.stringify({
                            studentId: student.id,
                            type: certificateType,
                            title: 'Certificate of Achievement'
                        })
                    })
                } catch (error) {
                    console.error('Error recording certificate:', error)
                }
            }
            modal?.showSuccess('Certificate Generated', `Downloaded certificate for ${student.firstName}`)
        } catch (error) {
            console.error('Error generating certificate:', error)
            modal?.showError('Generation Failed', 'Failed to generate certificate PDF')
        }
    }

    const handleBulkGenerate = () => {
        if (filteredStudents.length === 0) return modal?.showError('No Students', 'No students found to generate certificates')
        if (filteredStudents.length > 50) return modal?.showError('Too Many', 'Please filter to a specific class to avoid browser crashes')

        if (confirm(`Generate and download ${filteredStudents.length} certificates? This may take a moment.`)) {
            filteredStudents.forEach((s, i) => {
                setTimeout(() => generateCertificate(s), i * 1500)
            })
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 border-slate-200">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Certificate Generator</h2>
                        <p className="text-slate-500 text-sm mt-1">Design and issue official certificates to students</p>
                    </div>
                </div>
                <Button
                    onClick={handleBulkGenerate}
                    disabled={filteredStudents.length === 0}
                    className="bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white"
                >
                    <Award className="h-4 w-4 mr-2" />
                    Bulk Generate ({filteredStudents.length})
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Settings Panel */}
                <Card className="lg:col-span-1 border-slate-200/80 bg-white/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Certificate Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Certificate Type</Label>
                            <Select value={certificateType} onValueChange={setCertificateType}>
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="merit">Academic Merit</SelectItem>
                                    <SelectItem value="attendance">Perfect Attendance</SelectItem>
                                    <SelectItem value="sports">Sports Excellence</SelectItem>
                                    <SelectItem value="graduation">Graduation</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Issue Date</Label>
                            <Input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="bg-white border-slate-200"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-600">Reason / Description</Label>
                            <Input
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g. Outstanding Performance in Math"
                                className="bg-white border-slate-200"
                            />
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <Label className="text-slate-600 mb-2 block">Filters</Label>
                            <div className="space-y-3">
                                <Select value={selectedClass} onValueChange={setSelectedClass}>
                                    <SelectTrigger className="bg-white border-slate-200">
                                        <SelectValue placeholder="All Classes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Classes</SelectItem>
                                        {classes.map(cls => (
                                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search students..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-white border-slate-200"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Preview Panel */}
                <div className="lg:col-span-2 space-y-4">
                    <Card className="border-slate-200/80 bg-white/80 overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <ShieldCheck className="h-4 w-4" />
                                Live Design Preview
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="aspect-[1.414/1] w-full max-w-2xl mx-auto bg-white border-8 border-slate-100 shadow-lg rounded p-1 sm:p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                {/* Decorative border internal */}
                                <div className="absolute inset-2 border border-slate-100 pointer-events-none" />

                                {/* School Header */}
                                <div className="mb-4">
                                    {schoolLogo ? (
                                        <img src={schoolLogo} alt="Logo" className="h-10 w-10 mx-auto mb-2 object-contain" />
                                    ) : <GraduationCap className="h-10 w-10 text-slate-200 mx-auto mb-2" />}
                                    <h3 className="text-lg font-bold text-slate-400 uppercase tracking-widest">{schoolName}</h3>
                                </div>

                                <h1 className="text-2xl sm:text-4xl font-serif italic text-slate-800 mb-4">Certificate of Achievement</h1>

                                <p className="text-xs sm:text-sm text-slate-500 mb-4 uppercase tracking-tighter">This is to certify that</p>

                                <div className="mb-6">
                                    <span className="text-xl sm:text-3xl font-serif font-bold italic text-slate-700 border-b-2 border-slate-200 px-8 py-1">
                                        Student Name
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-xs sm:text-sm font-medium text-slate-600 uppercase">
                                        {certificateType === 'merit' ? 'Outstanding Academic Merit' :
                                            certificateType === 'attendance' ? 'Perfect Attendance Record' :
                                                certificateType === 'sports' ? 'Excellence in Athleticism' : 'Academic Excellence'}
                                    </p>
                                    <p className="text-[10px] sm:text-xs text-slate-400 max-w-xs mx-auto italic">{reason}</p>
                                </div>

                                {/* Footer Preview */}
                                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end border-t border-slate-50 pt-2">
                                    <div className="w-20 sm:w-32 border-t border-slate-200">
                                        <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1">Principal</p>
                                    </div>
                                    <div className="w-10 h-10 sm:w-16 sm:h-16 bg-yellow-50 rounded-full flex items-center justify-center">
                                        <ShieldCheck className="h-4 w-4 sm:h-8 sm:w-8 text-yellow-500" />
                                    </div>
                                    <div className="w-20 sm:w-32 border-t border-slate-200">
                                        <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1">{new Date(issueDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Student List for Quick Action */}
                    <Card className="border-slate-200/80 bg-white/80">
                        <CardHeader className="py-4">
                            <CardTitle className="text-sm font-medium flex items-center justify-between">
                                <span>Select Students ({filteredStudents.length})</span>
                                <span className="text-xs font-normal text-slate-400">Click download to generate individual certificate</span>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 max-h-64 overflow-y-auto">
                            <div className="divide-y divide-slate-50">
                                {filteredStudents.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm">No students match your criteria</div>
                                ) : filteredStudents.map(student => (
                                    <div key={student.id} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50/50 group transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
                                                {student.firstName[0]}{student.lastName[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-slate-700">{student.firstName} {student.lastName}</p>
                                                <p className="text-xs text-slate-400">{student.admissionNumber || 'No ID'}</p>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => generateCertificate(student)}
                                            className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                                        >
                                            <Download className="h-3.5 w-3.5 mr-1" />
                                            Download
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
