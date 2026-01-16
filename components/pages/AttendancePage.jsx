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

          {/* Mobile-First Full Screen Modal */}
          <DialogContent className="w-full h-[100dvh] max-w-none max-h-none sm:w-[95vw] sm:max-w-2xl sm:h-auto sm:max-h-[85vh] m-0 sm:m-auto rounded-none sm:rounded-xl bg-[#0f1629] border-0 sm:border sm:border-white/10 text-white p-0 flex flex-col fixed inset-0 sm:inset-auto overflow-hidden">

            {/* Header - Compact */}
            <div className="flex-shrink-0 px-4 py-3 border-b border-white/10 bg-[#0f1629]">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowAttendanceModal(false)}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 active:bg-white/10"
                >
                  <XCircle className="h-5 w-5 text-white/60" />
                </button>
                <div className="flex-1">
                  <h2 className="text-base font-semibold text-white">
                    {user.role === 'school_admin' ? 'Teacher' : 'Student'} Attendance
                  </h2>
                  <p className="text-xs text-white/40">
                    {attendanceDate ? new Date(attendanceDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select date'}
                  </p>
                </div>
                {attendanceList.length > 0 && (
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/20 text-emerald-400">
                      {attendanceList.filter(i => i.status === 'present').length}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/20 text-red-400">
                      {attendanceList.filter(i => i.status === 'absent').length}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="p-3 space-y-3">

                {/* Date & Class Selectors - Compact Row */}
                <div className="flex gap-2">
                  {user.role === 'teacher' && (
                    <div className="flex-1">
                      <Select
                        value={selectedClass}
                        onValueChange={(value) => {
                          setSelectedClass(value)
                          setAttendanceList([])
                        }}
                      >
                        <SelectTrigger className="h-12 bg-white/5 border-white/10 text-white rounded-lg text-sm">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a2744] border-white/10">
                          {classes.map((cls) => (
                            <SelectItem key={cls.id} value={cls.id} className="text-white hover:bg-white/10 focus:bg-white/10 py-3">
                              {cls.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className={user.role === 'teacher' ? 'flex-1' : 'w-full'}>
                    <Input
                      type="date"
                      className="h-12 bg-white/5 border-white/10 text-white rounded-lg text-sm"
                      value={attendanceDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>
                </div>



                {/* Student/Teacher List */}
                {((user.role === 'school_admin' && attendanceDate) || (user.role === 'teacher' && selectedClass && attendanceDate)) && (
                  <div className="space-y-2">
                    {attendanceList.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center animate-pulse">
                          <Users className="h-8 w-8 text-white/20" />
                        </div>
                        <p className="text-white/40 text-sm">Loading...</p>
                      </div>
                    ) : (
                      attendanceList.map((item, index) => (
                        <div
                          key={item.teacherId || item.studentId}
                          className="rounded-xl border border-white/10 p-3"
                        >
                          {/* Person Row */}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {(item.teacherName || item.studentName).split(' ').map(n => n[0]).join('').slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-white text-sm truncate">{item.teacherName || item.studentName}</p>
                              <p className="text-[11px] text-white/30">ID: {item.teacherId || item.studentId}</p>
                            </div>
                          </div>

                          {/* Status Buttons - 4 Column Grid */}
                          <div className="grid grid-cols-4 gap-1.5">
                            <button
                              onClick={() => {
                                const newList = [...attendanceList];
                                newList[index].status = 'present';
                                setAttendanceList(newList);
                              }}
                              className={`py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${item.status === 'present'
                                ? 'bg-emerald-500 text-white'
                                : 'bg-white/5 text-white/40'
                                }`}
                            >
                              Present
                            </button>
                            <button
                              onClick={() => {
                                const newList = [...attendanceList];
                                newList[index].status = 'absent';
                                setAttendanceList(newList);
                              }}
                              className={`py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${item.status === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-white/5 text-white/40'
                                }`}
                            >
                              Absent
                            </button>
                            <button
                              onClick={() => {
                                const newList = [...attendanceList];
                                newList[index].status = 'late';
                                setAttendanceList(newList);
                              }}
                              className={`py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${item.status === 'late'
                                ? 'bg-amber-500 text-white'
                                : 'bg-white/5 text-white/40'
                                }`}
                            >
                              Late
                            </button>
                            <button
                              onClick={() => {
                                const newList = [...attendanceList];
                                newList[index].status = 'sick';
                                setAttendanceList(newList);
                              }}
                              className={`py-2 rounded-lg text-xs font-semibold transition-all active:scale-95 ${item.status === 'sick'
                                ? 'bg-purple-500 text-white'
                                : 'bg-white/5 text-white/40'
                                }`}
                            >
                              Sick
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Empty State */}
                {user.role === 'teacher' && !selectedClass && (
                  <div className="text-center py-12">
                    <School className="h-12 w-12 text-white/20 mx-auto mb-3" />
                    <h3 className="text-base font-medium text-white mb-1">Select a Class</h3>
                    <p className="text-white/40 text-sm">Choose a class to mark attendance</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Save Button */}
            {attendanceList.length > 0 && (
              <div className="flex-shrink-0 p-3 border-t border-white/10 bg-[#0f1629]">
                <Button
                  onClick={handleMarkAttendance}
                  className="w-full h-12 text-base font-semibold bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg active:scale-[0.98] transition-all"
                >
                  <Check className="h-5 w-5 mr-2" />
                  Save Attendance
                </Button>
              </div>
            )}
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
