'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Upload, Camera } from 'lucide-react'

export default function TeacherForm({ 
  teacherForm, 
  setTeacherForm,
  teacherPhotoPreview,
  handlePhotoUpload,
  handleCreateTeacher,
  setShowFormView,
  isSubmitting
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-t-2xl shadow-lg">
        <button onClick={() => setShowFormView(null)} className="mb-2 flex items-center text-white hover:text-emerald-100 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="text-base font-semibold">Back to Teachers</span>
        </button>
        <h1 className="text-2xl font-bold mb-1">Add New Teacher</h1>
        <p className="text-emerald-100 text-sm">Fill in the teacher information below</p>
      </div>
      
      <form onSubmit={handleCreateTeacher} className="bg-white rounded-b-2xl shadow-lg p-6">
        <div className="space-y-5">
          {/* Photo Section */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
            <h2 className="text-lg font-bold text-emerald-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full mr-2"></div>
              Teacher Photo
            </h2>
            <div className="flex items-center gap-4">
              {teacherPhotoPreview && (
                <img src={teacherPhotoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-emerald-300 shadow-md" />
              )}
              <div className="flex-1 space-y-2">
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'teacher')} className="hidden" id="teacher-file" />
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => document.getElementById('teacher-file').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo from Device
                  </Button>
                </label>
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'teacher')} className="hidden" id="teacher-camera-form" />
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => document.getElementById('teacher-camera-form').click()}>
                    <Camera className="h-4 w-4 mr-2" />
                    Take Photo with Camera
                  </Button>
                </label>
                <p className="text-xs text-gray-600">Upload a photo or use your camera (max 5MB)</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
            <h2 className="text-lg font-bold text-blue-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full mr-2"></div>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">First Name *</Label>
                <Input value={teacherForm.teacherData.firstName} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, firstName: e.target.value }}))} className="h-10 text-base" placeholder="Enter first name" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Last Name *</Label>
                <Input value={teacherForm.teacherData.lastName} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, lastName: e.target.value }}))} className="h-10 text-base" placeholder="Enter last name" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Phone Number *</Label>
                <Input value={teacherForm.teacherData.phoneNumber} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, phoneNumber: e.target.value }}))} className="h-10 text-base" placeholder="Enter phone" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Qualification *</Label>
                <Input value={teacherForm.teacherData.qualification} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, qualification: e.target.value }}))} className="h-10 text-base" placeholder="e.g., B.Ed, M.Sc" required />
              </div>
            </div>
            <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
              <Label className="text-sm font-bold text-gray-800 mb-1 block">Address</Label>
              <Textarea value={teacherForm.teacherData.address} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, address: e.target.value }}))} className="min-h-[80px] text-base" placeholder="Enter full address" />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-200">
            <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-purple-500 to-pink-600 rounded-full mr-2"></div>
              Login Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Email *</Label>
                <Input type="email" value={teacherForm.credentials.email} onChange={(e) => setTeacherForm(prev => ({ ...prev, credentials: { ...prev.credentials, email: e.target.value }}))} className="h-10 text-base" placeholder="teacher@school.com" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Password *</Label>
                <Input type="password" value={teacherForm.credentials.password} onChange={(e) => setTeacherForm(prev => ({ ...prev, credentials: { ...prev.credentials, password: e.target.value }}))} className="h-10 text-base" placeholder="Enter password" required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowFormView(null)} className="flex-1 h-11">Cancel</Button>
          <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Teacher'}
          </Button>
        </div>
      </form>
    </div>
  )
}
