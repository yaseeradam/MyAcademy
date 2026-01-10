'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Upload, Camera, UserCheck } from 'lucide-react'

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
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-t-2xl">
        <button onClick={() => setShowFormView(null)} className="mb-3 flex items-center text-white/80 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="font-medium">Back to Teachers</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New Teacher</h1>
            <p className="text-white/70 text-sm">Fill in the teacher information below</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateTeacher} className="bg-[#0f1d32] rounded-b-2xl p-6 border border-white/5 border-t-0">
        <div className="space-y-6">
          {/* Photo Section */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full mr-3"></div>
              Teacher Photo
            </h2>
            <div className="flex items-center gap-4">
              {teacherPhotoPreview && (
                <img src={teacherPhotoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover ring-2 ring-emerald-400/50" />
              )}
              <div className="flex-1 space-y-2">
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'teacher')} className="hidden" id="teacher-file" />
                  <Button type="button" variant="outline" className="w-full h-10 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white" onClick={() => document.getElementById('teacher-file').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo from Device
                  </Button>
                </label>
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'teacher')} className="hidden" id="teacher-camera-form" />
                  <Button type="button" variant="outline" className="w-full h-10 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white" onClick={() => document.getElementById('teacher-camera-form').click()}>
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
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-full mr-3"></div>
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-200/80">First Name *</Label>
                <Input value={teacherForm.teacherData.firstName} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, firstName: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="Enter first name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Last Name *</Label>
                <Input value={teacherForm.teacherData.lastName} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, lastName: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="Enter last name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Phone Number *</Label>
                <Input value={teacherForm.teacherData.phoneNumber} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, phoneNumber: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="Enter phone" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Qualification *</Label>
                <Input value={teacherForm.teacherData.qualification} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, qualification: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="e.g., B.Ed, M.Sc" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Specialization</Label>
                <Input value={teacherForm.teacherData.specialization} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, specialization: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="e.g. Mathematics" />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Experience (Years)</Label>
                <Input value={teacherForm.teacherData.experience} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, experience: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="e.g. 5" type="number" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-blue-200/80">Address</Label>
              <Textarea value={teacherForm.teacherData.address} onChange={(e) => setTeacherForm(prev => ({ ...prev, teacherData: { ...prev.teacherData, address: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 min-h-[80px]" placeholder="Enter full address" />
            </div>
          </div>

          {/* Login Credentials */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full mr-3"></div>
              Login Credentials
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-blue-200/80">Email *</Label>
                <Input type="email" value={teacherForm.credentials.email} onChange={(e) => setTeacherForm(prev => ({ ...prev, credentials: { ...prev.credentials, email: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="teacher@school.com" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Password *</Label>
                <Input type="password" value={teacherForm.credentials.password} onChange={(e) => setTeacherForm(prev => ({ ...prev, credentials: { ...prev.credentials, password: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="Enter password" required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowFormView(null)} className="flex-1 h-11 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white">Cancel</Button>
          <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (teacherForm.teacherData.id || teacherForm.teacherData._id ? 'Update Teacher' : 'Create Teacher')}
          </Button>
        </div>
      </form>
    </div>
  )
}
