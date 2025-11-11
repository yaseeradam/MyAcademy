'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Users,
  UserCheck,
  User,
  Calendar,
  BookOpen,
  Filter,
  X,
  ChevronRight,
  Clock,
  Mail,
  Phone,
  MapPin,
  Loader2
} from 'lucide-react'

function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [searchType, setSearchType] = useState('all')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const searchTimeoutRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length >= 2) {
      searchTimeoutRef.current = setTimeout(() => {
        performSearch()
      }, 500)
    } else {
      setResults(null)
      setError('')
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [query, searchType])

  const performSearch = async () => {
    try {
      setLoading(true)
      setError('')

      const params = new URLSearchParams({
        q: query,
        type: searchType,
        limit: '50'
      })

      const response = await fetch(`/api/search?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Search failed')
      }

      const data = await response.json()
      setResults(data)
      setActiveTab(searchType === 'all' ? 'all' : searchType)
    } catch (error) {
      console.error('Search error:', error)
      setError(error.message || 'Search failed')
      setResults(null)
    } finally {
      setLoading(false)
    }
  }

  const clearSearch = () => {
    setQuery('')
    setResults(null)
    setError('')
    setActiveTab('all')
  }

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase()
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const renderStudentCard = (student) => (
    <Card key={student.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={student.profileImage} alt={student.firstName} />
            <AvatarFallback>
              {getInitials(student.firstName, student.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {student.firstName} {student.lastName}
              </h3>
              <Badge variant="secondary" className="text-xs">
                Student
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center space-x-1">
                <UserCheck className="h-3 w-3" />
                <span>{student.admissionNumber}</span>
              </span>

              {student.className && (
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{student.className}</span>
                </span>
              )}

              {student.phoneNumber && (
                <span className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{student.phoneNumber}</span>
                </span>
              )}
            </div>

            {student.parentName && (
              <p className="text-sm text-gray-500 mt-1">
                Parent: {student.parentName}
              </p>
            )}
          </div>

          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )

  const renderTeacherCard = (teacher) => (
    <Card key={teacher.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={teacher.profileImage} alt={teacher.firstName} />
            <AvatarFallback>
              {getInitials(teacher.firstName, teacher.lastName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {teacher.firstName} {teacher.lastName}
              </h3>
              <Badge variant="outline" className="text-xs">
                Teacher
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{teacher.employeeId}</span>
              </span>

              {teacher.specialization && (
                <span className="flex items-center space-x-1">
                  <BookOpen className="h-3 w-3" />
                  <span>{teacher.specialization}</span>
                </span>
              )}

              {teacher.phoneNumber && (
                <span className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{teacher.phoneNumber}</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              <span>{teacher.assignmentCount} classes</span>
              {teacher.subjects?.length > 0 && (
                <span>{teacher.subjects.slice(0, 2).join(', ')}{teacher.subjects.length > 2 && '...'}</span>
              )}
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )

  const renderParentCard = (parent) => (
    <Card key={parent.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {getInitials(parent.name.split(' ')[0], parent.name.split(' ')[1])}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900 truncate">
                {parent.name}
              </h3>
              <Badge variant="secondary" className="text-xs">
                Parent
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span className="flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{parent.email}</span>
              </span>

              {parent.phoneNumber && (
                <span className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>{parent.phoneNumber}</span>
                </span>
              )}
            </div>

            <div className="text-sm text-gray-500 mt-1">
              {parent.childrenCount} {parent.childrenCount === 1 ? 'child' : 'children'}
              {parent.children?.length > 0 && (
                <span className="ml-2">
                  ({parent.children.map(child => `${child.name} (${child.className})`).join(', ')})
                </span>
              )}
            </div>
          </div>

          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )

  const renderAttendanceCard = (record) => (
    <Card key={record.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-3 rounded-full ${
              record.status === 'present' ? 'bg-green-500' :
              record.status === 'absent' ? 'bg-red-500' :
              record.status === 'late' ? 'bg-yellow-500' : 'bg-blue-500'
            }`} />

            <div>
              <h3 className="font-semibold text-gray-900">
                {record.studentName}
              </h3>
              <p className="text-sm text-gray-600">
                {record.studentId} • {record.className}
              </p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant={
              record.status === 'present' ? 'default' :
              record.status === 'absent' ? 'destructive' :
              record.status === 'late' ? 'secondary' : 'outline'
            }>
              {record.status}
            </Badge>
            <p className="text-sm text-gray-600 mt-1">
              {formatDate(record.date)}
            </p>
            <p className="text-xs text-gray-500">
              by {record.teacherName}
            </p>
          </div>
        </div>

        {record.remarks && (
          <p className="text-sm text-gray-600 mt-2 italic">
            "{record.remarks}"
          </p>
        )}
      </CardContent>
    </Card>
  )

  const renderClassCard = (cls) => (
    <Card key={cls.id} className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">
                {cls.name}
              </h3>
              <Badge variant="outline" className="text-xs">
                Class
              </Badge>
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
              <span>{cls.studentCount}/{cls.capacity} students</span>
              <span>{cls.subjectCount} subjects</span>
              {cls.classTeacherName && (
                <span>Teacher: {cls.classTeacherName}</span>
              )}
            </div>

            {cls.description && (
              <p className="text-sm text-gray-500 mt-1">
                {cls.description}
              </p>
            )}
          </div>

          <div className="text-right ml-4">
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(cls.utilizationRate || 0)}%
            </div>
            <p className="text-xs text-gray-600">Utilization</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Search</h1>
          <p className="text-gray-600">Find students, teachers, parents, and more</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search for students, teachers, parents, attendance records..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Search in" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="classes">Classes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading && (
            <div className="flex items-center space-x-2 mt-4 text-gray-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="all">
              All ({results.total || 0})
            </TabsTrigger>
            <TabsTrigger value="students">
              Students ({results.results.students?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="teachers">
              Teachers ({results.results.teachers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="parents">
              Parents ({results.results.parents?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="attendance">
              Attendance ({results.results.attendance?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="classes">
              Classes ({results.results.classes?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="space-y-6">
              {results.results.students?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Students ({results.results.students.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.results.students.slice(0, 5).map(renderStudentCard)}
                  </div>
                </div>
              )}

              {results.results.teachers?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <UserCheck className="h-5 w-5" />
                    <span>Teachers ({results.results.teachers.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.results.teachers.slice(0, 5).map(renderTeacherCard)}
                  </div>
                </div>
              )}

              {results.results.parents?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Parents ({results.results.parents.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.results.parents.slice(0, 5).map(renderParentCard)}
                  </div>
                </div>
              )}

              {results.results.attendance?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <Calendar className="h-5 w-5" />
                    <span>Attendance ({results.results.attendance.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.results.attendance.slice(0, 5).map(renderAttendanceCard)}
                  </div>
                </div>
              )}

              {results.results.classes?.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Classes ({results.results.classes.length})</span>
                  </h2>
                  <div className="space-y-3">
                    {results.results.classes.slice(0, 5).map(renderClassCard)}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="students" className="mt-6">
            <div className="space-y-3">
              {results.results.students?.map(renderStudentCard)}
            </div>
          </TabsContent>

          <TabsContent value="teachers" className="mt-6">
            <div className="space-y-3">
              {results.results.teachers?.map(renderTeacherCard)}
            </div>
          </TabsContent>

          <TabsContent value="parents" className="mt-6">
            <div className="space-y-3">
              {results.results.parents?.map(renderParentCard)}
            </div>
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="space-y-3">
              {results.results.attendance?.map(renderAttendanceCard)}
            </div>
          </TabsContent>

          <TabsContent value="classes" className="mt-6">
            <div className="space-y-3">
              {results.results.classes?.map(renderClassCard)}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Empty State */}
      {!results && !loading && query.length < 2 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Search the School Management System
            </h3>
            <p className="text-gray-600">
              Enter at least 2 characters to search for students, teachers, parents, attendance records, and classes.
            </p>
          </CardContent>
        </Card>
      )}

      {/* No Results */}
      {results && results.total === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No results found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or search in a different category.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default GlobalSearch
