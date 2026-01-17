'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, XCircle, Clock } from 'lucide-react'

const getDateValue = (record) => {
  const value = record?.date || record?.createdAt
  return value ? new Date(value).getTime() : 0
}

export default function MyChildrenPage({ students = [], classes = [], attendance = [], feePayments = [] }) {
  const children = students

  const last30Days = Date.now() - 30 * 24 * 60 * 60 * 1000
  const recentAttendance = attendance.filter(a => getDateValue(a) >= last30Days)
  const presentCount = recentAttendance.filter(a => a.status === 'present').length
  const absentCount = recentAttendance.filter(a => a.status === 'absent').length
  const lateCount = recentAttendance.filter(a => a.status === 'late').length

  const getClassName = (child) => classes.find(c => c.id === child.classId)?.name || 'Not assigned'

  const getLatestAttendance = (childId) => {
    const childAttendance = attendance.filter(a => a.studentId === childId)
    if (childAttendance.length === 0) return null
    return childAttendance.sort((a, b) => getDateValue(b) - getDateValue(a))[0]
  }

  const getFeeStatus = (childId) => {
    return feePayments.some(f => f.studentId === childId && f.status === 'paid')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Children</h2>
        <p className="text-sm text-slate-500 mt-1">View your children details, attendance, and fee status</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-slate-200/80 bg-white/85">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-slate-500">Total Children</div>
            <div className="text-2xl font-bold text-slate-900 mt-2">{children.length}</div>
          </CardContent>
        </Card>
        <Card className="border-emerald-200/70 bg-emerald-50/80">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-emerald-700">Present (30 days)</div>
            <div className="text-2xl font-bold text-emerald-700 mt-2">{presentCount}</div>
          </CardContent>
        </Card>
        <Card className="border-rose-200/70 bg-rose-50/80">
          <CardContent className="p-5">
            <div className="text-xs uppercase tracking-wide text-rose-700">Absent (30 days)</div>
            <div className="text-2xl font-bold text-rose-700 mt-2">{absentCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {children.map((child) => {
          const latestAttendance = getLatestAttendance(child.id)
          const feePaid = getFeeStatus(child.id)
          return (
            <Card key={child.id} className="border border-slate-200/80 bg-white/85 backdrop-blur-xl shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="text-slate-900">{child.firstName} {child.lastName}</span>
                  {feePaid ? (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3.5 w-3.5 mr-1" />
                      Fees Paid
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Fees Due
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Admission No</span>
                  <span className="font-medium text-slate-800">{child.admissionNumber || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Class</span>
                  <span className="font-medium text-slate-800">{getClassName(child)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Latest Attendance</span>
                  {latestAttendance ? (
                    <span className="inline-flex items-center gap-1 text-slate-800 capitalize">
                      {latestAttendance.status === 'present' && <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />}
                      {latestAttendance.status === 'absent' && <XCircle className="h-3.5 w-3.5 text-rose-600" />}
                      {latestAttendance.status === 'late' && <Clock className="h-3.5 w-3.5 text-amber-600" />}
                      {latestAttendance.status}
                    </span>
                  ) : (
                    <span className="text-slate-500">No records</span>
                  )}
                </div>
                {latestAttendance?.date && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Marked</span>
                    <span className="font-medium text-slate-800">
                      {new Date(latestAttendance.date).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {children.length === 0 && (
        <Card className="border border-slate-200/80 bg-white/80">
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-700">No children linked to this parent yet.</p>
            <p className="text-sm text-slate-500 mt-1">Contact the school admin to update your records.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
