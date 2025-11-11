'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, Upload, Camera } from 'lucide-react'
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
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-4 rounded-t-2xl shadow-lg">
        <button onClick={() => setShowFormView(null)} className="mb-2 flex items-center text-white hover:text-blue-100 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="text-base font-semibold">Back to Students</span>
        </button>
        <h1 className="text-2xl font-bold mb-1">Add New Student</h1>
        <p className="text-blue-100 text-sm">Fill in the student information below</p>
      </div>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-lg p-6">
        <div className="space-y-5">
          {/* Photo Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-2"></div>
              Student Photo
            </h2>
            <div className="flex items-center gap-4">
              {studentPhotoPreview && (
                <img src={studentPhotoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-blue-300 shadow-md" />
              )}
              <div className="flex-1 space-y-2">
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" id="student-file" />
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => document.getElementById('student-file').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo from Device
                  </Button>
                </label>
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'student')} className="hidden" id="student-camera" />
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => document.getElementById('student-camera').click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo with Camera
                  </Button>
                </label>
                <p className="text-xs text-gray-600">Upload a photo or use your camera (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-2"></div>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">First Name *</Label>
                <Input value={studentForm.firstName} onChange={(e) => setStudentForm(prev => ({ ...prev, firstName: e.target.value }))} className="h-10 text-base" placeholder="Enter first name" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Last Name *</Label>
                <Input value={studentForm.lastName} onChange={(e) => setStudentForm(prev => ({ ...prev, lastName: e.target.value }))} className="h-10 text-base" placeholder="Enter last name" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Date of Birth *</Label>
                <Input type="date" value={studentForm.dateOfBirth} onChange={(e) => setStudentForm(prev => ({ ...prev, dateOfBirth: e.target.value }))} className="h-10 text-base" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Gender *</Label>
                <Select value={studentForm.gender} onValueChange={(value) => setStudentForm(prev => ({ ...prev, gender: value }))}>
                  <SelectTrigger className="h-10 text-base"><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Phone Number</Label>
                <Input value={studentForm.phoneNumber} onChange={(e) => setStudentForm(prev => ({ ...prev, phoneNumber: e.target.value }))} className="h-10 text-base" placeholder="Enter phone" />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Email (Optional)</Label>
                <Input type="email" value={studentForm.email} onChange={(e) => setStudentForm(prev => ({ ...prev, email: e.target.value }))} className="h-10 text-base" placeholder="Enter email" />
              </div>
            </div>
            <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
              <Label className="text-sm font-bold text-gray-800 mb-1 block">Address</Label>
              <Textarea value={studentForm.address} onChange={(e) => setStudentForm(prev => ({ ...prev, address: e.target.value }))} className="min-h-[80px] text-base" placeholder="Enter full address" />
            </div>
          </div>

          {/* School Information */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
            <h2 className="text-lg font-bold text-emerald-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-2"></div>
              School Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Admission Number *</Label>
                <Input value={studentForm.admissionNumber} onChange={(e) => setStudentForm(prev => ({ ...prev, admissionNumber: e.target.value }))} className="h-10 text-base" placeholder="Enter admission number" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Emergency Contact</Label>
                <Input value={studentForm.emergencyContact} onChange={(e) => setStudentForm(prev => ({ ...prev, emergencyContact: e.target.value }))} className="h-10 text-base" placeholder="Enter emergency contact" />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Parent *</Label>
                <Select value={studentForm.parentId} onValueChange={(value) => setStudentForm(prev => ({ ...prev, parentId: value }))}>
                  <SelectTrigger className="h-10 text-base"><SelectValue placeholder="Select parent" /></SelectTrigger>
                  <SelectContent>{parents.map((parent) => (<SelectItem key={parent.id} value={parent.id}>{parent.name} - {parent.email}</SelectItem>))}</SelectContent>
                </Select>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Class *</Label>
                <Select value={studentForm.classId} onValueChange={(value) => setStudentForm(prev => ({ ...prev, classId: value }))}>
                  <SelectTrigger className="h-10 text-base"><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>{classes.map((cls) => (<SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowFormView(null)} className="flex-1 h-11">Cancel</Button>
          <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 text-white font-semibold shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Student'}
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
