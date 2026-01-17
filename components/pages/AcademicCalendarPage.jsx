'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Plus, CalendarDays, Trash2, GraduationCap, PartyPopper, Clock, Loader2 } from 'lucide-react'

export default function AcademicCalendarPage({
    school,
    schoolSettings,
    apiCall,
    modal,
    onBack
}) {
    const [events, setEvents] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        type: 'event',
        color: 'blue'
    })

    useEffect(() => {
        loadEvents()
    }, [])

    const loadEvents = async () => {
        try {
            setLoading(true)
            const data = await apiCall('academic-calendar')
            setEvents((data || []).sort((a, b) => new Date(a.startDate) - new Date(b.startDate)))
        } catch (error) {
            console.error('Failed to load events:', error)
            const schoolId = school?.id || 'default'
            const stored = JSON.parse(localStorage.getItem(`${schoolId}_calendar_events`) || '[]')
            setEvents(stored.sort((a, b) => new Date(a.startDate) - new Date(b.startDate)))
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        modal?.showLoading('Adding event...')

        try {
            const response = await apiCall('academic-calendar', {
                method: 'POST',
                body: JSON.stringify(form)
            })

            if (response && response.id) {
                const updated = [...events, response].sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
                setEvents(updated)
                setForm({ title: '', description: '', startDate: '', endDate: '', type: 'event', color: 'blue' })
                setShowModal(false)
                modal?.showSuccess('Event Added', 'Calendar event added successfully!')
            }
        } catch (error) {
            modal?.showError('Failed to add', error.message)
        } finally {
            modal?.hideLoading()
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this event?')) return
        modal?.showLoading('Deleting...')
        try {
            await apiCall(`academic-calendar?id=${id}`, { method: 'DELETE' })
            setEvents(events.filter(e => e.id !== id))
            modal?.showSuccess('Deleted', 'Event deleted successfully!')
        } catch (error) {
            modal?.showError('Delete failed', error.message)
        } finally {
            modal?.hideLoading()
        }
    }

    const getTypeIcon = (type) => {
        switch (type) {
            case 'holiday': return <PartyPopper className="h-4 w-4" />
            case 'exam': return <GraduationCap className="h-4 w-4" />
            case 'term': return <Clock className="h-4 w-4" />
            default: return <CalendarDays className="h-4 w-4" />
        }
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'holiday': return 'bg-green-100 text-green-700 border-green-200'
            case 'exam': return 'bg-red-100 text-red-700 border-red-200'
            case 'term': return 'bg-purple-100 text-purple-700 border-purple-200'
            default: return 'bg-blue-100 text-blue-700 border-blue-200'
        }
    }

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        })
    }

    const upcomingEvents = events.filter(e => new Date(e.startDate) >= new Date().setHours(0, 0, 0, 0))
    const pastEvents = events.filter(e => new Date(e.startDate) < new Date().setHours(0, 0, 0, 0))

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
                        <h2 className="text-2xl font-bold text-slate-900">Academic Calendar</h2>
                        <p className="text-slate-500 text-sm mt-1">Manage term dates, holidays, and school events</p>
                    </div>
                </div>
                <Button
                    onClick={() => setShowModal(true)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                </Button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-20 space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                    <p className="text-slate-500 animate-pulse">Loading calendar events...</p>
                </div>
            ) : (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-slate-900">{events.length}</p>
                                <p className="text-sm text-slate-500">Total Events</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</p>
                                <p className="text-sm text-slate-500">Upcoming</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-green-600">{events.filter(e => e.type === 'holiday').length}</p>
                                <p className="text-sm text-slate-500">Holidays</p>
                            </CardContent>
                        </Card>
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardContent className="p-4 text-center">
                                <p className="text-2xl font-bold text-red-600">{events.filter(e => e.type === 'exam').length}</p>
                                <p className="text-sm text-slate-500">Exam Periods</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Upcoming Events */}
                    <Card className="border-slate-200/80 bg-white/80">
                        <CardHeader>
                            <CardTitle className="text-lg text-slate-900">Upcoming Events</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingEvents.length === 0 ? (
                                <div className="text-center py-8">
                                    <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">No upcoming events</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map(event => (
                                        <div key={event.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50 border border-slate-200">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-2 rounded-lg ${getTypeColor(event.type)}`}>
                                                    {getTypeIcon(event.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-slate-900">{event.title}</h4>
                                                    <p className="text-sm text-slate-500">
                                                        {formatDate(event.startDate)}
                                                        {event.endDate && event.endDate !== event.startDate && (
                                                            <> - {formatDate(event.endDate)}</>
                                                        )}
                                                    </p>
                                                    {event.description && (
                                                        <p className="text-xs text-slate-400 mt-1">{event.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge className={`text-xs ${getTypeColor(event.type)}`}>
                                                    {event.type}
                                                </Badge>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDelete(event.id)}
                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Past Events */}
                    {pastEvents.length > 0 && (
                        <Card className="border-slate-200/80 bg-white/80">
                            <CardHeader>
                                <CardTitle className="text-lg text-slate-900">Past Events</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {pastEvents.slice(0, 5).map(event => (
                                        <div key={event.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50 border border-slate-100 opacity-70">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-1.5 rounded ${getTypeColor(event.type)}`}>
                                                    {getTypeIcon(event.type)}
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm text-slate-700">{event.title}</h4>
                                                    <p className="text-xs text-slate-400">{formatDate(event.startDate)}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(event.id)}
                                                className="text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {/* Add Event Modal */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent className="max-w-md bg-white border-slate-200 shadow-xl">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900">Add Calendar Event</DialogTitle>
                        <DialogDescription className="text-slate-500">
                            Add a new event to the academic calendar
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-700">Event Title</Label>
                            <Input
                                value={form.title}
                                onChange={(e) => setForm({ ...form, title: e.target.value })}
                                placeholder="e.g., First Term Begins"
                                required
                                className="border-slate-200"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700">Event Type</Label>
                            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                                <SelectTrigger className="border-slate-200">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="event">General Event</SelectItem>
                                    <SelectItem value="holiday">Holiday</SelectItem>
                                    <SelectItem value="exam">Exam Period</SelectItem>
                                    <SelectItem value="term">Term Start/End</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-slate-700">Start Date</Label>
                                <Input
                                    type="date"
                                    value={form.startDate}
                                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                                    required
                                    className="border-slate-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-slate-700">End Date (optional)</Label>
                                <Input
                                    type="date"
                                    value={form.endDate}
                                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                                    className="border-slate-200"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-700">Description (optional)</Label>
                            <Textarea
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                                placeholder="Additional details..."
                                rows={2}
                                className="border-slate-200"
                            />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="border-slate-200">
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white">
                                Add Event
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
