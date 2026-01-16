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
    <div className="w-12 h-12 border-4 border-sky-200 border-t-sky-500 rounded-full animate-spin mb-4"></div>
    <p className="text-slate-500">{message}</p>
  </div>
)

// Simple notification popup
const NotificationPopup = ({ show, type, message, onClose }) => {
  if (!show) return null
  return (
    <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-slate-200/70 relative">
        <div className={`text-center ${type === 'success' ? 'text-emerald-500' : 'text-rose-500'}`}>
          <div className="mb-4 flex justify-center">
            {type === 'success' ? <CheckCircle className="h-12 w-12" /> : <AlertCircle className="h-12 w-12" />}
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">{type === 'success' ? 'Success' : 'Error'}</h3>
          <p className="text-slate-500 mb-6">{message}</p>
          <Button onClick={onClose} variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-100">Close</Button>
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
      case 'info': return 'bg-sky-100 text-sky-700 border-sky-200'
      case 'warning': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'error': return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'success': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-rose-100 text-rose-700 border-rose-200'
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200'
      case 'low': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
      default: return 'bg-slate-100 text-slate-600 border-slate-200'
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
          <h1 className="text-2xl font-bold text-slate-900">Communication Center</h1>
          <p className="text-slate-500 text-sm mt-1">Manage announcements, messages, and support tickets</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => setShowNotificationModal(true)}
            className="bg-sky-500 hover:bg-sky-600 text-white border-none shadow-lg shadow-sky-200/70"
          >
            <Bell className="h-4 w-4 mr-2" />
            Send Notice
          </Button>
          <Button
            onClick={() => setShowMessageModal(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white border-none shadow-lg shadow-emerald-200/70"
          >
            <Mail className="h-4 w-4 mr-2" />
            Message
          </Button>
          <Button
            onClick={() => setShowTicketModal(true)}
            className="bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-200/70"
          >
            <Ticket className="h-4 w-4 mr-2" />
            Support
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 bg-white/80 backdrop-blur-xl border border-slate-200/80">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-sky-100 rounded-xl">
                <Bell className="h-6 w-6 text-sky-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{notifications.length}</div>
                <p className="text-xs text-slate-500 font-medium">Notifications</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-xl border border-slate-200/80">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl">
                <Send className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{messages.length}</div>
                <p className="text-xs text-slate-500 font-medium">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-xl border border-slate-200/80">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Ticket className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{supportTickets.length}</div>
                <p className="text-xs text-slate-500 font-medium">Total Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/80 backdrop-blur-xl border border-slate-200/80">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-100 rounded-xl">
                <AlertCircle className="h-6 w-6 text-rose-500" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">
                  {supportTickets.filter(t => t.status === 'open').length}
                </div>
                <p className="text-xs text-slate-500 font-medium">Open Tickets</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-white/80 p-1 rounded-xl w-fit border border-slate-200/80">
        {[
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'messages', label: 'Messages', icon: Mail },
          { id: 'tickets', label: 'Support Tickets', icon: Ticket }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${activeTab === tab.id
                ? 'bg-sky-500 text-white shadow-lg shadow-sky-200/70'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search and Filter */}
      <Card className="border-0 bg-white/80 backdrop-blur-xl border border-slate-200/80">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-48 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-200 appearance-none cursor-pointer"
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
      <Card className="border-0 bg-white/80 backdrop-blur-xl min-h-[400px] border border-slate-200/80">
        <CardHeader>
          <CardTitle className="text-slate-900">
            {activeTab === 'notifications' && 'System Notifications'}
            {activeTab === 'messages' && 'Message History'}
            {activeTab === 'tickets' && 'Support Tickets'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeTab === 'notifications' && notifications.map(notification => (
              <div key={notification.id} className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all">
                <div className={`p-2.5 rounded-lg border ${getTypeColor(notification.type)}`}>
                  <Bell className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{notification.title}</h3>
                    <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(notification.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-slate-600">{notification.message}</p>
                </div>
              </div>
            ))}

            {activeTab === 'messages' && messages.map(message => (
              <div key={message.id} className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all">
                <div className="p-2.5 bg-sky-100 text-sky-600 rounded-lg border border-sky-200">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{message.subject}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${message.status === 'sent' ? 'bg-sky-100 text-sky-700 border-sky-200' :
                          message.status === 'delivered' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                        }`}>
                        {message.status}
                      </span>
                      <span className="text-xs text-slate-400 whitespace-nowrap">{new Date(message.sentAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{message.content}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Users className="h-3 w-3" />
                    <span>To: {Array.isArray(message.recipients) ? message.recipients.join(', ') : message.recipients}</span>
                  </div>
                </div>
              </div>
            ))}

            {activeTab === 'tickets' && supportTickets.map(ticket => (
              <div key={ticket.id} className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200/80 bg-white/70 hover:bg-white transition-all">
                <div className={`p-2.5 rounded-lg border ${getPriorityColor(ticket.priority)}`}>
                  <Ticket className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 truncate">{ticket.subject}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-slate-100 text-slate-700 rounded border border-slate-200 uppercase tracking-wider">
                        {ticket.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{ticket.description}</p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
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
                  <div className="bg-white/80 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-200/80">
                    <Inbox className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-slate-500">No items found</p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Modals - Dark Theme */}
      <Dialog open={showNotificationModal} onOpenChange={setShowNotificationModal}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 sm:max-w-md shadow-xl shadow-slate-200/70">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription className="text-slate-500">Broadcast a message to users</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                placeholder="Notification title"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, title: e.target.value }))}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Notification message"
                value={notificationForm.message}
                onChange={(e) => setNotificationForm(prev => ({ ...prev, message: e.target.value }))}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 min-h-[100px]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select
                value={notificationForm.type}
                onValueChange={(val) => setNotificationForm(prev => ({ ...prev, type: val }))}
              >
                <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-200 text-slate-800">
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => setShowNotificationModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white">Send Notification</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 sm:max-w-md shadow-xl shadow-slate-200/70">
          <DialogHeader>
            <DialogTitle>Send Message</DialogTitle>
            <DialogDescription className="text-slate-500">Send a direct message</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Message subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                placeholder="Type your message here..."
                value={messageForm.content}
                onChange={(e) => setMessageForm(prev => ({ ...prev, content: e.target.value }))}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 min-h-[120px]"
                required
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => setShowMessageModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white">Send Message</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showTicketModal} onOpenChange={setShowTicketModal}>
        <DialogContent className="bg-white border-slate-200 text-slate-800 sm:max-w-md shadow-xl shadow-slate-200/70">
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription className="text-slate-500">Report an issue or request help</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTicket} className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Issue summary"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe the issue in detail..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 min-h-[100px]"
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
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
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
                  <SelectTrigger className="bg-white border-slate-200 text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200 text-slate-800">
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="feature">Feature Request</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" className="border-slate-200 text-slate-600 hover:bg-slate-100" onClick={() => setShowTicketModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white">Submit Ticket</Button>
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
