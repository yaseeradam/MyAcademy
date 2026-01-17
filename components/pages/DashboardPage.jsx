'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, UserCheck, Users2, School, Building2, CheckCircle, XCircle, TrendingUp, GraduationCap, Calendar, CreditCard, BarChart3 } from 'lucide-react'

export default function DashboardPage({ stats, students, teachers, parents, classes, schools, userRole, onToggleSchoolStatus, assignments, currentUser, attendance, feePayments, onPayFees }) {
  // Parent Dashboard - Show only children data
  if (userRole === 'parent') {
    const myChildren = students?.filter(s => s.parentId === currentUser?.id) || []
    const totalChildren = myChildren.length
    const childrenAttendance = attendance?.filter(a => myChildren.some(c => c.id === a.studentId)) || []
    const presentCount = childrenAttendance.filter(a => a.status === 'present').length
    const attendanceRate = childrenAttendance.length > 0 ? Math.round((presentCount / childrenAttendance.length) * 100) : 0
    const paidFees = feePayments?.filter(f => f.status === 'paid' && myChildren.some(c => c.id === f.studentId)) || []
    const unpaidChildren = myChildren.filter(c => !paidFees.some(f => f.studentId === c.id))

    return (
      <div className="space-y-4 sm:space-y-6">
        {/* Stats Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <GraduationCap className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{totalChildren}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">My Children</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                  <Calendar className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{attendanceRate}%</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">Attendance Rate</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                  <CreditCard className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{paidFees.length}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">Fees Paid</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-red-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/30">
                  <CreditCard className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{unpaidChildren.length}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">Pending Fees</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Children List */}
        <Card className="border-0 bg-white/5 backdrop-blur-xl overflow-hidden">
          <CardHeader className="border-b border-white/5 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl text-white">My Children</CardTitle>
            <CardDescription className="text-blue-200/60">Academic progress and attendance for each child</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3">
              {myChildren.map((child) => {
                const childAttendance = childrenAttendance.filter(a => a.studentId === child.id)
                const childPresent = childAttendance.filter(a => a.status === 'present').length
                const childRate = childAttendance.length > 0 ? Math.round((childPresent / childAttendance.length) * 100) : 0
                const hasPaid = paidFees.some(f => f.studentId === child.id)

                return (
                  <div key={child.id} className="p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-white truncate">{child.firstName} {child.lastName}</h3>
                        <p className="text-sm text-blue-200/60">Class: {classes?.find(c => c.id === child.classId)?.name || 'N/A'}</p>
                      </div>
                      <Badge variant={hasPaid ? 'default' : 'destructive'} className={hasPaid ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'}>
                        {hasPaid ? 'Fees Paid' : 'Fees Pending'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-emerald-400" />
                        <span className="text-sm text-blue-200/70">Attendance: <strong className="text-white">{childRate}%</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-blue-400" />
                        <span className="text-sm text-blue-200/70">Records: <strong className="text-white">{childAttendance.length}</strong></span>
                      </div>
                    </div>
                    {!hasPaid && onPayFees && (
                      <Button onClick={() => onPayFees(child)} size="sm" className="mt-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                        Pay Fees
                      </Button>
                    )}
                  </div>
                )
              })}
              {myChildren.length === 0 && (
                <div className="text-center py-8 text-blue-200/60">
                  <GraduationCap className="h-12 w-12 mx-auto mb-2 text-blue-200/40" />
                  <p>No children linked to your account</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Teacher Dashboard - Show only assigned data
  if (userRole === 'teacher') {
    const myAssignments = assignments?.filter(a => a.active !== false) || []
    const myClassIds = [...new Set(myAssignments.map(a => a.classId))]
    const mySubjectIds = [...new Set(myAssignments.map(a => a.subjectId))]
    const myStudents = students?.filter(s => myClassIds.includes(s.classId)) || []
    const myParentIds = [...new Set(myStudents.map(s => s.parentId).filter(Boolean))]
    const myParents = parents?.filter(p => myParentIds.includes(p.id)) || []

    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                  <Users className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{myStudents.length}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">My Students</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                  <School className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{myClassIds.length}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">My Classes</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                  <Users2 className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{myParents.length}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">Connected Parents</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5" />
            <CardHeader className="relative z-10 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                  <School className="h-5 w-5 text-on-accent" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">{mySubjectIds.length}</CardTitle>
              <CardDescription className="text-blue-200/60 font-medium">My Subjects</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  // Developer Dashboard - Show only schools
  if (userRole === 'developer') {
    const activeSchools = schools?.filter(s => s.active !== false).length || 0
    const inactiveSchools = schools?.filter(s => s.active === false).length || 0
    const totalSchools = schools?.length || 0

    return (
      <div className="space-y-6">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6">
          {/* Total Schools Card */}
          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden rounded-2xl hover:bg-white/75 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-200/40 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-sky-400 to-cyan-300 rounded-xl shadow-lg shadow-sky-200/60 group-hover:scale-110 transition-all duration-300">
                  <Building2 className="h-6 w-6 text-slate-900" />
                </div>
                <div className="flex items-center gap-1 text-sky-600 text-xs font-medium">
                  <span className="w-2 h-2 bg-sky-400 rounded-full animate-pulse" />
                  Live
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-4xl font-bold text-slate-900">{totalSchools}</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">Total Schools</CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Active Schools Card */}
          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden rounded-2xl hover:bg-white/75 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/40 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-emerald-400 to-green-300 rounded-xl shadow-lg shadow-emerald-200/60 group-hover:scale-110 transition-all duration-300">
                  <CheckCircle className="h-6 w-6 text-slate-900" />
                </div>
                <div className="text-emerald-600 text-xs font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  Online
                </div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-4xl font-bold text-slate-900">{activeSchools}</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">Active Schools</CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Inactive Schools Card */}
          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden rounded-2xl hover:bg-white/75 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-200/40 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-rose-400 to-red-300 rounded-xl shadow-lg shadow-rose-200/60 group-hover:scale-110 transition-all duration-300">
                  <XCircle className="h-6 w-6 text-slate-900" />
                </div>
                <div className="text-rose-600 text-xs font-medium">Offline</div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-4xl font-bold text-slate-900">{inactiveSchools}</CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">Inactive Schools</CardDescription>
              </div>
            </CardHeader>
          </Card>

          {/* Active Rate Card */}
          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden rounded-2xl hover:bg-white/75 transition-all duration-300 group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-200/40 rounded-full -mr-16 -mt-16" />
            <CardHeader className="relative z-10 p-6">
              <div className="flex items-center justify-between">
                <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-300 rounded-xl shadow-lg shadow-amber-200/60 group-hover:scale-110 transition-all duration-300">
                  <TrendingUp className="h-6 w-6 text-slate-900" />
                </div>
                <div className="text-amber-600 text-xs font-medium">Rate</div>
              </div>
              <div className="mt-4">
                <CardTitle className="text-4xl font-bold text-slate-900">
                  {activeSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0}%
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium mt-1">Active Rate</CardDescription>
                {/* Progress bar */}
                <div className="mt-3 h-1.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-500"
                    style={{ width: `${activeSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-slate-200/60 p-4">
              <CardTitle className="text-slate-900">Total Users</CardTitle>
              <CardDescription className="text-slate-500">Across all schools</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-sky-600">{stats?.totalUsers || 0}</div>
              <p className="text-sm text-slate-500 mt-2">System-wide users</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-slate-200/60 p-4">
              <CardTitle className="text-slate-900">Total Students</CardTitle>
              <CardDescription className="text-slate-500">Enrolled students</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-emerald-600">{stats?.totalStudents || 0}</div>
              <p className="text-sm text-slate-500 mt-2">Across all schools</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden">
            <CardHeader className="border-b border-slate-200/60 p-4">
              <CardTitle className="text-slate-900">Total Teachers</CardTitle>
              <CardDescription className="text-slate-500">Teaching staff</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="text-3xl font-bold text-indigo-600">{stats?.totalTeachers || 0}</div>
              <p className="text-sm text-slate-500 mt-2">Across all schools</p>
            </CardContent>
          </Card>
        </div>

        {/* Schools List */}
        <Card className="border border-slate-200/70 bg-white/65 backdrop-blur-xl overflow-hidden">
          <CardHeader className="border-b border-slate-200/60 p-5">
            <CardTitle className="text-xl text-slate-900">Recent Schools</CardTitle>
            <CardDescription className="text-slate-500">Latest registered schools in the system</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {schools?.slice(0, 5).map((school) => (
                <div key={school.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white/60 rounded-xl border border-slate-200/60 hover:bg-white/70 transition-all gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <img
                      src={school.logo || '/logo.png'}
                      alt={school.name}
                      className="h-10 w-10 rounded-xl object-cover ring-2 ring-slate-200/80 bg-white"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">{school.name}</p>
                      <p className="text-sm text-slate-500 truncate">{school.email || '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {school.active !== false ? (
                      <>
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium border border-emerald-200">Active</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300"
                          onClick={() => onToggleSchoolStatus?.(school.id, false)}
                        >
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-medium border border-rose-200">Inactive</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-600 hover:bg-emerald-50 border-emerald-200 hover:border-emerald-300"
                          onClick={() => onToggleSchoolStatus?.(school.id, true)}
                        >
                          Activate
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
              {(!schools || schools.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <Building2 className="h-12 w-12 mx-auto mb-2 text-slate-300" />
                  <p>No schools registered yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // School Admin Dashboard - Show students, teachers, parents, classes
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5" />
          <CardHeader className="relative z-10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
                <Users className="h-5 w-5 text-on-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats.totalStudents || students.length || 0}
            </CardTitle>
            <CardDescription className="text-blue-200/60 font-medium">Total Students</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5" />
          <CardHeader className="relative z-10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/30">
                <UserCheck className="h-5 w-5 text-on-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats.totalTeachers || teachers.length || 0}
            </CardTitle>
            <CardDescription className="text-blue-200/60 font-medium">Total Teachers</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5" />
          <CardHeader className="relative z-10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-500/30">
                <Users2 className="h-5 w-5 text-on-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats.totalParents || parents.length || 0}
            </CardTitle>
            <CardDescription className="text-blue-200/60 font-medium">Total Parents</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:scale-[1.02] transition-all duration-300 border-0 bg-white/5 backdrop-blur-xl overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5" />
          <CardHeader className="relative z-10 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/30">
                <School className="h-5 w-5 text-on-accent" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {stats.totalClasses || classes.length || 0}
            </CardTitle>
            <CardDescription className="text-blue-200/60 font-medium">Total Classes</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
