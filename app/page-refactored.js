'use client'

import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import DashboardPage from '@/components/pages/DashboardPage'
import StudentsPage from '@/components/pages/StudentsPage'
import MessagesPage from '@/components/chat/MessagesPage'
import BillingDashboard from '@/components/billing/BillingDashboard'
import GamificationDashboard from '@/components/gamification/GamificationDashboard'
import CalculatorApp from '@/components/calculator/calculator'
import PuterAI from '@/components/ai/PuterAI'
import LoginPage from '@/components/auth/LoginPage'
import LoadingScreen from '@/components/layout/LoadingScreen'
import { useAppState } from '@/hooks/useAppState'
import { useAuth } from '@/hooks/useAuth'

function App() {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [showCalculator, setShowCalculator] = useState(false)
  
  const { user, token, school, login, logout } = useAuth()
  const { 
    stats, students, teachers, parents, classes, subjects, 
    assignments, attendance, notifications, schools,
    loadDashboardData, loadNotifications 
  } = useAppState(user, token)

  useEffect(() => {
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user && token) {
      loadDashboardData()
      loadNotifications()
    }
  }, [user, token])

  if (loading) return <LoadingScreen />
  if (!user) return <LoginPage onLogin={login} />

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        user={user} 
        school={school} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        onLogout={logout}
        notifications={notifications}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar 
          user={user} 
          school={school} 
          activeTab={activeTab}
          onCalculatorOpen={() => setShowCalculator(true)}
          onLogout={logout}
        />
        
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          {activeTab === 'dashboard' && (
            <DashboardPage 
              user={user}
              stats={stats}
              students={students}
              teachers={teachers}
              parents={parents}
              classes={classes}
              attendance={attendance}
              onAction={(action) => {
                if (action === 'add-student') setActiveTab('students')
                else if (action === 'add-teacher') setActiveTab('teachers')
                else if (action === 'add-parent') setActiveTab('parents')
              }}
            />
          )}

          {activeTab === 'students' && user.role === 'school_admin' && (
            <StudentsPage 
              students={students}
              classes={classes}
              parents={parents}
              school={school}
            />
          )}

          {activeTab === 'messages' && (
            <MessagesPage currentUser={user} onBack={() => setActiveTab('dashboard')} />
          )}

          {activeTab === 'billing' && user.role === 'school_admin' && (
            <BillingDashboard currentUser={user} school={school} />
          )}

          {activeTab === 'gamification' && (
            <GamificationDashboard currentUser={user} />
          )}
        </div>
      </div>

      <PuterAI />
      {showCalculator && <CalculatorApp isOpen={showCalculator} onClose={() => setShowCalculator(false)} />}
    </div>
  )
}

export default App
