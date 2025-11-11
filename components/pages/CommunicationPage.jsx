'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Mail, Bell, Users, Send, Phone, AlertCircle, CheckCircle, Clock, Search, Filter } from 'lucide-react'
// Simple loading component
const Loader = ({ message }) => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
)
// Simple notification popup
const NotificationPopup = ({ show, type, message, onClose }) => {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md">
        <div className={`text-center ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
          <p>{message}</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-300 rounded">Close</button>
        </div>
      </div>
    </div>
  )
}

export default function CommunicationPage() {
  const [notifications, setNotifications] = useState([])
  const [messages, setMessages] = useState([])
  const [supportTickets, setSupportTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('notifications')
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [showTicketModal, setShowTicketModal] = useState(false)
  const [notificationForm, setNotificationForm] = useState({ title: '', message: '', type: 'info', recipients: 'all' })
  const [messageForm, setMessageForm] = useState({ subject: '', content: '', recipients: [] })
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', priority: 'medium', category: 'general' })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [popup, setPopup] = useState({ show: false, type: '', message: '' })

  useEffect(() => {
    fetchCommunicationData()
  }, [])

  const fetchCommunicationData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      // Simulate fetching communication data
      setNotifications([
        { id: '1', title: 'System Maintenance', message: 'Scheduled maintenance on Sunday', type: 'warning', createdAt: new Date().toISOString(), read: false },
        { id: '2', title: 'New Feature Release', message: 'Analytics dashboard is now available', type: 'info', createdAt: new Date().toISOString(), read: true },
        { id: '3', title: 'Security Alert', message: 'Please update your passwords', type: 'error', createdAt: new Date().toISOString(), read: false }
      ])
      
      setMessages([
        { id: '1', subject: 'Welcome to EduManage', content: 'Thank you for joining our platform', recipients: ['all'], sentAt: new Date().toISOString(), status: 'sent' },
        { id: '2', subject: 'Monthly Report Available', content: 'Your monthly analytics report is ready', recipients: ['school_admins'], sentAt: new Date().toISOString(), status: 'delivered' }
      ])
      
      setSupportTickets([
        { id: '1', subject: 'Login Issues', description: 'Unable to access dashboard', priority: 'high', category: 'technical', status: 'open', createdAt: new Date().toISOString() },
        { id: '2', subject: 'Feature Request', description: 'Need bulk import functionality', priority: 'medium', category: 'feature', status: 'in_progress', createdAt: new Date().toISOString() }
      ])
    } catch (error) {
      console.error('Error fetching communication data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    try {
      // Simulate API call
      const newNotification = {
        id: Date.now().toString(),
        ...notificationForm,
        createdAt: new Date().toISOString(),
        read: false
      }
      setNotifications(prev => [newNotification, ...prev])
      setNotificationForm({ title: '', message: '', type: 'info', recipients: 'all' })
      setShowNotificationModal(false)
      setPopup({ show: true, type: 'success', message: 'Notification sent successfully!' })
    } catch (error) {
      setPopup({ show: true, type: 'error', message: 'Failed to send notification' })
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    try {
      const newMessage = {
        id: Date.now().toString(),
        ...messageForm,
        sentAt: new Date().toISOString(),
        status: 'sent'
      }
      setMessages(prev => [newMessage, ...prev])
      setMessageForm({ subject: '', content: '', recipients: [] })
      setShowMessageModal(false)
      setPopup({ show: true, type: 'success', message: 'Message sent successfully!' })
    } catch (error) {
      setPopup({ show: true, type: 'error', message: 'Failed to send message' })
    }
  }

  const handleCreateTicket = async (e) => {
    e.preventDefault()
    try {
      const newTicket = {
        id: Date.now().toString(),
        ...ticketForm,
        status: 'open',
        createdAt: new Date().toISOString()
      }
      setSupportTickets(prev => [newTicket, ...prev])
      setTicketForm({ subject: '', description: '', priority: 'medium', category: 'general' })
      setShowTicketModal(false)
      setPopup({ show: true, type: 'success', message: 'Support ticket created successfully!' })
    } catch (error) {
      setPopup({ show: true, type: 'error', message: 'Failed to create ticket' })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent': return <Send className="h-4 w-4 text-blue-600" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'open': return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'in_progress': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'error': return 'bg-red-50 text-red-700 border-red-200'
      case 'success': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-50 text-green-700 border-green-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  if (loading) {
    return <Loader message="Loading communication center..." />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Communication & Support Center</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowNotificationModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Bell className="h-4 w-4" />
            Send Notification
          </button>
          <button
            onClick={() => setShowMessageModal(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Mail className="h-4 w-4" />
            Send Message
          </button>
          <button
            onClick={() => setShowTicketModal(true)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">{notifications.length}</div>
                <p className="text-sm text-blue-700">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">{messages.length}</div>
                <p className="text-sm text-green-700">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">{supportTickets.length}</div>
                <p className="text-sm text-purple-700">Support Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 rounded-lg">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-900">
                  {supportTickets.filter(t => t.status === 'open').length}
                </div>
                <p className="text-sm text-amber-700">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'messages', label: 'Messages', icon: Mail },
          { id: 'tickets', label: 'Support Tickets', icon: Phone }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Types</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      {activeTab === 'notifications' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>System Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map(notification => (
                <div key={notification.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded border ${getTypeColor(notification.type)}`}>
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                    <div className="text-xs text-gray-500">
                      {new Date(notification.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'messages' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Sent Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messages.map(message => (
                <div key={message.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(message.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{message.subject}</h3>
                      <span className={`px-2 py-1 text-xs rounded border ${
                        message.status === 'sent' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        message.status === 'delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        'bg-gray-50 text-gray-700 border-gray-200'
                      }`}>
                        {message.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{message.content}</p>
                    <div className="text-xs text-gray-500">
                      To: {Array.isArray(message.recipients) ? message.recipients.join(', ') : message.recipients} • 
                      {new Date(message.sentAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'tickets' && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {supportTickets.map(ticket => (
                <div key={ticket.id} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(ticket.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{ticket.subject}</h3>
                      <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {ticket.category}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{ticket.description}</p>
                    <div className="text-xs text-gray-500">
                      Status: {ticket.status} • Created: {new Date(ticket.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send Notification</h2>
            <form onSubmit={handleSendNotification} className="space-y-4">
              <input
                type="text"
                placeholder="Notification title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <textarea
                placeholder="Notification message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                required
              />
              <select
                value={notificationForm.type}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </select>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Send Notification
                </button>
                <button
                  type="button"
                  onClick={() => setShowNotificationModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <NotificationPopup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ show: false, type: '', message: '' })}
      />
    </div>
  )
}