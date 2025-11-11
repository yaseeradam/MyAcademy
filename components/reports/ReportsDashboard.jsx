'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  FileText,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  BarChart3,
  PieChart,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [reportData, setReportData] = useState(null)

  // Report parameters
  const [reportType, setReportType] = useState('summary')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [classId, setClassId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [format, setFormat] = useState('json')

  // Available options
  const [classes, setClasses] = useState([])
  const [students, setStudents] = useState([])

  useEffect(() => {
    loadOptions()
  }, [])

  const loadOptions = async () => {
    try {
      // Load classes
      const classesResponse = await fetch('/api/classes', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        setClasses(classesData.classes || [])
      }

      // Load students
      const studentsResponse = await fetch('/api/students', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })
      if (studentsResponse.ok) {
        const studentsData = await studentsResponse.json()
        setStudents(studentsData.students || [])
      }
    } catch (error) {
      console.error('Error loading options:', error)
    }
  }

  const generateReport = async (reportCategory, type) => {
    setLoading(true)
    setError('')

    try {
      const params = new URLSearchParams({
        type,
        format
      })

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (classId) params.append('classId', classId)
      if (studentId) params.append('studentId', studentId)

      const response = await fetch(`/api/reports/${reportCategory}?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate report')
      }

      const data = await response.json()
      setReportData({ category: reportCategory, type, data })

    } catch (error) {
      console.error('Error generating report:', error)
      setError(error.message || 'Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = async (reportCategory, type) => {
    try {
      const params = new URLSearchParams({
        type,
        format: 'csv'
      })

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)
      if (classId) params.append('classId', classId)
      if (studentId) params.append('studentId', studentId)

      const response = await fetch(`/api/reports/${reportCategory}?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) {
        throw new Error('Failed to download report')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${reportCategory}_report_${type}_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

    } catch (error) {
      console.error('Error downloading report:', error)
      setError('Failed to download report')
    }
  }

  const renderReportData = () => {
    if (!reportData) return null

    const { category, type, data } = reportData

    switch (category) {
      case 'attendance':
        return renderAttendanceReport(data, type)
      case 'payments':
        return renderPaymentReport(data, type)
      case 'school-stats':
        return renderSchoolStatsReport(data, type)
      default:
        return <div>Unknown report type</div>
    }
  }

  const renderAttendanceReport = (data, type) => {
    switch (type) {
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary?.totalClasses || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Average Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary?.averageAttendanceRate?.toFixed(1) || 0}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.data?.reduce((sum, cls) => sum + cls.totalRecords, 0) || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Class-wise Attendance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Class</TableHead>
                      <TableHead>Present</TableHead>
                      <TableHead>Absent</TableHead>
                      <TableHead>Late</TableHead>
                      <TableHead>Excused</TableHead>
                      <TableHead>Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data?.map((cls, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{cls.className || cls.classId}</TableCell>
                        <TableCell>{cls.totalPresent || 0}</TableCell>
                        <TableCell>{cls.totalAbsent || 0}</TableCell>
                        <TableCell>{cls.totalLate || 0}</TableCell>
                        <TableCell>{cls.totalExcused || 0}</TableCell>
                        <TableCell>
                          <Badge variant={cls.attendanceRate >= 80 ? 'default' : 'destructive'}>
                            {cls.attendanceRate?.toFixed(1) || 0}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      case 'detailed':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Detailed Attendance Records</CardTitle>
              <CardDescription>
                Total records: {data.summary?.totalRecords || 0} |
                Present: {data.summary?.presentCount || 0} |
                Absent: {data.summary?.absentCount || 0} |
                Late: {data.summary?.lateCount || 0} |
                Excused: {data.summary?.excusedCount || 0}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.data?.slice(0, 100).map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>{record.studentName}</TableCell>
                      <TableCell>{record.studentId}</TableCell>
                      <TableCell>{record.className}</TableCell>
                      <TableCell>
                        <Badge variant={
                          record.status === 'present' ? 'default' :
                          record.status === 'absent' ? 'destructive' :
                          record.status === 'late' ? 'secondary' : 'outline'
                        }>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.teacherName}</TableCell>
                      <TableCell>{record.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {data.data?.length > 100 && (
                <p className="text-sm text-gray-600 mt-4">
                  Showing first 100 records. Download CSV for complete data.
                </p>
              )}
            </CardContent>
          </Card>
        )

      default:
        return <div>Report type not supported</div>
    }
  }

  const renderPaymentReport = (data, type) => {
    switch (type) {
      case 'summary':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${data.summary?.totalRevenue?.toFixed(2) || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary?.totalTransactions || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary?.successRate?.toFixed(1) || 0}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.summary?.completedTransactions || 0}</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Payment Provider Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Total Amount</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Failed</TableHead>
                      <TableHead>Pending</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.data?.map((provider, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{provider.provider}</TableCell>
                        <TableCell>${provider.totalAmount?.toFixed(2) || 0}</TableCell>
                        <TableCell>{provider.totalTransactions || 0}</TableCell>
                        <TableCell>{provider.completedPayments || 0}</TableCell>
                        <TableCell>{provider.failedPayments || 0}</TableCell>
                        <TableCell>{provider.pendingPayments || 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return <div>Report type not supported</div>
    }
  }

  const renderSchoolStatsReport = (data, type) => {
    switch (type) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.overview?.totalStudents || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.overview?.totalTeachers || 0}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.overview?.attendanceRate?.toFixed(1) || 0}%</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${data.overview?.totalRevenue?.toFixed(2) || 0}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Key Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Student-Teacher Ratio:</span>
                    <span className="font-medium">{data.summary?.studentTeacherRatio || 0}:1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Class Size:</span>
                    <span className="font-medium">{data.summary?.averageClassSize || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Class Utilization:</span>
                    <span className="font-medium">{data.summary?.overallUtilization?.toFixed(1) || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Users:</span>
                    <span className="font-medium">{data.overview?.activeUsers || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Class Utilization (Top 5)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.classUtilization?.map((cls, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm">{cls.className}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(cls.utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{cls.utilizationRate?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )

      default:
        return <div>Report type not supported</div>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
          <p className="text-gray-600">Generate comprehensive reports for your school management system</p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">School Overview</TabsTrigger>
          <TabsTrigger value="attendance">Attendance Reports</TabsTrigger>
          <TabsTrigger value="payments">Payment Reports</TabsTrigger>
        </TabsList>

        {/* Report Parameters */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Report Parameters</CardTitle>
            <CardDescription>Configure your report settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="summary">Summary</SelectItem>
                    <SelectItem value="detailed">Detailed</SelectItem>
                    <SelectItem value="student">Student-specific</SelectItem>
                    <SelectItem value="class">Class-specific</SelectItem>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="trends">Trends</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="format">Export Format</Label>
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="pdf">PDF (Coming Soon)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeTab === 'attendance' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="class">Class (Optional)</Label>
                    <Select value={classId} onValueChange={setClassId}>
                      <SelectTrigger>
                        <SelectValue placeholder="All classes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All classes</SelectItem>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {reportType === 'student' && (
                    <div className="space-y-2">
                      <Label htmlFor="student">Student</Label>
                      <Select value={studentId} onValueChange={setStudentId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                          {students.map((student) => (
                            <SelectItem key={student.id} value={student.id}>
                              {student.firstName} {student.lastName} ({student.admissionNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex space-x-4 mt-6">
              <Button
                onClick={() => generateReport(activeTab === 'overview' ? 'school-stats' : activeTab, reportType)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                <span>Generate Report</span>
              </Button>

              <Button
                variant="outline"
                onClick={() => downloadReport(activeTab === 'overview' ? 'school-stats' : activeTab, reportType)}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download CSV</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Report Content */}
        <TabsContent value="overview" className="mt-6">
          {renderReportData()}
        </TabsContent>

        <TabsContent value="attendance" className="mt-6">
          {renderReportData()}
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          {renderReportData()}
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ReportsDashboard
