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
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Stats Cards Grid - Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-blue-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <GraduationCap className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1 sm:mb-2">{totalChildren}</CardTitle>
              <CardDescription className="text-blue-700 font-medium text-sm sm:text-base">My Children</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-emerald-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-1 sm:mb-2">{attendanceRate}%</CardTitle>
              <CardDescription className="text-emerald-700 font-medium text-sm sm:text-base">Attendance Rate</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-amber-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-amber-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">{paidFees.length}</CardTitle>
              <CardDescription className="text-amber-700 font-medium text-sm sm:text-base">Fees Paid</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-red-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-red-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-red-900 mb-1 sm:mb-2">{unpaidChildren.length}</CardTitle>
              <CardDescription className="text-red-700 font-medium text-sm sm:text-base">Pending Fees</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Children List - Mobile Optimized */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">My Children</CardTitle>
            <CardDescription className="text-sm sm:text-base">Academic progress and attendance for each child</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-3 sm:space-y-4">
              {myChildren.map((child) => {
                const childAttendance = childrenAttendance.filter(a => a.studentId === child.id)
                const childPresent = childAttendance.filter(a => a.status === 'present').length
                const childRate = childAttendance.length > 0 ? Math.round((childPresent / childAttendance.length) * 100) : 0
                const hasPaid = paidFees.some(f => f.studentId === child.id)
                
                return (
                  <div key={child.id} className="p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">{child.firstName} {child.lastName}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">Class: {classes?.find(c => c.id === child.classId)?.name || 'N/A'}</p>
                      </div>
                      <Badge variant={hasPaid ? 'default' : 'destructive'} className="self-start sm:self-center text-xs">
                        {hasPaid ? 'Fees Paid' : 'Fees Pending'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">Attendance: <strong>{childRate}%</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-700">Records: <strong>{childAttendance.length}</strong></span>
                      </div>
                    </div>
                    {!hasPaid && onPayFees && (
                      <Button onClick={() => onPayFees(child)} size="sm" className="mt-3 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-xs sm:text-sm">
                        Pay Fees
                      </Button>
                    )}
                  </div>
                )
              })}
              {myChildren.length === 0 && (
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm sm:text-base">No children linked to your account</p>
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
      <div className="p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-blue-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1 sm:mb-2">
                {myStudents.length}
              </CardTitle>
              <CardDescription className="text-blue-700 font-medium text-sm sm:text-base">My Students</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-emerald-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <School className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-1 sm:mb-2">
                {myClassIds.length}
              </CardTitle>
              <CardDescription className="text-emerald-700 font-medium text-sm sm:text-base">My Classes</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-amber-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-amber-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
                {myParents.length}
              </CardTitle>
              <CardDescription className="text-amber-700 font-medium text-sm sm:text-base">Connected Parents</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-purple-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <School className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1 sm:mb-2">
                {mySubjectIds.length}
              </CardTitle>
              <CardDescription className="text-purple-700 font-medium text-sm sm:text-base">My Subjects</CardDescription>
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
      <div className="space-y-4 sm:space-y-6 p-2 sm:p-4 lg:p-6">
        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-blue-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-blue-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Building2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1 sm:mb-2">
                {totalSchools}
              </CardTitle>
              <CardDescription className="text-blue-700 font-medium text-sm sm:text-base">Total Schools</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-emerald-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-1 sm:mb-2">
                {activeSchools}
              </CardTitle>
              <CardDescription className="text-emerald-700 font-medium text-sm sm:text-base">Active Schools</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-red-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-red-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-red-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <XCircle className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-red-900 mb-1 sm:mb-2">
                {inactiveSchools}
              </CardTitle>
              <CardDescription className="text-red-700 font-medium text-sm sm:text-base">Inactive Schools</CardDescription>
            </CardHeader>
          </Card>

          <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-purple-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <CardHeader className="relative z-10 p-3 sm:p-6">
              <div className="flex items-center justify-between mb-2 sm:mb-4">
                <div className="p-2 sm:p-3 bg-purple-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1 sm:mb-2">
                {activeSchools > 0 ? Math.round((activeSchools / totalSchools) * 100) : 0}%
              </CardTitle>
              <CardDescription className="text-purple-700 font-medium text-sm sm:text-base">Active Rate</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Analytics Section - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Total Users</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Across all schools</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-blue-600">{stats?.totalUsers || 0}</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">System-wide users</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Total Students</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Enrolled students</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-green-600">{stats?.totalStudents || 0}</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">Across all schools</p>
            </CardContent>
          </Card>

          <Card className="overflow-hidden md:col-span-2 xl:col-span-1">
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Total Teachers</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Teaching staff</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl sm:text-3xl font-bold text-purple-600">{stats?.totalTeachers || 0}</div>
              <p className="text-xs sm:text-sm text-gray-600 mt-2">Across all schools</p>
            </CardContent>
          </Card>
        </div>

        {/* Schools List - Mobile Optimized */}
        <Card className="overflow-hidden">
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recent Schools</CardTitle>
            <CardDescription className="text-sm sm:text-base">Latest registered schools in the system</CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="space-y-2 sm:space-y-3">
              {schools?.slice(0, 5).map((school) => (
                <div key={school.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-3 sm:gap-0">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">{school.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600 truncate">{school.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    {school.active !== false ? (
                      <>
                        <span className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Active</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-600 hover:bg-red-50 border-red-200 text-xs sm:text-sm px-2 sm:px-3"
                          onClick={() => onToggleSchoolStatus?.(school.id, false)}
                        >
                          Deactivate
                        </Button>
                      </>
                    ) : (
                      <>
                        <span className="px-2 sm:px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Inactive</span>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-green-600 hover:bg-green-50 border-green-200 text-xs sm:text-sm px-2 sm:px-3"
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
                <div className="text-center py-6 sm:py-8 text-gray-500">
                  <Building2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm sm:text-base">No schools registered yet</p>
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
        <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-blue-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-blue-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-blue-900 mb-1 sm:mb-2">
              {stats.totalStudents || students.length || 0}
            </CardTitle>
            <CardDescription className="text-blue-700 font-medium text-sm sm:text-base">Total Students</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-emerald-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-emerald-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <UserCheck className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-emerald-900 mb-1 sm:mb-2">
              {stats.totalTeachers || teachers.length || 0}
            </CardTitle>
            <CardDescription className="text-emerald-700 font-medium text-sm sm:text-base">Total Teachers</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-amber-50 to-amber-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-amber-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-amber-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users2 className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-amber-900 mb-1 sm:mb-2">
              {stats.totalParents || parents.length || 0}
            </CardTitle>
            <CardDescription className="text-amber-700 font-medium text-sm sm:text-base">Total Parents</CardDescription>
          </CardHeader>
        </Card>

        <Card className="group hover:shadow-xl sm:hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-purple-100 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-20 h-20 sm:w-32 sm:h-32 bg-purple-200 rounded-full -mr-10 sm:-mr-16 -mt-10 sm:-mt-16 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
          <CardHeader className="relative z-10 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-500 rounded-xl sm:rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                <School className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-purple-900 mb-1 sm:mb-2">
              {stats.totalClasses || classes.length || 0}
            </CardTitle>
            <CardDescription className="text-purple-700 font-medium text-sm sm:text-base">Total Classes</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}