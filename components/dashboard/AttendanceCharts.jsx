'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useMemo } from 'react'

export default function AttendanceCharts({ attendance = [], students = [], teachers = [], classes = [], userRole }) {
  const chartData = useMemo(() => {
    if (!attendance.length) {
      return {
        weeklyData: [],
        statusData: [],
        classRates: []
      }
    }

    // Calculate status distribution
    const statusCounts = attendance.reduce((acc, record) => {
      acc[record.status] = (acc[record.status] || 0) + 1
      return acc
    }, {})

    const total = attendance.length || 1
    const statusData = [
      { name: 'Present', value: Math.round((statusCounts.present || 0) / total * 100), color: '#10b981' },
      { name: 'Absent', value: Math.round((statusCounts.absent || 0) / total * 100), color: '#ef4444' },
      { name: 'Late', value: Math.round((statusCounts.late || 0) / total * 100), color: '#f59e0b' },
      { name: 'Sick', value: Math.round((statusCounts.sick || 0) / total * 100), color: '#f97316' }
    ].filter(item => item.value > 0)

    // Calculate weekly data (last 7 days)
    const today = new Date()
    const weeklyData = []
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayRecords = attendance.filter(r => r.date?.startsWith(dateStr))
      const present = dayRecords.filter(r => r.status === 'present').length
      const absent = dayRecords.filter(r => r.status === 'absent').length
      
      weeklyData.push({
        day: days[date.getDay()],
        present,
        absent
      })
    }

    // Calculate class-wise rates
    const classRates = classes.map(cls => {
      const classStudents = students.filter(s => s.classId === cls.id)
      const classAttendance = attendance.filter(r => 
        classStudents.some(s => s.id === r.studentId)
      )
      
      const presentCount = classAttendance.filter(r => r.status === 'present').length
      const rate = classAttendance.length ? Math.round((presentCount / classAttendance.length) * 100) : 0
      
      return {
        class: cls.name,
        rate
      }
    }).filter(c => c.rate > 0)

    return { weeklyData, statusData, classRates }
  }, [attendance, students, classes])

  const { weeklyData, statusData, classRates } = chartData

  if (!attendance.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-600">No attendance data available yet.</p>
          <p className="text-sm text-gray-500 mt-1">Start marking attendance to see charts.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Weekly Trends */}
      {weeklyData.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg sm:text-xl">Weekly Attendance Trends</CardTitle>
          </CardHeader>
          <CardContent className="px-3 sm:px-6">
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={300} className="min-h-[250px] sm:min-h-[300px]">
                <BarChart 
                  data={weeklyData}
                  margin={{ top: 20, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      fontSize: '12px',
                      paddingTop: '10px'
                    }}
                  />
                  <Bar dataKey="present" fill="#10b981" name="Present" />
                  <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
        {/* Attendance Status Distribution */}
        {statusData.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Attendance Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="w-full">
                <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px]">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius="65%"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Class-wise Comparison */}
        {classRates.length > 0 && userRole === 'school_admin' && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg sm:text-xl">Attendance Rates by Class</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="w-full overflow-x-auto">
                <ResponsiveContainer width="100%" height={250} className="min-h-[200px] sm:min-h-[250px]">
                  <BarChart 
                    data={classRates} 
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      dataKey="class" 
                      type="category" 
                      width={60}
                      tick={{ fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        fontSize: '12px',
                        paddingTop: '10px'
                      }}
                    />
                    <Bar dataKey="rate" fill="#8b5cf6" name="Attendance Rate %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}