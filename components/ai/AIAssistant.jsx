'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Send, Loader2, BookOpen, Users, Calendar, BarChart3, MessageSquare, Lightbulb, Calculator, FileText } from 'lucide-react'

const AIAssistant = ({ currentUser }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `Hello ${currentUser?.name || 'there'}! I'm EduBot, your intelligent school management assistant. I'm here to help with:\n\n📚 Academic guidance & curriculum planning\n👥 Student & teacher management\n📊 Data analysis & reports\n📅 Schedule optimization\n💬 Communication strategies\n🎯 Performance insights\n\nWhat would you like assistance with today?`,
      timestamp: new Date(),
      suggestions: ['Show attendance trends', 'Help with lesson planning', 'Analyze student performance', 'Create a report']
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [context, setContext] = useState(null)
  const messagesEndRef = useRef(null)

  const quickActions = [
    { icon: BookOpen, label: 'Curriculum Help', query: 'Help me plan curriculum for my subject' },
    { icon: Users, label: 'Student Analysis', query: 'Analyze student performance patterns' },
    { icon: Calendar, label: 'Schedule Optimization', query: 'Help optimize class schedules' },
    { icon: BarChart3, label: 'Generate Report', query: 'Create a comprehensive school report' },
    { icon: MessageSquare, label: 'Communication Tips', query: 'Best practices for parent-teacher communication' },
    { icon: Calculator, label: 'Grade Calculator', query: 'Help me calculate student grades' }
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (customMessage = null) => {
    const messageToSend = customMessage || inputMessage
    if (!messageToSend.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Call AI API for intelligent responses
      const token = localStorage.getItem('token')
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: messageToSend,
          context: context
        })
      })

      if (response.ok) {
        const aiData = await response.json()
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: aiData.content,
          timestamp: new Date(),
          suggestions: aiData.suggestions || []
        }
        setMessages(prev => [...prev, aiResponse])
        setContext(aiData.type)
      } else {
        // Fallback to local response
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: getAIResponse(messageToSend, currentUser),
          timestamp: new Date(),
          suggestions: getFollowUpSuggestions(messageToSend)
        }
        setMessages(prev => [...prev, aiResponse])
      }
    } catch (error) {
      console.error('AI API Error:', error)
      // Fallback to local response
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: getAIResponse(messageToSend, currentUser),
        timestamp: new Date(),
        suggestions: getFollowUpSuggestions(messageToSend)
      }
      setMessages(prev => [...prev, aiResponse])
    } finally {
      setIsLoading(false)
    }
  }

  const getAIResponse = (message, user) => {
    const lowerMessage = message.toLowerCase()
    const userRole = user?.role || 'user'
    
    // School-specific intelligent responses
    if (lowerMessage.includes('attendance')) {
      return `📊 **Attendance Analysis**\n\nBased on your role as ${userRole}, here are some insights:\n\n• **Current Trends**: Monitor daily attendance patterns\n• **Risk Identification**: Students with <80% attendance need intervention\n• **Parent Communication**: Automated alerts for consecutive absences\n• **Improvement Strategies**: Implement attendance rewards system\n\n${userRole === 'school_admin' ? 'Would you like me to generate a detailed attendance report?' : 'I can help you track your class attendance more effectively.'}`
    }
    
    if (lowerMessage.includes('performance') || lowerMessage.includes('grade')) {
      return `🎯 **Student Performance Insights**\n\n**Key Metrics to Track:**\n• Grade distribution across subjects\n• Individual student progress trends\n• Subject-wise performance comparison\n• Improvement recommendations\n\n**Actionable Steps:**\n1. Identify struggling students early\n2. Implement targeted intervention programs\n3. Celebrate high achievers\n4. Regular parent-teacher conferences\n\n${userRole === 'teacher' ? 'Focus on differentiated instruction for better outcomes.' : 'Consider implementing data-driven decision making.'}`
    }
    
    if (lowerMessage.includes('curriculum') || lowerMessage.includes('lesson')) {
      return `📚 **Curriculum & Lesson Planning**\n\n**Best Practices:**\n• Align with learning objectives\n• Include diverse learning styles\n• Integrate technology effectively\n• Plan assessment strategies\n\n**Lesson Structure:**\n1. **Opening** (5-10 min): Hook & objectives\n2. **Main Content** (20-30 min): Core learning\n3. **Practice** (10-15 min): Guided activities\n4. **Closure** (5 min): Summary & preview\n\nWould you like specific subject recommendations?`
    }
    
    if (lowerMessage.includes('communication') || lowerMessage.includes('parent')) {
      return `💬 **Effective Communication Strategies**\n\n**Parent Engagement:**\n• Regular progress updates\n• Positive news sharing\n• Clear expectation setting\n• Multiple communication channels\n\n**Teacher Collaboration:**\n• Weekly team meetings\n• Shared resource libraries\n• Peer observation programs\n• Professional development planning\n\n**Student Communication:**\n• Active listening techniques\n• Constructive feedback methods\n• Motivation strategies\n• Conflict resolution skills`
    }
    
    if (lowerMessage.includes('report') || lowerMessage.includes('analysis')) {
      return `📈 **Report Generation & Analysis**\n\n**Available Reports:**\n• Student progress reports\n• Attendance summaries\n• Financial statements\n• Teacher performance metrics\n• Parent engagement analytics\n\n**Analysis Features:**\n• Trend identification\n• Comparative studies\n• Predictive insights\n• Actionable recommendations\n\nWhich specific report would you like me to help you create?`
    }
    
    if (lowerMessage.includes('schedule') || lowerMessage.includes('timetable')) {
      return `⏰ **Schedule Optimization**\n\n**Key Considerations:**\n• Teacher availability & expertise\n• Room capacity & resources\n• Student course requirements\n• Break time distribution\n\n**Optimization Tips:**\n1. Balance heavy & light subjects\n2. Consider peak learning hours\n3. Minimize teacher transitions\n4. Account for special activities\n\nI can help you create an efficient timetable structure.`
    }
    
    // General educational responses
    const educationalResponses = [
      `As an educational AI assistant, I'm here to support your ${userRole} role. What specific challenge can I help you solve today?`,
      `Great question! In the context of school management, let me provide you with some targeted insights and recommendations.`,
      `I understand you're looking for guidance. Based on best practices in education, here's what I recommend...`,
      `That's an important topic in educational leadership. Let me share some evidence-based strategies that could help.`,
      `Excellent! This relates to effective school management. Here are some practical approaches you might consider.`
    ]
    
    return educationalResponses[Math.floor(Math.random() * educationalResponses.length)]
  }
  
  const getFollowUpSuggestions = (message) => {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('attendance')) {
      return ['Generate attendance report', 'Set up attendance alerts', 'Improve attendance strategies']
    }
    if (lowerMessage.includes('performance')) {
      return ['Create grade analysis', 'Student intervention plan', 'Parent meeting prep']
    }
    if (lowerMessage.includes('curriculum')) {
      return ['Subject-specific planning', 'Assessment strategies', 'Resource recommendations']
    }
    if (lowerMessage.includes('communication')) {
      return ['Draft parent newsletter', 'Meeting agenda template', 'Feedback strategies']
    }
    
    return ['Tell me more', 'Show examples', 'Next steps', 'Related topics']
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion)
  }

  const handleQuickAction = (query) => {
    handleSendMessage(query)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">EduBot AI Assistant</h3>
            <p className="text-sm text-gray-500">Your intelligent school management companion</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="p-4 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-700 mb-3">Quick Actions:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="justify-start h-auto p-3 text-left"
                  onClick={() => handleQuickAction(action.query)}
                >
                  <Icon className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`${message.type === 'user' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block max-w-[85%] ${
                message.type === 'ai' ? '' : ''
              }`}>
                <div className={`p-4 rounded-lg shadow-sm ${
                  message.type === 'ai' 
                    ? 'bg-white border border-gray-200' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {message.content}
                  </div>
                  <div className={`text-xs mt-2 ${
                    message.type === 'ai' ? 'text-gray-500' : 'text-blue-100'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {/* Suggestions */}
                {message.type === 'ai' && message.suggestions && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.suggestions.map((suggestion, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="cursor-pointer hover:bg-blue-100 hover:text-blue-700 transition-colors"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="text-left">
              <div className="inline-block p-4 rounded-lg bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                  <span className="text-sm text-gray-600">EduBot is thinking...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className="flex gap-3">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about attendance, grades, curriculum, or anything school-related..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Context indicator */}
        {context && (
          <div className="mt-2 flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500 capitalize">
              {context.replace('_', ' ')} mode active
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default AIAssistant