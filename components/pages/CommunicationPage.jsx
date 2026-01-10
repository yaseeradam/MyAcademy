'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { MessageSquare, Mail, Bell, Users, Send, Phone, AlertCircle, CheckCircle, Clock, Search, Filter, Plus, Inbox, History, Ticket } from 'lucide-react'

// Simple loading component
const Loader = ({ message }) => (
  <div className="flex flex-col items-center justify-center p-12">
    <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
    <p className="text-blue-200/60">{message}</p>
  </div>
)

// Simple notification popup
const NotificationPopup = ({ show, type, message, onClose }) => {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-[#0f1d32] border border-white/10 rounded-xl p-6 max-w-md w-full shadow-2xl relative">
        <div className={`text-center ${type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
          <div className="mb-4 flex justify-center">
            {type === 'success' ? <CheckCircle className="h-12 w-12" /> : <AlertCircle className="h-12 w-12" />}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{type === 'success' ? 'Success' : 'Error'}</h3>
          <p className="text-blue-200/80 mb-6">{message}</p>
          <Button onClick={onClose} variant="outline" className="w-full border-white/10 text-white hover:bg-white/10">Close</Button>
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
      setTimeout(() => {
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
        setLoading(false)
      }, 1000)

    } catch (error) {
      console.error('Error fetching communication data:', error)
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
      case 'sent': return <Send className="h-4 w-4 text-blue-400" />
      case 'delivered': return <CheckCircle className="h-4 w-4 text-emerald-400" />
      case 'open': return <AlertCircle className="h-4 w-4 text-red-400" />
      case 'in_progress': return <Clock className="h-4 w-4 text-amber-400" />
      case 'closed': return <CheckCircle className="h-4 w-4 text-gray-400" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'info': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'warning': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      case 'error': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'success': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-300 border-red-500/30'
      case 'medium': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
      case 'low': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  if (loading) {
    return <Loader message="Loading communication center..." />
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Communication Center</h1>
          <p className="text-blue-200/60 text-sm mt-1">Manage announcements, messages, and support tickets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowNotificationModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white border-none shadow-lg shadow-blue-500/20"
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Notice
          </Button>
          <Button
            onClick={() => setShowMessageModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-500/20"
          >
            <Mail className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button
            onClick={() => setShowTicketModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white border-none shadow-lg shadow-purple-500/20"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Support
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border-t border-white/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <Bell className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{notifications.length}</div>
                <p className="text-xs text-blue-200/60 font-medium">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 backdrop-blur-xl border-t border-white/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-xl">
                <Send className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{messages.length}</div>
                <p className="text-xs text-blue-200/60 font-medium">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border-t border-white/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Ticket className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{supportTickets.length}</div>
                <p className="text-xs text-blue-200/60 font-medium">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-amber-500/10 to-amber-600/5 backdrop-blur-xl border-t border-white/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <AlertCircle className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {supportTickets.filter(t => t.status === 'open').length}
                </div>
                <p className="text-xs text-blue-200/60 font-medium">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/5 p-1 rounded-xl w-fit">
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'messages', label: 'Messages', icon: Mail },
          { id: 'tickets', label: 'Support Tickets', icon: Ticket }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                : 'text-blue-200/60 hover:text-white hover:bg-white/5'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <Card className="border-0 bg-white/5 backdrop-blur-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200/40" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white placeholder:text-blue-200/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 bg-black/20 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer"
            >
              <option value="">All Types</option>
              {activeTab === 'notifications' && <>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="success">Success</option>
              </>}
              {activeTab === 'tickets' && <>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </>}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Content based on active tab */}
      <Card className="border-0 bg-white/5 backdrop-blur-xl min-h-[400px]">
        <CardHeader>
          <CardTitle className="text-white">
            {activeTab === 'notifications' && 'System Notifications'}
            {activeTab === 'messages' && 'Message History'}
            {activeTab === 'tickets' && 'Support Tickets'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTab === 'notifications' && notifications.map(notification => (
              <div key={notification.id} className="group flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className={`p-2.5 rounded-lg border ${getTypeColor(notification.type)}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-white truncate">{notification.title}</h3>
                    <span className="text-xs text-blue-200/40 whitespace-nowrap">{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-blue-200/70">{notification.message}</p>
                </div>
              </div>
            ))}

            {activeTab === 'messages' && messages.map(message => (
              <div key={message.id} className="group flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{message.subject}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${message.status === 'sent' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                          message.status === 'delivered' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                            'bg-gray-500/20 text-gray-300 border-gray-500/30'
                        }`}>
                        {message.status}
                      </span>
                      <span className="text-xs text-blue-200/40 whitespace-nowrap">{new Date(message.sentAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-200/70 mb-2">{message.content}</p>
                  <div className="flex items-center gap-2 text-xs text-blue-200/40">
                    <Users className="h-3 w-3" />
                    <span>To: {Array.isArray(message.recipients) ? message.recipients.join(', ') : message.recipients}</span>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'tickets' && supportTickets.map(ticket => (
              <div key={ticket.id} className="group flex items-start gap-4 p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all">
                <div className={`p-2.5 rounded-lg border ${getPriorityColor(ticket.priority)}`}>
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h3 className="font-semibold text-white truncate">{ticket.subject}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-white/10 text-white rounded border border-white/10 uppercase tracking-wider">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-blue-200/70 mb-2">{ticket.description}</p>
                  <div className="flex items-center justify-between text-xs text-blue-200/40">
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      <span>{ticket.status.replace('_', ' ')}</span>
                    </div>
                    <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}

            {((activeTab === 'notifications' && notifications.length === 0) ||
              (activeTab === 'messages' && messages.length === 0) ||
              (activeTab === 'tickets' && supportTickets.length === 0)) && (
                <div className="text-center py-12">
                  <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Inbox className="h-8 w-8 text-blue-200/20" />
                  </div>
                  <p className="text-blue-200/40">No items found</p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Modals - Dark Theme */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="bg-[#0f1d32] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription className="text-blue-200/60">Broadcast a message to users</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Notification title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                className="bg-black/20 border-white/10 text-white placeholder:text-blue-200/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Notification message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                className="bg-black/20 border-white/10 text-white placeholder:text-blue-200/30 min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={notificationForm.type}
                onValueChange={(val) => setNotificationForm(prev => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="bg-black/20 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1d32] border-white/10 text-white">
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10 text-blue-200 hover:bg-white/10 hover:text-white" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Send Notification</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="bg-[#0f1d32] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription className="text-blue-200/60">Send a direct message</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Message subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-black/20 border-white/10 text-white placeholder:text-blue-200/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Type your message here..."
                value={messageForm.content}
                onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                className="bg-black/20 border-white/10 text-white placeholder:text-blue-200/30 min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10 text-blue-200 hover:bg-white/10 hover:text-white" onClick={() => setShowMessageModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Send Message</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="bg-[#0f1d32] border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription className="text-blue-200/60">Report an issue or request help</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Issue summary"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-black/20 border-white/10 text-white placeholder:text-blue-200/30"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-black/20 border-white/10 text-white placeholder:text-blue-200/30 min-h-[100px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={ticketForm.priority}
                  onValueChange={(val) => setTicketForm(prev => ({ ...prev, priority: val }))}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1d32] border-white/10 text-white">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={ticketForm.category}
                  onValueChange={(val) => setTicketForm(prev => ({ ...prev, category: val }))}
                >
                  <SelectTrigger className="bg-black/20 border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1d32] border-white/10 text-white">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-white/10 text-blue-200 hover:bg-white/10 hover:text-white" onClick={() => setShowTicketModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Submit Ticket</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <NotificationPopup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ show: false, type: '', message: '' })}
      />
    </div>
  )
}