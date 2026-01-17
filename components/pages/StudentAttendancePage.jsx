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

export default function StudentAttendancePage({
  user,
  attendance,
  students,
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
  const userId = user?.id || user?._id
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [filterClass, setFilterClass] = useState('all')
  const [filteredAttendance, setFilteredAttendance] = useState(attendance)

  useEffect(() => {
    if (loadAttendanceByDate) {
      loadAttendanceByDate(filterDate)
    }
  }, [filterDate])

  useEffect(() => {
    const filtered = attendance.filter(record => {
      const recordDate = new Date(record.date).toISOString().split('T')[0]
      const dateMatch = recordDate === filterDate
      const classMatch = filterClass === 'all' || record.classId === filterClass
      return dateMatch && classMatch
    })
    setFilteredAttendance(filtered)
  }, [filterDate, filterClass, attendance])
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Student Attendance</h2>
          <p className="text-sm text-blue-200/60 mt-1">Mark and track student attendance</p>
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
              Mark Student Attendance
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[96vw] max-w-6xl max-h-[92vh] overflow-hidden p-0 bg-white/95 border border-slate-200/80 shadow-2xl shadow-slate-200/70">
            <div className="flex flex-col h-full">
              <div className="px-6 py-4 border-b border-slate-200/80 bg-white/80 backdrop-blur">
                <DialogHeader>
                  <DialogTitle className="text-lg sm:text-xl">Quick Attendance</DialogTitle>
                  <DialogDescription className="text-sm">Fast mark with one-tap status buttons.</DialogDescription>
                </DialogHeader>
              </div>

              <div className="grid lg:grid-cols-[280px_1fr] flex-1 overflow-hidden">
                <div className="border-r border-slate-200/80 bg-slate-50/60 p-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Class</Label>
                    <Select
                      value={selectedClass}
                      onValueChange={(value) => {
                        setSelectedClass(value)
                        setAttendanceList([])
                      }}
                    >
                      <SelectTrigger className="h-10">
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

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Date</Label>
                    <Input
                      type="date"
                      className="h-10"
                      value={attendanceDate}
                      max={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setAttendanceDate(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs uppercase tracking-wide text-slate-500">Quick Fill</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAttendanceList(attendanceList.map(item => ({ ...item, status: 'present' })))}
                      >
                        All Present
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAttendanceList(attendanceList.map(item => ({ ...item, status: 'absent' })))}
                      >
                        All Absent
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Summary</div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-center">
                        <div className="text-lg font-semibold text-emerald-600">{attendanceList.filter(i => i.status === 'present').length}</div>
                        <div className="text-[10px] text-emerald-700">Present</div>
                      </div>
                      <div className="rounded-lg border border-rose-200 bg-rose-50 p-2 text-center">
                        <div className="text-lg font-semibold text-rose-600">{attendanceList.filter(i => i.status === 'absent').length}</div>
                        <div className="text-[10px] text-rose-700">Absent</div>
                      </div>
                      <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-center">
                        <div className="text-lg font-semibold text-amber-600">{attendanceList.filter(i => i.status === 'late').length}</div>
                        <div className="text-[10px] text-amber-700">Late</div>
                      </div>
                      <div className="rounded-lg border border-orange-200 bg-orange-50 p-2 text-center">
                        <div className="text-lg font-semibold text-orange-600">{attendanceList.filter(i => i.status === 'sick').length}</div>
                        <div className="text-[10px] text-orange-700">Sick</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col h-full">
                  {!selectedClass && (
                    <div className="flex-1 flex items-center justify-center text-center p-6">
                      <div>
                        <School className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">Select a class to load students</p>
                      </div>
                    </div>
                  )}

                  {selectedClass && attendanceDate && (
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {attendanceList.length === 0 ? (
                        <div className="text-center py-16">
                          <Users className="h-10 w-10 text-slate-400 mx-auto mb-3 animate-pulse" />
                          <p className="text-slate-500 text-sm">Loading students...</p>
                        </div>
                      ) : (
                        attendanceList.map((item, index) => (
                          <div key={item.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-200/80 bg-white/80 hover:bg-slate-50/80 transition-colors">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-sky-100 text-sky-700 font-medium text-xs">
                                  {item.studentName.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <div className="font-medium text-sm text-slate-800 truncate">{item.studentName}</div>
                                <div className="text-xs text-slate-500">ID: {item.studentId.slice(0, 8)}</div>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${item.status === 'present'
                                  ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-200 hover:text-emerald-600'
                                  }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'present'
                                  setAttendanceList(newList)
                                }}
                              >
                                <CheckCircle className="inline h-3.5 w-3.5 mr-1" />Present
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${item.status === 'absent'
                                  ? 'bg-rose-100 text-rose-700 border-rose-200'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-rose-200 hover:text-rose-600'
                                  }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'absent'
                                  setAttendanceList(newList)
                                }}
                              >
                                <XCircle className="inline h-3.5 w-3.5 mr-1" />Absent
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${item.status === 'late'
                                  ? 'bg-amber-100 text-amber-700 border-amber-200'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-600'
                                  }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'late'
                                  setAttendanceList(newList)
                                }}
                              >
                                <Clock className="inline h-3.5 w-3.5 mr-1" />Late
                              </button>
                              <button
                                type="button"
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${item.status === 'sick'
                                  ? 'bg-orange-100 text-orange-700 border-orange-200'
                                  : 'bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-600'
                                  }`}
                                onClick={() => {
                                  const newList = [...attendanceList]
                                  newList[index].status = 'sick'
                                  setAttendanceList(newList)
                                }}
                              >
                                <Activity className="inline h-3.5 w-3.5 mr-1" />Sick
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 border-t border-slate-200/80 bg-white/80 backdrop-blur flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2">
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowAttendanceModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMarkAttendance} className="w-full sm:w-auto">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Save Attendance
                </Button>
              </div>
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
            <Select value={filterClass} onValueChange={setFilterClass}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <p className="text-sm text-blue-200/60 mt-1">Students present</p>
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
            <p className="text-sm text-blue-200/60 mt-1">Students absent</p>
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
            <p className="text-sm text-blue-200/60 mt-1">Students late</p>
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
            <p className="text-sm text-blue-200/60 mt-1">Students sick</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Attendance Records */}
      <Card>
        <CardHeader>
          <CardTitle>
            Attendance Details - {new Date(filterDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            {filterClass !== 'all' && (
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
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked By</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.map((record) => {
                  const student = students.find(s => s.id === record.studentId)
                  const className = classes.find(c => c.id === record.classId)?.name

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {student ? `${student.firstName} ${student.lastName}` : 'Unknown'}
                      </TableCell>
                      <TableCell>{className || 'N/A'}</TableCell>
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
                      <TableCell className="text-sm text-blue-200/80">
                        {(() => {
                          const markedById = record.markedBy?.id || record.markedBy?._id || record.markedBy
                          return markedById === userId ? 'You' : 'Admin'
                        })()}
                      </TableCell>
                      <TableCell className="text-sm text-blue-200/80">
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
              <p className="text-blue-200/80">No attendance marked for {new Date(filterDate).toLocaleDateString()}</p>
              <p className="text-sm text-blue-200/60 mt-1">Select a different date/class or click "Mark Student Attendance" to add records</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
