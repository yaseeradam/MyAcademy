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
import { Calendar, CheckCircle, XCircle, Clock, Activity, Users, School, Filter, Check } from 'lucide-react'

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Attendance Management</h2>
          <p className="text-blue-200/60 text-sm mt-1">
            {user.role === 'school_admin' ? 'Mark and track teacher attendance' : 'Mark and track student attendance'}
          </p>
        </div>
        <Dialog open={showAttendanceModal} onOpenChange={setShowAttendanceModal}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                const today = new Date().toISOString().split('T')[0]
                setSelectedClass('')
                setAttendanceList([])
                setAttendanceDate(today)
                setShowAttendanceModal(true)
              }}
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Mark {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-5xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden bg-[#0f1d32] border-white/10 text-white p-0 flex flex-col">
            <div className="p-6 border-b border-white/10 flex-shrink-0">
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl text-white flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-emerald-400" />
                  </div>
                  Mark {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance
                </DialogTitle>
                <DialogDescription className="text-blue-200/60 mt-1">
                  {user.role === 'school_admin' ? 'Select date to mark attendance for all teachers.' : 'Select class and date to mark attendance for students.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className={user.role === 'school_admin' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 sm:grid-cols-2 gap-6'}>
                  {user.role === 'teacher' && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-blue-200/80">Select Class</Label>
                      <Select
                        value={selectedClass}
                        onValueChange={(value) => {
                          setSelectedClass(value)
                          setAttendanceList([])
                        }}
                      >
                        <SelectTrigger className="h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors">
                          <SelectValue placeholder="Choose a class" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0f1d32] border-white/10">
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id} className="text-white hover:bg-white/10 focus:bg-white/10 py-3 cursor-pointer">
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-blue-200/80">Date</Label>
                    <Input
                      type="date"
                      className="h-11 bg-white/5 border-white/10 text-white hover:bg-white/10 transition-colors"
                      value={attendanceDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => {
                        setAttendanceDate(e.target.value)
                      }}
                    />
                  </div>
                </div>

                {((user.role === 'school_admin' && attendanceDate) || (user.role === 'teacher' && selectedClass && attendanceDate)) && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {attendanceList.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-xl border border-white/5 border-dashed">
                        <div className="animate-pulse">
                          <Users className="h-12 w-12 sm:h-16 sm:w-16 text-blue-200/20 mx-auto mb-4" />
                          <p className="text-blue-200/60 text-base font-medium">Loading {user.role === 'school_admin' ? 'teachers' : 'students'}...</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-emerald-500/5 p-4 rounded-xl gap-4 border border-emerald-500/10">
                          <div className="flex items-center gap-3">
                            <div className="bg-emerald-500/20 p-2 rounded-lg">
                              <Users className="h-5 w-5 text-emerald-400" />
                            </div>
                            <h3 className="font-semibold text-lg text-white">
                              {user.role === 'school_admin' ? `${attendanceList.length} Teachers` : `${attendanceList.length} Students`}
                            </h3>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none text-xs sm:text-sm bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300"
                              onClick={() => {
                                const newList = attendanceList.map(item => ({ ...item, status: 'present' }))
                                setAttendanceList(newList)
                              }}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-2" />
                              Mark All Present
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 sm:flex-none text-xs sm:text-sm bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 hover:text-red-300"
                              onClick={() => {
                                const newList = attendanceList.map(item => ({ ...item, status: 'absent' }))
                                setAttendanceList(newList)
                              }}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-2" />
                              Mark All Absent
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {attendanceList.map((item, index) => (
                            <div key={item.teacherId || item.studentId} className="p-4 border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors bg-white/[0.01] group">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                <div className="flex items-center gap-4 min-w-0 flex-1">
                                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 ring-2 ring-white/10 group-hover:ring-blue-500/50 transition-all">
                                    <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-sm sm:text-base">
                                      {(item.teacherName || item.studentName).split(' ').map(n => n[0]).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="min-w-0">
                                    <span className="font-semibold text-base sm:text-lg block truncate text-white">{item.teacherName || item.studentName}</span>
                                    <span className="text-xs text-blue-200/40 font-mono">ID: {item.teacherId || item.studentId}</span>
                                  </div>
                                </div>

                                {/* Status Selector */}
                                <div className="flex bg-white/5 p-1 rounded-lg gap-1 overflow-x-auto">
                                  {['present', 'absent', 'late', 'sick'].map((status) => {
                                    const isActive = item.status === status;
                                    let activeClass = '';
                                    let icon = null;
                                    let label = '';

                                    switch (status) {
                                      case 'present':
                                        activeClass = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20';
                                        icon = <CheckCircle className="h-4 w-4" />;
                                        label = 'Present';
                                        break;
                                      case 'absent':
                                        activeClass = 'bg-red-500 text-white shadow-lg shadow-red-500/20';
                                        icon = <XCircle className="h-4 w-4" />;
                                        label = 'Absent';
                                        break;
                                      case 'late':
                                        activeClass = 'bg-amber-500 text-white shadow-lg shadow-amber-500/20';
                                        icon = <Clock className="h-4 w-4" />;
                                        label = 'Late';
                                        break;
                                      case 'sick':
                                        activeClass = 'bg-purple-500 text-white shadow-lg shadow-purple-500/20';
                                        icon = <Activity className="h-4 w-4" />;
                                        label = 'Sick';
                                        break;
                                    }

                                    return (
                                      <button
                                        key={status}
                                        type="button"
                                        onClick={() => {
                                          const newList = [...attendanceList];
                                          newList[index].status = status;
                                          setAttendanceList(newList);
                                        }}
                                        className={`
                                          flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center
                                          ${isActive ? activeClass : 'text-blue-200/40 hover:bg-white/5 hover:text-blue-200/80'}
                                        `}
                                      >
                                        {icon}
                                        <span className="hidden sm:inline">{label}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}

                {user.role === 'teacher' && !selectedClass && (
                  <div className="text-center py-20 flex flex-col items-center justify-center opacity-50">
                    <div className="bg-white/5 p-6 rounded-full mb-4">
                      <School className="h-12 w-12 text-blue-200/60" />
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">No Class Selected</h3>
                    <p className="text-blue-200/60">Please select a class above to start marking attendance</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Summary */}
            <div className="p-6 border-t border-white/10 bg-white/[0.02]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex gap-4 text-sm w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="text-emerald-400 font-medium">{attendanceList.filter(i => i.status === 'present').length} Present</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-red-400 font-medium">{attendanceList.filter(i => i.status === 'absent').length} Absent</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <span className="text-amber-400 font-medium">{attendanceList.filter(i => i.status === 'late').length} Late</span>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto gap-3">
                  <Button variant="outline" className="flex-1 sm:flex-none border-white/10 text-white hover:bg-white/10 hover:text-white" onClick={() => setShowAttendanceModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleMarkAttendance} className="flex-1 sm:flex-none bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-8 shadow-lg shadow-emerald-500/20">
                    Save Attendance
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Date and Class Filter */}
      <Card className="mb-6 border-0 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center text-blue-200/80">
              <Filter className="h-4 w-4 mr-2" />
              <Label className="text-base font-medium whitespace-nowrap">View Attendance for:</Label>
            </div>
            <Input
              type="date"
              value={filterDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setFilterDate(e.target.value)}
              className="max-w-xs bg-white/5 border-white/10 text-white"
            />
            {user.role === 'school_admin' && (
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1d32] border-white/10">
                  <SelectItem value="all" className="text-white hover:bg-white/10">All Classes (Teachers)</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id} className="text-white hover:bg-white/10">{cls.name}</SelectItem>
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
              className="bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <Card className="border-0 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <CheckCircle className="h-20 w-20 text-emerald-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200/80 flex items-center">
              <div className="p-2 rounded-lg bg-emerald-500/20 mr-2">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
              </div>
              Present Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredAttendance.filter(a => a.status === 'present').length}
            </div>
            <p className="text-xs text-emerald-400/80 flex items-center">
              {user.role === 'school_admin' ? 'Teachers present' : 'Students present'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <XCircle className="h-20 w-20 text-red-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200/80 flex items-center">
              <div className="p-2 rounded-lg bg-red-500/20 mr-2">
                <XCircle className="h-4 w-4 text-red-400" />
              </div>
              Absent Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredAttendance.filter(a => a.status === 'absent').length}
            </div>
            <p className="text-xs text-red-400/80 flex items-center">
              {user.role === 'school_admin' ? 'Teachers absent' : 'Students absent'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Clock className="h-20 w-20 text-amber-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200/80 flex items-center">
              <div className="p-2 rounded-lg bg-amber-500/20 mr-2">
                <Clock className="h-4 w-4 text-amber-400" />
              </div>
              Late Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredAttendance.filter(a => a.status === 'late').length}
            </div>
            <p className="text-xs text-amber-400/80 flex items-center">
              {user.role === 'school_admin' ? 'Teachers late' : 'Students late'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/5 backdrop-blur-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Activity className="h-20 w-20 text-purple-500" />
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-200/80 flex items-center">
              <div className="p-2 rounded-lg bg-purple-500/20 mr-2">
                <Activity className="h-4 w-4 text-purple-400" />
              </div>
              Sick Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-1">
              {filteredAttendance.filter(a => a.status === 'sick').length}
            </div>
            <p className="text-xs text-purple-400/80 flex items-center">
              {user.role === 'school_admin' ? 'Teachers sick' : 'Students sick'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card className="border-0 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-400" />
            Attendance Details - {new Date(filterDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {user.role === 'school_admin' && filterClass !== 'all' && (
              <span className="text-sm font-normal text-blue-200/60 ml-2">
                ({classes.find(c => c.id === filterClass)?.name})
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAttendance.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-[#0f1d32] border-b border-white/10 hover:bg-[#0f1d32]">
                  <TableHead className="text-white font-semibold">{user.role === 'school_admin' ? 'Teacher' : 'Student'}</TableHead>
                  {user.role === 'teacher' && <TableHead className="text-white font-semibold">Class</TableHead>}
                  <TableHead className="text-white font-semibold">Status</TableHead>
                  <TableHead className="text-white font-semibold">Marked By</TableHead>
                  <TableHead className="text-white font-semibold">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  const person = user.role === 'school_admin'
                    ? teachers.find(t => t.id === record.teacherId)
                    : students.find(s => s.id === record.studentId)
                  const className = user.role === 'teacher' ? classes.find(c => c.id === record.classId)?.name : null

                  return (
                    <TableRow key={record.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="font-medium text-white">
                        {person ? `${person.firstName} ${person.lastName}` : 'Unknown'}
                      </TableCell>
                      {user.role === 'teacher' && <TableCell className="text-blue-200/70">{className || 'N/A'}</TableCell>}
                      <TableCell>
                        <Badge
                          className={
                            record.status === 'present' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' :
                              record.status === 'absent' ? 'bg-red-500/20 text-red-300 border-red-400/30' :
                                record.status === 'late' ? 'bg-amber-500/20 text-amber-300 border-amber-400/30' :
                                  'bg-purple-500/20 text-purple-300 border-purple-400/30'
                          }
                        >
                          {record.status === 'present' && <CheckCircle className="h-3 w-3 mr-1" />}
                          {record.status === 'absent' && <XCircle className="h-3 w-3 mr-1" />}
                          {record.status === 'late' && <Clock className="h-3 w-3 mr-1" />}
                          {record.status === 'sick' && <Activity className="h-3 w-3 mr-1" />}
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-blue-200/60">
                        {record.markedBy === user.id ? 'You' : 'Admin'}
                      </TableCell>
                      <TableCell className="text-sm text-blue-200/60">
                        {new Date(record.createdAt).toLocaleTimeString()}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-blue-200/40 mx-auto mb-3" />
              <p className="text-white">No attendance marked for {new Date(filterDate).toLocaleDateString()}</p>
              <p className="text-sm text-blue-200/60 mt-1">Select a different date or click "Mark Attendance" to add records</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
