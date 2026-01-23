'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import {
    GraduationCap,
    ArrowRight,
    Users,
    Calendar,
    CheckCircle2,
    XCircle,
    RotateCcw,
    AlertTriangle,
    Loader2,
    ChevronRight,
    School,
    History
} from 'lucide-react'

export default function StudentPromotionPage({ apiCall, classes, students, loadDashboardData }) {
    const [loading, setLoading] = useState(false)
    const [promotionPreview, setPromotionPreview] = useState(null)
    const [showPromotionModal, setShowPromotionModal] = useState(false)
    const [showHistoryModal, setShowHistoryModal] = useState(false)
    const [promotionHistory, setPromotionHistory] = useState([])
    const [academicYears, setAcademicYears] = useState([])
    const [selectedYear, setSelectedYear] = useState('')
    const [newAcademicYear, setNewAcademicYear] = useState('')
    const [promotionSelections, setPromotionSelections] = useState({})
    const [executing, setExecuting] = useState(false)

    // Sort classes by grade level
    const sortedClasses = [...classes].sort((a, b) => (a.gradeLevel || 0) - (b.gradeLevel || 0))

    // Load academic years
    useEffect(() => {
        loadAcademicYears()
    }, [])

    const loadAcademicYears = async () => {
        try {
            const data = await apiCall('academic-years')
            setAcademicYears(data || [])
            const activeYear = data?.find(y => y.status === 'active')
            if (activeYear) setSelectedYear(activeYear.name)
        } catch (error) {
            console.error('Failed to load academic years:', error)
        }
    }

    const loadPromotionHistory = async () => {
        try {
            const data = await apiCall('promotion/history')
            setPromotionHistory(data || [])
        } catch (error) {
            console.error('Failed to load promotion history:', error)
        }
    }

    const previewPromotion = async () => {
        if (!selectedYear) {
            toast.error('Please select an academic year')
            return
        }
        if (!newAcademicYear) {
            toast.error('Please enter the new academic year')
            return
        }

        setLoading(true)
        try {
            const data = await apiCall(`promotion/preview?academicYear=${encodeURIComponent(selectedYear)}`)
            setPromotionPreview(data)

            // Initialize selections - all promoted by default
            const selections = {}
            data.students.forEach(student => {
                selections[student.id] = student.suggestedAction || 'promote'
            })
            setPromotionSelections(selections)
            setShowPromotionModal(true)
        } catch (error) {
            toast.error('Failed to preview promotion')
        } finally {
            setLoading(false)
        }
    }

    const executePromotion = async () => {
        setExecuting(true)
        try {
            const promotionData = {
                fromAcademicYear: selectedYear,
                toAcademicYear: newAcademicYear,
                students: Object.entries(promotionSelections).map(([studentId, action]) => ({
                    studentId,
                    action
                }))
            }

            await apiCall('promotion/execute', {
                method: 'POST',
                body: JSON.stringify(promotionData)
            })

            toast.success('🎓 Student promotion completed successfully!')
            setShowPromotionModal(false)
            setPromotionPreview(null)
            loadDashboardData(true)
            loadAcademicYears()
        } catch (error) {
            toast.error('Failed to execute promotion: ' + error.message)
        } finally {
            setExecuting(false)
        }
    }

    const getActionBadge = (action) => {
        switch (action) {
            case 'promote':
                return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200"><ArrowRight className="h-3 w-3 mr-1" />Promote</Badge>
            case 'repeat':
                return <Badge className="bg-amber-100 text-amber-700 border-amber-200"><RotateCcw className="h-3 w-3 mr-1" />Repeat</Badge>
            case 'graduate':
                return <Badge className="bg-sky-100 text-sky-700 border-sky-200"><GraduationCap className="h-3 w-3 mr-1" />Graduate</Badge>
            default:
                return <Badge className="bg-slate-100 text-slate-700 border-slate-200">Unknown</Badge>
        }
    }

    const getStudentsByClass = (classId) => {
        return students.filter(s => s.classId === classId)
    }

    const getClassById = (classId) => {
        return classes.find(c => c.id === classId)
    }

    const summaryCounts = promotionPreview ? {
        promote: Object.values(promotionSelections).filter(a => a === 'promote').length,
        repeat: Object.values(promotionSelections).filter(a => a === 'repeat').length,
        graduate: Object.values(promotionSelections).filter(a => a === 'graduate').length
    } : { promote: 0, repeat: 0, graduate: 0 }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Student Promotion</h2>
                    <p className="text-slate-500 text-sm mt-1">Promote students to the next class at the end of academic year</p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            loadPromotionHistory()
                            setShowHistoryModal(true)
                        }}
                        className="bg-white border-slate-200 text-slate-600 hover:bg-slate-100"
                    >
                        <History className="h-4 w-4 mr-2" />
                        History
                    </Button>
                </div>
            </div>

            {/* Class Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedClasses.map((cls) => {
                    const classStudents = getStudentsByClass(cls.id)
                    const nextClass = getClassById(cls.nextClassId)

                    return (
                        <Card key={cls.id} className="border border-slate-200/80 bg-white/80 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg text-slate-900">{cls.name}</CardTitle>
                                    {cls.isFinalClass && (
                                        <Badge className="bg-violet-100 text-violet-700 border-violet-200">
                                            <GraduationCap className="h-3 w-3 mr-1" />Final
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="text-slate-500">
                                    Grade Level: {cls.gradeLevel || 'Not set'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-600">Students</span>
                                        <Badge className="bg-sky-100 text-sky-700 border-sky-200">
                                            <Users className="h-3 w-3 mr-1" />{classStudents.length}
                                        </Badge>
                                    </div>
                                    {nextClass && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Promotes to</span>
                                            <div className="flex items-center text-emerald-600">
                                                <ChevronRight className="h-4 w-4" />
                                                <span className="font-medium">{nextClass.name}</span>
                                            </div>
                                        </div>
                                    )}
                                    {cls.isFinalClass && (
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-slate-600">Students will</span>
                                            <span className="text-violet-600 font-medium">Graduate</span>
                                        </div>
                                    )}
                                    {!nextClass && !cls.isFinalClass && (
                                        <div className="flex items-center text-amber-600 text-sm">
                                            <AlertTriangle className="h-4 w-4 mr-1" />
                                            <span>No next class configured</span>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Promotion Action Card */}
            <Card className="border border-slate-200/80 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-amber-600" />
                        End of Year Promotion
                    </CardTitle>
                    <CardDescription className="text-slate-600">
                        Move all students to their next class when the academic year ends
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-2">
                            <Label className="text-slate-700">Current Academic Year</Label>
                            <Select value={selectedYear} onValueChange={setSelectedYear}>
                                <SelectTrigger className="bg-white border-slate-200">
                                    <SelectValue placeholder="Select year" />
                                </SelectTrigger>
                                <SelectContent>
                                    {academicYears.map(year => (
                                        <SelectItem key={year.id} value={year.name}>{year.name}</SelectItem>
                                    ))}
                                    {academicYears.length === 0 && (
                                        <SelectItem value="2024/2025">2024/2025</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700">New Academic Year</Label>
                            <Input
                                value={newAcademicYear}
                                onChange={(e) => setNewAcademicYear(e.target.value)}
                                placeholder="e.g., 2025/2026"
                                className="bg-white border-slate-200"
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                onClick={previewPromotion}
                                disabled={loading || !selectedYear || !newAcademicYear}
                                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                            >
                                {loading ? (
                                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Loading...</>
                                ) : (
                                    <><ArrowRight className="h-4 w-4 mr-2" />Preview Promotion</>
                                )}
                            </Button>
                        </div>
                    </div>

                    <div className="bg-white/60 rounded-lg p-4 border border-amber-200/50">
                        <h4 className="font-medium text-slate-800 mb-2">How it works:</h4>
                        <ul className="text-sm text-slate-600 space-y-1">
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Students are moved to their next class based on class configuration</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Students in final classes will be marked as graduated</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>You can mark individual students to repeat instead of promote</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                                <span>Historical records (attendance, grades) are preserved</span>
                            </li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Promotion Preview Modal */}
            <Dialog open={showPromotionModal} onOpenChange={setShowPromotionModal}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-amber-600" />
                            Promotion Preview: {selectedYear} → {newAcademicYear}
                        </DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Review and adjust student promotions before executing
                        </DialogDescription>
                    </DialogHeader>

                    {promotionPreview && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <Card className="bg-emerald-50 border-emerald-200">
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-emerald-700">{summaryCounts.promote}</div>
                                        <div className="text-sm text-emerald-600">To Promote</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-amber-50 border-amber-200">
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-amber-700">{summaryCounts.repeat}</div>
                                        <div className="text-sm text-amber-600">To Repeat</div>
                                    </CardContent>
                                </Card>
                                <Card className="bg-violet-50 border-violet-200">
                                    <CardContent className="p-4 text-center">
                                        <div className="text-2xl font-bold text-violet-700">{summaryCounts.graduate}</div>
                                        <div className="text-sm text-violet-600">To Graduate</div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Students Table */}
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="text-slate-700">Student</TableHead>
                                            <TableHead className="text-slate-700">Current Class</TableHead>
                                            <TableHead className="text-slate-700">Next Class</TableHead>
                                            <TableHead className="text-slate-700">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {promotionPreview.students.map((student) => {
                                            const currentClass = getClassById(student.classId)
                                            const nextClass = getClassById(currentClass?.nextClassId)
                                            const action = promotionSelections[student.id] || 'promote'

                                            return (
                                                <TableRow key={student.id} className="hover:bg-slate-50">
                                                    <TableCell className="font-medium text-slate-900">{student.name}</TableCell>
                                                    <TableCell className="text-slate-600">{currentClass?.name || 'Unknown'}</TableCell>
                                                    <TableCell className="text-slate-600">
                                                        {action === 'promote' && nextClass ? nextClass.name :
                                                            action === 'repeat' ? currentClass?.name :
                                                                action === 'graduate' ? '🎓 Graduated' : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Select
                                                            value={action}
                                                            onValueChange={(value) => setPromotionSelections(prev => ({
                                                                ...prev,
                                                                [student.id]: value
                                                            }))}
                                                        >
                                                            <SelectTrigger className="w-32 h-8 text-sm">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {!currentClass?.isFinalClass && nextClass && (
                                                                    <SelectItem value="promote">
                                                                        <span className="flex items-center gap-1">
                                                                            <ArrowRight className="h-3 w-3 text-emerald-500" />Promote
                                                                        </span>
                                                                    </SelectItem>
                                                                )}
                                                                <SelectItem value="repeat">
                                                                    <span className="flex items-center gap-1">
                                                                        <RotateCcw className="h-3 w-3 text-amber-500" />Repeat
                                                                    </span>
                                                                </SelectItem>
                                                                {currentClass?.isFinalClass && (
                                                                    <SelectItem value="graduate">
                                                                        <span className="flex items-center gap-1">
                                                                            <GraduationCap className="h-3 w-3 text-violet-500" />Graduate
                                                                        </span>
                                                                    </SelectItem>
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </>
                    )}

                    <DialogFooter className="gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowPromotionModal(false)}
                            className="border-slate-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={executePromotion}
                            disabled={executing}
                            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                        >
                            {executing ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Executing...</>
                            ) : (
                                <><CheckCircle2 className="h-4 w-4 mr-2" />Execute Promotion</>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Promotion History Modal */}
            <Dialog open={showHistoryModal} onOpenChange={setShowHistoryModal}>
                <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Promotion History</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Past student promotions for this school
                        </DialogDescription>
                    </DialogHeader>

                    {promotionHistory.length === 0 ? (
                        <div className="text-center py-8">
                            <History className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500">No promotion history yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {promotionHistory.map((record) => (
                                <Card key={record.id} className="border-slate-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-900">
                                                {record.fromAcademicYear} → {record.toAcademicYear}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                {new Date(record.promotedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex gap-4 text-sm">
                                            <span className="text-emerald-600">
                                                {record.summary?.promoted || 0} promoted
                                            </span>
                                            <span className="text-amber-600">
                                                {record.summary?.repeated || 0} repeated
                                            </span>
                                            <span className="text-violet-600">
                                                {record.summary?.graduated || 0} graduated
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowHistoryModal(false)}
                            className="border-slate-200"
                        >
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Empty State for Classes */}
            {classes.length === 0 && (
                <Card className="border border-slate-200/80 bg-white/80">
                    <CardContent className="p-8 text-center">
                        <School className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-700">No classes configured yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                            Create classes and set up grade levels before using promotion
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
