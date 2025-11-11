'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Bus, MapPin, User, ArrowLeft } from 'lucide-react'

export default function TransportPage({ routes, students, showModal, setShowModal, showAssignModal, setShowAssignModal, form, setForm, assignForm, setAssignForm, handleSubmit, handleAssign, onBack }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Transport Management</h2>
        </div>
        <Button onClick={() => { setForm({ routeName: '', busNumber: '', driverName: '', driverPhone: '', capacity: '', stops: '', fee: '' }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Route
        </Button>
      </div>

      <div className="grid gap-4">
        {routes.map(route => {
          const assignedStudents = students.filter(s => s.transportRouteId === route._id)
          return (
            <Card key={route._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bus className="h-5 w-5 text-blue-600" />
                    {route.routeName} - Bus {route.busNumber}
                  </div>
                  <Button size="sm" onClick={() => { setAssignForm({ routeId: route._id, studentId: '' }); setShowAssignModal(true) }}>
                    Assign Student
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-600">Driver:</span>
                      <span className="font-semibold">{route.driverName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-semibold">{route.driverPhone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-semibold">{assignedStudents.length}/{route.capacity}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">Monthly Fee:</span>
                      <span className="font-semibold">₦{route.fee?.toLocaleString()}</span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-gray-600 mt-1" />
                      <div>
                        <div className="font-semibold mb-1">Stops:</div>
                        <div className="text-sm text-gray-600 space-y-1">
                          {route.stops?.split(',').map((stop, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              {stop.trim()}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {assignedStudents.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="font-semibold mb-2">Assigned Students ({assignedStudents.length})</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {assignedStudents.map(student => (
                        <div key={student._id} className="text-sm p-2 bg-gray-50 rounded">
                          {student.name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Transport Route</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Route Name</Label>
              <Input value={form.routeName} onChange={(e) => setForm({...form, routeName: e.target.value})} placeholder="e.g., Route A - Ikeja" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Bus Number</Label>
                <Input value={form.busNumber} onChange={(e) => setForm({...form, busNumber: e.target.value})} required />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input type="number" value={form.capacity} onChange={(e) => setForm({...form, capacity: e.target.value})} required />
              </div>
            </div>
            <div>
              <Label>Driver Name</Label>
              <Input value={form.driverName} onChange={(e) => setForm({...form, driverName: e.target.value})} required />
            </div>
            <div>
              <Label>Driver Phone</Label>
              <Input value={form.driverPhone} onChange={(e) => setForm({...form, driverPhone: e.target.value})} required />
            </div>
            <div>
              <Label>Stops (comma-separated)</Label>
              <Input value={form.stops} onChange={(e) => setForm({...form, stops: e.target.value})} placeholder="Stop 1, Stop 2, Stop 3" required />
            </div>
            <div>
              <Label>Monthly Fee (₦)</Label>
              <Input type="number" value={form.fee} onChange={(e) => setForm({...form, fee: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Route</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Assign Student to Route</DialogTitle></DialogHeader>
          <form onSubmit={handleAssign} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={assignForm.studentId} onValueChange={(v) => setAssignForm({...assignForm, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Assign Student</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
