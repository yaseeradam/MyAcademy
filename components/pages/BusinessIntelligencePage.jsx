'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Building2, Users, Calendar, Target, PieChart, BarChart3, LineChart } from 'lucide-react'
import { LineChart as RechartsLineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, AreaChart, Area } from 'recharts'
// Simple loading component
const Loader = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16', '#f97316']

export default function BusinessIntelligencePage() {
  const [revenueData, setRevenueData] = useState(null)
  const [schoolMetrics, setSchoolMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('12months')

  useEffect(() => {
    fetchBusinessData()
  }, [timeRange])

  const fetchBusinessData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [revenueRes, analyticsRes, statsRes] = await Promise.all([
        fetch('/api/master/revenue-analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/master/analytics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/master/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (revenueRes.ok && analyticsRes.ok && statsRes.ok) {
        const revenue = await revenueRes.json()
        const analytics = await analyticsRes.json()
        const stats = await statsRes.json()
        
        setRevenueData(revenue)
        setSchoolMetrics({ ...analytics, ...stats })
      }
    } catch (error) {
      console.error('Error fetching business data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader message="Loading business intelligence..." />
  }

  const totalRevenue = revenueData?.avgRevenuePerSchool?.totalRevenue || 0
  const monthlyGrowth = revenueData?.monthlyRevenueData?.length > 1 ? 
    ((revenueData.monthlyRevenueData[revenueData.monthlyRevenueData.length - 1]?.revenue || 0) - 
     (revenueData.monthlyRevenueData[revenueData.monthlyRevenueData.length - 2]?.revenue || 0)) / 
    (revenueData.monthlyRevenueData[revenueData.monthlyRevenueData.length - 2]?.revenue || 1) * 100 : 0

  const customerAcquisitionCost = totalRevenue > 0 ? totalRevenue / (schoolMetrics?.totalSchools || 1) : 0
  const averageRevenuePerUser = totalRevenue / (schoolMetrics?.totalUsers || 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Business Intelligence</h1>
        <div className="flex items-center gap-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="12months">Last 12 Months</option>
            <option value="24months">Last 24 Months</option>
          </select>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-green-500 rounded-lg">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              ${totalRevenue.toLocaleString()}
            </div>
            <p className="text-sm text-green-700">Total Revenue</p>
            <div className="flex items-center gap-1 mt-1">
              <span className={`text-xs ${monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyGrowth >= 0 ? '+' : ''}{monthlyGrowth.toFixed(1)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <Target className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              ${customerAcquisitionCost.toFixed(0)}
            </div>
            <p className="text-sm text-blue-700">Customer Acquisition Cost</p>
            <div className="text-xs text-gray-500 mt-1">
              Per school onboarded
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              ${averageRevenuePerUser.toFixed(2)}
            </div>
            <p className="text-sm text-purple-700">ARPU (Average Revenue Per User)</p>
            <div className="text-xs text-gray-500 mt-1">
              Across all users
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              <BarChart3 className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-900">
              {revenueData?.avgRevenuePerSchool?.totalPayments || 0}
            </div>
            <p className="text-sm text-amber-700">Total Transactions</p>
            <div className="text-xs text-gray-500 mt-1">
              All time payments
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineChart className="h-5 w-5 text-blue-600" />
              Revenue Trend Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData?.monthlyRevenueData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-600" />
              Transaction Volume
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData?.monthlyRevenueData || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* School Performance & Market Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-purple-600" />
              Top Performing Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(revenueData?.revenueBySchool || []).slice(0, 8).map((school, index) => (
                <div key={school._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold`}
                         style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">School {school._id.slice(0, 8)}...</div>
                      <div className="text-sm text-gray-500">{school.count} transactions</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">${school.revenue.toLocaleString()}</div>
                    <div className="text-sm text-gray-500">
                      ${(school.revenue / school.count).toFixed(0)} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-amber-600" />
              Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={revenueData?.revenueBySchool?.slice(0, 6) || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="revenue"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                >
                  {(revenueData?.revenueBySchool || []).slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              Platform Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-900">School Growth Rate</span>
                <span className="font-bold text-blue-600">
                  +{((schoolMetrics?.newSchoolsLast30Days || 0) / (schoolMetrics?.totalSchools || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-900">User Growth Rate</span>
                <span className="font-bold text-green-600">
                  +{((schoolMetrics?.newUsersLast30Days || 0) / (schoolMetrics?.totalUsers || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm font-medium text-purple-900">Active User Rate</span>
                <span className="font-bold text-purple-600">
                  {((schoolMetrics?.activeUsersLast7Days || 0) / (schoolMetrics?.totalUsers || 1) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                <span className="text-sm font-medium text-amber-900">Revenue per School</span>
                <span className="font-bold text-amber-600">
                  ${(totalRevenue / (schoolMetrics?.totalSchools || 1)).toFixed(0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              Business Forecasts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Projected Monthly Revenue</div>
                <div className="text-2xl font-bold text-green-600">
                  ${(totalRevenue * 1.15 / 12).toFixed(0)}
                </div>
                <div className="text-xs text-gray-500">Based on 15% growth</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Target Schools (Next Quarter)</div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.ceil((schoolMetrics?.totalSchools || 0) * 1.25)}
                </div>
                <div className="text-xs text-gray-500">25% growth target</div>
              </div>
              
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Estimated Annual Revenue</div>
                <div className="text-2xl font-bold text-purple-600">
                  ${(totalRevenue * 4.2).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Conservative estimate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}