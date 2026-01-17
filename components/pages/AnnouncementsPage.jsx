'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, Megaphone, Users, Bell, Trash2, Eye, Send, Loader2 } from 'lucide-react'

export default function AnnouncementsPage({
    school,
    schoolSettings,
    classes,
    teachers,
    students,
    apiCall,
    modal,
    onBack
}) {
    const [announcements, setAnnouncements] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState({
        title: '',
        message: '',
        audience: 'all',
        classId: '',
        priority: 'normal'
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadAnnouncements()
    }, [])

    const loadAnnouncements = async () => {
        try {
            setLoading(true)
            const data = await apiCall('announcements')
            setAnnouncements(data || [])
        } catch (error) {
            console.error('Failed to load announcements:', error)
            // Fallback to localStorage if API fails for some reason
            const schoolId = school?.id || 'default'
            const stored = JSON.parse(localStorage.getItem(`${schoolId}_announcements`) || '[]')
            setAnnouncements(stored)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        modal?.showLoading('Sending announcement...')

        try {
            const response = await apiCall('announcements', {
                method: 'POST',
                body: JSON.stringify(form)
            })

            if (response && response.id) {
                setAnnouncements([response, ...announcements])
                setForm({ title: '', message: '', audience: 'all', classId: '', priority: 'normal' })
                setShowModal(false)
                modal?.showSuccess('Announcement Sent', 'Your announcement has been broadcasted successfully!')
            }
        } catch (error) {
            modal?.showError('Failed to send', error.message)
        } finally {
            modal?.hideLoading()
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return
        modal?.showLoading('Deleting...')
        try {
            await apiCall(`announcements?id=${id}`, { method: 'DELETE' })
            setAnnouncements(announcements.filter(a => a.id !== id))
            modal?.showSuccess('Deleted', 'Announcement removed from system.')
        } catch (error) {
            modal?.showError('Delete failed', error.message)
        } finally {
            modal?.hideLoading()
        }
    }

    const getAudienceLabel = (announcement) => {
        switch (announcement.audience) {
            case 'all': return 'Everyone'
            case 'teachers': return 'Teachers Only'
            case 'parents': return 'Parents Only'
            case 'class':
                const cls = classes.find(c => c.id === announcement.classId)
                return cls ? `Class: ${cls.name}` : 'Specific Class'
            default: return 'Everyone'
        }
    }

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-700 border-red-200'
            case 'high': return 'bg-orange-100 text-orange-700 border-orange-200'
            case 'normal': return 'bg-blue-100 text-blue-700 border-blue-200'
            default: return 'bg-slate-100 text-slate-700 border-slate-200'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm" onClick={onBack} className="bg-white/80 border-slate-200">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">Announcements</h2>
                        <p className="text-slate-500 text-sm mt-1">Send notices to parents, teachers, and students</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Announcement
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-rose-500 animate-spin" />
                    <p className="text-slate-500 animate-pulse">Fetching announcements...</p>
                </div>
            ) : (
                <>
                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-rose-100">
                                    <Megaphone className="h-6 w-6 text-rose-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{announcements.length}</p>
                                    <p className="text-sm text-slate-500">Total Announcements</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-orange-100">
                                    <Bell className="h-6 w-6 text-orange-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">
                                        {announcements.filter(a => a.priority === 'urgent' || a.priority === 'high').length}
                                    </p>
                                    <p className="text-sm text-slate-500">High Priority</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-blue-100">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">{teachers.length + students.length}</p>
                                    <p className="text-sm text-slate-500">Potential Reach</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Announcements List */}
                    <div className="space-y-4">
                        {announcements.length === 0 ? (
                            <Card className="border-slate-200/80 bg-white/80">
                                <CardContent className="p-8 text-center">
                                    <Megaphone className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No announcements yet</p>
                                    <p className="text-sm text-slate-400 mt-1">Click "New Announcement" to send your first notice</p>
                                </CardContent>
                            </Card>
                        ) : (
                            announcements.map(announcement => (
                                <Card key={announcement.id} className="border-slate-200/80 bg-white/80 hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <h3 className="font-semibold text-slate-900">{announcement.title}</h3>
                                                    <Badge className={`text-xs ${getPriorityColor(announcement.priority)}`}>
                                                        {announcement.priority}
                                                    </Badge>
                                                </div>
                                                <p className="text-slate-600 text-sm mb-3">{announcement.message}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                                    <span className="flex items-center gap-1">
                                                        <Users className="h-3 w-3" />
                                                        {getAudienceLabel(announcement)}
                                                    </span>
                                                    <span>
                                                        {new Date(announcement.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                        })}
                                                    </span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="font-medium text-slate-500">Sent by: {announcement.sentBy || 'Admin'}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(announcement.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </>
            )}

            {/* New Announcement Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-lg bg-white border-slate-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">New Announcement</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Send a notice to your school community
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700">Title</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="Announcement title"
                                required
                                className="border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700">Message</Label>
                            <Textarea
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                placeholder="Write your announcement..."
                                rows={4}
                                required
                                className="border-slate-200"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Audience</Label>
                                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Everyone</SelectItem>
                                        <SelectItem value="teachers">Teachers Only</SelectItem>
                                        <SelectItem value="parents">Parents Only</SelectItem>
                                        <SelectItem value="class">Specific Class</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">Priority</Label>
                                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="normal">Normal</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {form.audience === 'class' && (
                            <div className="space-y-2">
                                <Label className="text-slate-700">Select Class</Label>
                                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                                    <SelectTrigger className="border-slate-200">
                                        <SelectValue placeholder="Choose a class" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map(cls => (
                                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-200">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white">
                                <Send className="h-4 w-4 mr-2" />
                                Send Announcement
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
