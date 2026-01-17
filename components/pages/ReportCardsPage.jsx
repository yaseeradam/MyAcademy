'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Download, FileText, Users, GraduationCap, Loader2 } from 'lucide-react'
import { generateClassReportCards } from '@/lib/report-generator'

export default function ReportCardsPage({
    school,
    schoolSettings,
    classes,
    students,
    subjects,
    apiCall,
    modal,
    onBack
}) {
    const [selectedClass, setSelectedClass] = useState('')
    const [classScores, setClassScores] = useState([])
    const [loading, setLoading] = useState(false)
    const [generating, setGenerating] = useState(false)

    const classStudents = students.filter(s => s.classId === selectedClass)
    const schoolName = school?.name || schoolSettings?.schoolName || 'School'
    const schoolLogo = schoolSettings?.logo || school?.logo || null

    // Load scores when class is selected
    useEffect(() => {
        if (selectedClass) {
            loadClassScores()
        }
    }, [selectedClass])

    const loadClassScores = async () => {
        setLoading(true)
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`/api/gradebook/scores?classId=${selectedClass}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setClassScores(data.scores || [])
            }
        } catch (error) {
            console.error('Error loading scores:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleGenerateReportCards = async () => {
        if (!selectedClass || classStudents.length === 0) {
            modal?.showError('No Students', 'Please select a class with students')
            return
        }

        if (classScores.length === 0) {
            modal?.showError('No Scores', 'No scores have been recorded for this class. Please add scores in the Gradebook first.')
            return
        }

        setGenerating(true)
        modal?.showLoading('Generating Report Cards...')

        try {
            const className = classes.find(c => c.id === selectedClass)?.name || 'Class'

            // Generate the PDF with school logo
            generateClassReportCards(
                classStudents,
                subjects,
                classScores,
                schoolName,
                className,
                [], // grading scale - can be added later
                schoolLogo
            )

            modal?.showSuccess('Report Cards Generated', `Successfully generated report cards for ${classStudents.length} students`)
        } catch (error) {
            console.error('Error generating report cards:', error)
            modal?.showError('Generation Failed', 'Failed to generate report cards. Please try again.')
        } finally {
            setGenerating(false)
        }
    }

    const selectedClassName = classes.find(c => c.id === selectedClass)?.name

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
                        <h2 className="text-2xl font-bold text-slate-900">Report Cards</h2>
                        <p className="text-slate-500 text-sm mt-1">Generate student report cards with all subjects and marks</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Selection Panel */}
                <Card className="lg:col-span-1 border-slate-200/80 bg-white/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Select Class</CardTitle>
                        <CardDescription className="text-slate-500">Choose a class to generate report cards</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Class</Label>
                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                <SelectTrigger className="bg-white border-slate-200">
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

                        {selectedClass && (
                            <div className="pt-4 space-y-3">
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm text-slate-600">Students</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">{classStudents.length}</span>
                                </div>
                                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-slate-500" />
                                        <span className="text-sm text-slate-600">Scores Recorded</span>
                                    </div>
                                    <span className="font-semibold text-slate-800">
                                        {loading ? '...' : classScores.length}
                                    </span>
                                </div>
                            </div>
                        )}

                        <Button
                            className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white mt-4"
                            onClick={handleGenerateReportCards}
                            disabled={!selectedClass || loading || generating || classStudents.length === 0}
                        >
                            {generating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4 mr-2" />
                                    Generate Report Cards
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview Panel */}
                <Card className="lg:col-span-2 border-slate-200/80 bg-white/80 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle className="text-lg text-slate-800">Preview</CardTitle>
                        <CardDescription className="text-slate-500">Report card will include the following information</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {!selectedClass ? (
                            <div className="text-center py-12">
                                <GraduationCap className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">Select a class to see preview information</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* School Header Preview */}
                                <div className="p-4 rounded-lg bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200">
                                    <div className="flex items-center gap-4 mb-3">
                                        {schoolLogo ? (
                                            <img src={schoolLogo} alt="School Logo" className="h-12 w-12 rounded-lg object-cover" />
                                        ) : (
                                            <div className="h-12 w-12 rounded-lg bg-teal-200 flex items-center justify-center">
                                                <GraduationCap className="h-6 w-6 text-teal-600" />
                                            </div>
                                        )}
                                        <div>
                                            <h3 className="font-bold text-slate-800">{schoolName}</h3>
                                            <p className="text-sm text-slate-500">Official Report Card</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Content Preview */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                        <h4 className="font-medium text-slate-700 mb-2">Student Information</h4>
                                        <ul className="text-sm text-slate-500 space-y-1">
                                            <li>• Student Name</li>
                                            <li>• Admission Number</li>
                                            <li>• Class: {selectedClassName}</li>
                                            <li>• Gender</li>
                                            <li>• Session: {new Date().getFullYear()}</li>
                                        </ul>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                        <h4 className="font-medium text-slate-700 mb-2">Subject Scores</h4>
                                        <ul className="text-sm text-slate-500 space-y-1">
                                            <li>• 1st CA / 2nd CA</li>
                                            <li>• Notebook Score</li>
                                            <li>• 1st Project / 2nd Project</li>
                                            <li>• Exam Score</li>
                                            <li>• Total & Grade</li>
                                        </ul>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                    <h4 className="font-medium text-slate-700 mb-2">Summary & Signatures</h4>
                                    <ul className="text-sm text-slate-500 space-y-1">
                                        <li>• Total Score & Average</li>
                                        <li>• Class Position (Rank)</li>
                                        <li>• Principal's Remark</li>
                                        <li>• Tutor's Signature Line</li>
                                        <li>• Principal's Signature Line</li>
                                    </ul>
                                </div>

                                {/* Students list */}
                                {classStudents.length > 0 && (
                                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                                        <h4 className="font-medium text-slate-700 mb-2">Students ({classStudents.length})</h4>
                                        <div className="max-h-40 overflow-y-auto">
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                                {classStudents.slice(0, 9).map(student => (
                                                    <div key={student.id} className="text-sm text-slate-500 truncate">
                                                        {student.firstName} {student.lastName}
                                                    </div>
                                                ))}
                                                {classStudents.length > 9 && (
                                                    <div className="text-sm text-slate-400 italic">
                                                        +{classStudents.length - 9} more...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
