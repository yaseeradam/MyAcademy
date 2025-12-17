'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, CheckCircle, XCircle, Clock, Activity, Users, School } from 'lucide-react'

export default function AttendancePage({ 
  user,
  attendance,
  students,
  teachers,
  classes,
  showAttendanceModal,
  setShowAttendanceModal,
  attendanceDate,
  setAttendanceDate,
  selectedClass,
  setSelectedClass,
  attendanceList,
  setAttendanceList,
  handleMarkAttendance,
  loadAttendanceByDate
}) {
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [filterClass, setFilterClass] = useState('all')
  const [filteredAttendance, setFilteredAttendance] = useState(attendance)
  // Load attendance when date changes
  useEffect(() => {
    if (loadAttendanceByDate) {
      loadAttendanceByDate(filterDate)
    }
  }, [filterDate])

  useEffect(() => {
    const filtered = attendance.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0]
      const dateMatch = recordDate === filterDate
      
      // For admin viewing student attendance, filter by class
      if (user.role === 'school_admin' && filterClass !== 'all') {
        return dateMatch && record.studentId && record.classId === filterClass
      }
      
      return dateMatch
    })
    setFilteredAttendance(filtered)
  }, [filterDate, filterClass, attendance, user.role])

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Attendance Management</h2>
          <p className="text-sm text-gray-600 mt-1">
            {user.role === 'school_admin' ? 'Mark and track teacher attendance' : 'Mark and track student attendance'}
          </p>
        </div>
        <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              const today = new Date().toISOString().split('T')[0]
              setSelectedClass('')
              setAttendanceList([])
              setAttendanceDate(today)
              setShowAttendanceModal(true)
            }} size="lg">
              <Calendar className="h-4 w-4 mr-2" />
              Mark {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-lg sm:text-xl">Mark {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance</DialogTitle>
              <DialogDescription className="text-sm">
                {user.role === 'school_admin' ? 'Select date to mark attendance for all teachers.' : 'Select class and date to mark attendance for students.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 sm:space-y-6 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-140px)] pr-1">
              <div className={user.role === 'school_admin' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
                {user.role === 'teacher' && (
                  <div className="space-y-2">
                    <Label className="text-sm sm:text-base font-medium">Select Class</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) => {
                        setSelectedClass(value)
                        setAttendanceList([])
                      }}
                    >
                      <SelectTrigger className="h-10 sm:h-11">
                        <SelectValue placeholder="Choose a class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>
                            {cls.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base font-medium">Date</Label>
                  <Input
                    type="date"
                    className="h-10 sm:h-11"
                    value={attendanceDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => {
                      setAttendanceDate(e.target.value)
                    }}
                  />
                </div>
              </div>

              {((user.role === 'school_admin' && attendanceDate) || (user.role === 'teacher' && selectedClass && attendanceDate)) && (
                <div className="space-y-4">
                  {attendanceList.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="animate-pulse">
                        <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm sm:text-base">Loading {user.role === 'school_admin' ? 'teachers' : 'students'}...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gray-50 p-3 sm:p-4 rounded-lg gap-3">
                        <h3 className="font-semibold text-base sm:text-lg">
                          {user.role === 'school_admin' ? `${attendanceList.length} Teachers` : `${attendanceList.length} Students`}
                        </h3>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                            onClick={() => {
                              const newList = attendanceList.map(item => ({ ...item, status: 'present' }))
                              setAttendanceList(newList)
                            }}
                          >
                            All Present
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 sm:flex-none text-xs sm:text-sm"
                            onClick={() => {
                              const newList = attendanceList.map(item => ({ ...item, status: 'absent' }))
                              setAttendanceList(newList)
                            }}
                          >
                            All Absent
                          </Button>
                        </div>
                      </div>
                      <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2">
                        {attendanceList.map((item, index) => (
                          <div key={item.teacherId || item.studentId} className="p-3 sm:p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                                <AvatarFallback className="bg-blue-100 text-blue-700 font-medium text-sm">
                                  {(item.teacherName || item.studentName).split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0 flex-1">
                                <span className="font-medium text-sm sm:text-base block truncate">{item.teacherName || item.studentName}</span>
                              </div>
                            </div>
                            {/* Mobile-friendly status selector - icon buttons in a grid */}
                            <div className="grid grid-cols-4 gap-2">
                              <button
                                type="button"
                                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                  item.status === 'present' 
                                    ? 'border-green-500 bg-green-50 text-green-700' 
                                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/50'
                                }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'present'
                                  setAttendanceList(newList)
                                }}
                              >
                                <CheckCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${item.status === 'present' ? 'text-green-600' : 'text-gray-400'}`} />
                                <span className="text-[10px] sm:text-xs mt-1 font-medium">Present</span>
                              </button>
                              <button
                                type="button"
                                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                  item.status === 'absent' 
                                    ? 'border-red-500 bg-red-50 text-red-700' 
                                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50/50'
                                }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'absent'
                                  setAttendanceList(newList)
                                }}
                              >
                                <XCircle className={`h-5 w-5 sm:h-6 sm:w-6 ${item.status === 'absent' ? 'text-red-600' : 'text-gray-400'}`} />
                                <span className="text-[10px] sm:text-xs mt-1 font-medium">Absent</span>
                              </button>
                              <button
                                type="button"
                                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                  item.status === 'late' 
                                    ? 'border-yellow-500 bg-yellow-50 text-yellow-700' 
                                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50'
                                }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'late'
                                  setAttendanceList(newList)
                                }}
                              >
                                <Clock className={`h-5 w-5 sm:h-6 sm:w-6 ${item.status === 'late' ? 'text-yellow-600' : 'text-gray-400'}`} />
                                <span className="text-[10px] sm:text-xs mt-1 font-medium">Late</span>
                              </button>
                              <button
                                type="button"
                                className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg border-2 transition-all ${
                                  item.status === 'sick' 
                                    ? 'border-orange-500 bg-orange-50 text-orange-700' 
                                    : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50/50'
                                }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'sick'
                                  setAttendanceList(newList)
                                }}
                              >
                                <Activity className={`h-5 w-5 sm:h-6 sm:w-6 ${item.status === 'sick' ? 'text-orange-600' : 'text-gray-400'}`} />
                                <span className="text-[10px] sm:text-xs mt-1 font-medium">Sick</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      {/* Summary stats - mobile friendly grid */}
                      <div className="pt-4 border-t space-y-4">
                        <div className="grid grid-cols-4 gap-2 text-center">
                          <div className="bg-green-50 rounded-lg p-2">
                            <div className="text-lg sm:text-xl font-bold text-green-600">{attendanceList.filter(i => i.status === 'present').length}</div>
                            <div className="text-[10px] sm:text-xs text-green-700">Present</div>
                          </div>
                          <div className="bg-red-50 rounded-lg p-2">
                            <div className="text-lg sm:text-xl font-bold text-red-600">{attendanceList.filter(i => i.status === 'absent').length}</div>
                            <div className="text-[10px] sm:text-xs text-red-700">Absent</div>
                          </div>
                          <div className="bg-yellow-50 rounded-lg p-2">
                            <div className="text-lg sm:text-xl font-bold text-yellow-600">{attendanceList.filter(i => i.status === 'late').length}</div>
                            <div className="text-[10px] sm:text-xs text-yellow-700">Late</div>
                          </div>
                          <div className="bg-orange-50 rounded-lg p-2">
                            <div className="text-lg sm:text-xl font-bold text-orange-600">{attendanceList.filter(i => i.status === 'sick').length}</div>
                            <div className="text-[10px] sm:text-xs text-orange-700">Sick</div>
                          </div>
                        </div>
                        <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end">
                          <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowAttendanceModal(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleMarkAttendance} className="w-full sm:w-auto">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Save Attendance
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              {user.role === 'teacher' && !selectedClass && (
                <div className="text-center py-8">
                  <School className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Please select a class to view students</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date and Class Filter */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <Label className="text-base font-medium whitespace-nowrap">View Attendance for:</Label>
            <Input
              type="date"
              value={filterDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilterDate(e.target.value)}
              className="max-w-xs"
            />
            {user.role === 'school_admin' && (
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes (Teachers)</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button 
              variant="outline" 
              onClick={() => {
                setFilterDate(new Date().toISOString().split('T')[0])
                setFilterClass('all')
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {filteredAttendance.filter(a => a.status === 'present').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user.role === 'school_admin' ? 'Teachers present' : 'Students present'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <XCircle className="h-5 w-5 mr-2 text-red-600" />
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {filteredAttendance.filter(a => a.status === 'absent').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user.role === 'school_admin' ? 'Teachers absent' : 'Students absent'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2 text-yellow-600" />
              Late Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {filteredAttendance.filter(a => a.status === 'late').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user.role === 'school_admin' ? 'Teachers late' : 'Students late'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-orange-600" />
              Sick Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {filteredAttendance.filter(a => a.status === 'sick').length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {user.role === 'school_admin' ? 'Teachers sick' : 'Students sick'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Details - {new Date(filterDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {user.role === 'school_admin' && filterClass !== 'all' && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                ({classes.find(c => c.id === filterClass)?.name})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{user.role === 'school_admin' ? 'Teacher' : 'Student'}</TableHead>
                  {user.role === 'teacher' && <TableHead>Class</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  const person = user.role === 'school_admin' 
                    ? teachers.find(t => t.id === record.teacherId)
                    : students.find(s => s.id === record.studentId)
                  const className = user.role === 'teacher' ? classes.find(c => c.id === record.classId)?.name : null
                  
                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
                      </TableCell>
                      {user.role === 'teacher' && <TableCell>{className || 'N/A'}</TableCell>}
                      <TableCell>
                        <Badge 
                          variant={record.status === 'present' ? 'default' : record.status === 'absent' ? 'destructive' : record.status === 'sick' ? 'default' : 'secondary'}
                          className={record.status === 'sick' ? 'bg-orange-600' : ''}
                        >
                          {record.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {record.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                          {record.status === 'late' && <Clock className="h-3 w-3 mr-1" />}
                          {record.status === 'sick' && <Activity className="h-3 w-3 mr-1" />}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {record.markedBy === user.id ? 'You' : 'Admin'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No attendance marked for {new Date(filterDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500 mt-1">Select a different date or click "Mark Attendance" to add records</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
