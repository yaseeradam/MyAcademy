'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Upload, Camera, GraduationCap, User, School } from 'lucide-react'
import { StudentDetailsModal } from '@/components/ui/student-details-modal'

export default function StudentForm({
  studentForm,
  setStudentForm,
  studentPhotoPreview,
  handlePhotoUpload,
  handleCreateStudent,
  setShowFormView,
  isSubmitting,
  parents,
  classes
}) {
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [createdStudent, setCreatedStudent] = useState(null)

  const handleSubmit = async (e) => {
    const result = await handleCreateStudent(e)
    if (result && result !== false) {
      setCreatedStudent(result)
      setShowDetailsModal(true)
    }
  }

  const handleCloseDetails = () => {
    setShowDetailsModal(false)
    setShowFormView(null)
  }

  const parentName = parents.find(p => p.id === createdStudent?.parentId)?.name || 'N/A'
  const className = classes.find(c => c.id === createdStudent?.classId)?.name || 'N/A'

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-t-2xl">
        <button onClick={() => setShowFormView(null)} className="mb-3 flex items-center text-white/80 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="font-medium">Back to Students</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New Student</h1>
            <p className="text-white/70 text-sm">Fill in the student information below</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0f1d32] rounded-b-2xl p-6 border border-white/5 border-t-0">
        <div className="space-y-6">
          {/* Photo Section */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-cyan-500 rounded-full mr-3"></div>
              Student Photo
            </h2>
            <div className="flex items-center gap-4">
              {studentPhotoPreview && (
                <img src={studentPhotoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover ring-2 ring-blue-400/50" />
              )}
              <div className="flex-1 space-y-2">
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" id="student-file" />
                  <Button type="button" variant="outline" className="w-full h-10 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white" onClick={() => document.getElementById('student-file').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo from Device
                  </Button>
                </label>
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" id="student-camera" />
                  <Button type="button" variant="outline" className="w-full h-10 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white" onClick={() => document.getElementById('student-camera').click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo with Camera
                  </Button>
                </label>
                <p className="text-xs text-blue-200/50">Upload a photo or use your camera (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">First Name *</Label>
                <Input value={studentForm.firstName} onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500" placeholder="Enter first name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Last Name *</Label>
                <Input value={studentForm.lastName} onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500" placeholder="Enter last name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Date of Birth *</Label>
                <Input type="date" value={studentForm.dateOfBirth} onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Gender *</Label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-slate-900"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem value="male" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">Male</SelectItem>
                    <SelectItem value="female" className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Phone Number</Label>
                <Input value={studentForm.phoneNumber} onChange={(e) => setStudentForm(prev => ({ ...prev, phoneNumber: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500" placeholder="Enter phone" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Email (Optional)</Label>
                <Input type="email" value={studentForm.email} onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500" placeholder="Enter email" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-slate-700">Address</Label>
              <Textarea value={studentForm.address} onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500 min-h-[80px]" placeholder="Enter full address" />
            </div>
          </div>

          {/* School Information */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></div>
              School Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-700">Admission Number *</Label>
                <Input value={studentForm.admissionNumber} onChange={(e) => setStudentForm(prev => ({ ...prev, admissionNumber: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500" placeholder="Enter admission number" required />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Emergency Contact</Label>
                <Input value={studentForm.emergencyContact} onChange={(e) => setStudentForm(prev => ({ ...prev, emergencyContact: e.target.value }))} className="bg-white/5 border-white/10 text-slate-900 placeholder:text-slate-500" placeholder="Enter emergency contact" />
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Parent *</Label>
                <Select value={studentForm.parentId} onValueChange={(value) => setStudentForm(prev => ({ ...prev, parentId: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-slate-900"><SelectValue placeholder="Select parent" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {parents.map((parent) => (<SelectItem key={parent.id} value={parent.id} className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">{parent.name} - {parent.email}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-700">Class *</Label>
                <Select value={studentForm.classId} onValueChange={(value) => setStudentForm(prev => ({ ...prev, classId: value }))}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-slate-900"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    {classes.map((cls) => (<SelectItem key={cls.id} value={cls.id} className="text-slate-800 focus:bg-slate-100 focus:text-slate-900">{cls.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowFormView(null)} className="flex-1 h-11 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white">Cancel</Button>
          <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (studentForm.id || studentForm._id ? 'Update Student' : 'Create Student')}
          </Button>
        </div>
      </form>

      <StudentDetailsModal
        open={showDetailsModal}
        onOpenChange={handleCloseDetails}
        student={createdStudent}
        parentName={parentName}
        className={className}
      />
    </div>
  )
}
