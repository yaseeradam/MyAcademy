'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Trophy,
  Star,
  Flame,
  Target,
  TrendingUp,
  Award,
  Medal,
  Crown,
  Zap,
  Calendar,
  Users,
  BarChart3,
  Gift
} from 'lucide-react'

function GamificationDashboard({ currentUser }) {
  const [userStats, setUserStats] = useState(null)
  const [leaderboard, setLeaderboard] = useState([])
  const [userPosition, setUserPosition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [leaderboardType, setLeaderboardType] = useState('points')
  const [leaderboardPeriod, setLeaderboardPeriod] = useState('all')

  useEffect(() => {
    loadGamificationData()
  }, [])

  useEffect(() => {
    loadLeaderboard()
  }, [leaderboardType, leaderboardPeriod])

  const loadGamificationData = async () => {
    try {
      const response = await fetch('/api/gamification/points')
      if (response.ok) {
        const data = await response.json()
        setUserStats(data)
      }
    } catch (error) {
      console.error('Error loading gamification data:', error)
    }
  }

  const loadLeaderboard = async () => {
    try {
      const response = await fetch(`/api/gamification/leaderboard?type=${leaderboardType}&period=${leaderboardPeriod}`)
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
        setUserPosition(data.userPosition)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAchievementIcon = (achievementType) => {
    if (achievementType.includes('streak')) {
      return <Flame className="h-5 w-5 text-orange-500" />
    } else if (achievementType.includes('points')) {
      return <Star className="h-5 w-5 text-yellow-500" />
    }
    return <Award className="h-5 w-5 text-blue-500" />
  }

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />
      default:
        return <span className="text-sm font-bold text-gray-600">#{rank}</span>
    }
  }

  const getNextMilestone = (currentPoints) => {
    const milestones = [100, 500, 1000, 2500, 5000, 10000]
    return milestones.find(milestone => milestone > currentPoints) || null
  }

  const getProgressToNextMilestone = (currentPoints) => {
    const nextMilestone = getNextMilestone(currentPoints)
    if (!nextMilestone) return 100

    const prevMilestone = [0, 100, 500, 1000, 2500, 5000].find(m => m < nextMilestone)
    const progress = ((currentPoints - prevMilestone) / (nextMilestone - prevMilestone)) * 100
    return Math.min(progress, 100)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPoints = userStats?.points?.totalPoints || 0
  const nextMilestone = getNextMilestone(currentPoints)
  const progressToNext = getProgressToNextMilestone(currentPoints)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gamification Dashboard</h2>
        <Badge variant="secondary" className="text-sm">
          <Gift className="h-4 w-4 mr-1" />
          Earn points for engagement!
        </Badge>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Points</CardTitle>
            <Star className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{currentPoints.toLocaleString()}</div>
            <p className="text-xs text-blue-600 mt-1">
              {nextMilestone ? `${nextMilestone - currentPoints} to next milestone` : 'Max level reached!'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Current Streak</CardTitle>
            <Flame className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {userStats?.points?.currentStreak || 0}
            </div>
            <p className="text-xs text-orange-600 mt-1">
              Longest: {userStats?.points?.longestStreak || 0} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Achievements</CardTitle>
            <Trophy className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {userStats?.achievements?.length || 0}
            </div>
            <p className="text-xs text-green-600 mt-1">
              Keep earning badges!
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">Leaderboard Rank</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              #{userPosition?.position || 'N/A'}
            </div>
            <p className="text-xs text-purple-600 mt-1">
              of {userPosition?.totalUsers || 0} users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress to Next Milestone */}
      {nextMilestone && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Progress to Next Milestone
            </CardTitle>
            <CardDescription>
              Earn {nextMilestone.toLocaleString()} points to unlock new rewards!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{currentPoints.toLocaleString()} points</span>
                <span>{nextMilestone.toLocaleString()} points</span>
              </div>
              <Progress value={progressToNext} className="h-3" />
              <p className="text-xs text-gray-600">
                {Math.round(progressToNext)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="achievements" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userStats?.achievements?.map((achievement) => (
              <Card key={achievement.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      {getAchievementIcon(achievement.achievementType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {achievement.description}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.points} points
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(achievement.earnedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!userStats?.achievements || userStats.achievements.length === 0) && (
              <Card className="col-span-full">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No achievements yet!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Start earning points to unlock your first achievement.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          {/* Leaderboard Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Select value={leaderboardType} onValueChange={setLeaderboardType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select leaderboard type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="points">Total Points</SelectItem>
                  <SelectItem value="attendance">Attendance Streaks</SelectItem>
                  <SelectItem value="achievements">Achievements</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Select value={leaderboardPeriod} onValueChange={setLeaderboardPeriod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Leaderboard Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                {leaderboardType === 'points' && 'Points Leaderboard'}
                {leaderboardType === 'attendance' && 'Attendance Champions'}
                {leaderboardType === 'achievements' && 'Achievement Masters'}
              </CardTitle>
              <CardDescription>
                {leaderboardPeriod === 'all' && 'All-time rankings'}
                {leaderboardPeriod === 'month' && 'This month\'s rankings'}
                {leaderboardPeriod === 'week' && 'This week\'s rankings'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.userId}
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      entry.userId === currentUser?.id
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 flex justify-center">
                        {getRankIcon(entry.rank)}
                      </div>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {entry.name?.charAt(0) || '?'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {entry.name || 'Unknown User'}
                          {entry.userId === currentUser?.id && (
                            <Badge variant="outline" className="ml-2 text-xs">You</Badge>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                          {entry.role?.replace('_', ' ') || 'User'}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      {leaderboardType === 'points' && (
                        <div className="font-bold text-lg">
                          {entry.totalPoints?.toLocaleString() || 0}
                        </div>
                      )}
                      {leaderboardType === 'attendance' && (
                        <div className="font-bold text-lg">
                          {entry.longestStreak || 0}
                          <span className="text-sm text-gray-500 ml-1">days</span>
                        </div>
                      )}
                      {leaderboardType === 'achievements' && (
                        <div className="font-bold text-lg">
                          {entry.achievementCount || 0}
                          <span className="text-sm text-gray-500 ml-1">badges</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {leaderboard.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No rankings available yet</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Be the first to earn points and claim the top spot!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest points-earning activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* This would be populated with actual activity data */}
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Activity tracking coming soon!</p>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll show your recent points-earning activities here.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default GamificationDashboard
