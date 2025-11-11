'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Heart, AlertCircle, Syringe, ArrowLeft } from 'lucide-react'

export default function HealthPage({ healthRecords, students, showModal, setShowModal, form, setForm, handleSubmit, selectedStudent, setSelectedStudent, onBack }) {
  const studentRecord = selectedStudent ? healthRecords.find(r => r.studentId === selectedStudent) : null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Health Records</h2>
        </div>
        <Button onClick={() => { setForm({ studentId: '', bloodGroup: '', allergies: '', medicalConditions: '', emergencyContact: '', emergencyPhone: '', vaccinations: [] }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Record
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {students.map(student => {
                const hasRecord = healthRecords.some(r => r.studentId === student._id)
                return (
                  <div
                    key={student._id}
                    onClick={() => setSelectedStudent(student._id)}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      selectedStudent === student._id ? 'bg-blue-100 border-blue-500 border' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{student.name}</div>
                      {hasRecord ? (
                        <Heart className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Health Information</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedStudent && studentRecord ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-600">Blood Group</Label>
                    <div className="text-lg font-semibold">{studentRecord.bloodGroup || 'Not specified'}</div>
                  </div>
                  <div>
                    <Label className="text-gray-600">Emergency Contact</Label>
                    <div className="text-lg font-semibold">{studentRecord.emergencyContact || 'Not specified'}</div>
                    <div className="text-sm text-gray-600">{studentRecord.emergencyPhone}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    Allergies
                  </Label>
                  <div className="mt-1 p-3 bg-red-50 rounded">
                    {studentRecord.allergies || 'No known allergies'}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600">Medical Conditions</Label>
                  <div className="mt-1 p-3 bg-yellow-50 rounded">
                    {studentRecord.medicalConditions || 'No known medical conditions'}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-600 flex items-center gap-2">
                    <Syringe className="h-4 w-4 text-blue-600" />
                    Vaccinations
                  </Label>
                  <div className="mt-2 space-y-2">
                    {studentRecord.vaccinations && studentRecord.vaccinations.length > 0 ? (
                      studentRecord.vaccinations.map((vac, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-green-50 rounded">
                          <span className="font-medium">{vac.name}</span>
                          <span className="text-sm text-gray-600">{new Date(vac.date).toLocaleDateString()}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500">No vaccination records</div>
                    )}
                  </div>
                </div>

                <Button onClick={() => { setForm(studentRecord); setShowModal(true) }} className="w-full">
                  Update Record
                </Button>
              </div>
            ) : selectedStudent ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No health record found for this student</p>
                <Button onClick={() => { setForm({ studentId: selectedStudent, bloodGroup: '', allergies: '', medicalConditions: '', emergencyContact: '', emergencyPhone: '', vaccinations: [] }); setShowModal(true) }}>
                  Create Record
                </Button>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Select a student to view health records
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{form._id ? 'Update' : 'Add'} Health Record</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({...form, studentId: v})} disabled={!!form._id}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Blood Group</Label>
              <Select value={form.bloodGroup} onValueChange={(v) => setForm({...form, bloodGroup: v})}>
                <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Allergies</Label>
              <Textarea value={form.allergies} onChange={(e) => setForm({...form, allergies: e.target.value})} placeholder="List any known allergies" rows={2} />
            </div>
            <div>
              <Label>Medical Conditions</Label>
              <Textarea value={form.medicalConditions} onChange={(e) => setForm({...form, medicalConditions: e.target.value})} placeholder="List any medical conditions" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Emergency Contact Name</Label>
                <Input value={form.emergencyContact} onChange={(e) => setForm({...form, emergencyContact: e.target.value})} required />
              </div>
              <div>
                <Label>Emergency Contact Phone</Label>
                <Input value={form.emergencyPhone} onChange={(e) => setForm({...form, emergencyPhone: e.target.value})} required />
              </div>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">{form._id ? 'Update' : 'Add'} Record</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
