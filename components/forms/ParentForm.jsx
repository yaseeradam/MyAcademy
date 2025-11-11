'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ChevronLeft, Upload, Camera } from 'lucide-react'

export default function ParentForm({ 
  parentForm, 
  setParentForm,
  parentPhotoPreview,
  handlePhotoUpload,
  handleCreateParent,
  setShowFormView,
  isSubmitting
}) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-t-2xl shadow-lg">
        <button onClick={() => setShowFormView(null)} className="mb-2 flex items-center text-white hover:text-amber-100 transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="text-base font-semibold">Back to Parents</span>
        </button>
        <h1 className="text-2xl font-bold mb-1">Add New Parent</h1>
        <p className="text-amber-100 text-sm">Fill in the parent information below</p>
      </div>
      
      <form onSubmit={handleCreateParent} className="bg-white rounded-b-2xl shadow-lg p-6">
        <div className="space-y-5">
          {/* Photo Section */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
            <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
              <div className="w-2 h-5 bg-gradient-to-b from-amber-500 to-orange-600 rounded-full mr-2"></div>
              Parent Photo
            </h2>
            <div className="flex items-center gap-4">
              {parentPhotoPreview && (
                <img src={parentPhotoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover border-2 border-amber-300 shadow-md" />
              )}
              <div className="flex-1 space-y-2">
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'parent')} className="hidden" id="parent-file" />
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => document.getElementById('parent-file').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo from Device
                  </Button>
                </label>
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'parent')} className="hidden" id="parent-camera-form" />
                  <Button type="button" variant="outline" className="w-full h-10 text-sm" onClick={() => document.getElementById('parent-camera-form').click()}>
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
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Full Name *</Label>
                <Input value={parentForm.parentData.name} onChange={(e) => setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, name: e.target.value }}))} className="h-10 text-base" placeholder="Enter full name" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Phone Number *</Label>
                <Input value={parentForm.parentData.phoneNumber} onChange={(e) => setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, phoneNumber: e.target.value }}))} className="h-10 text-base" placeholder="Enter phone" required />
              </div>
            </div>
            <div className="mt-4 bg-white p-3 rounded-lg shadow-sm">
              <Label className="text-sm font-bold text-gray-800 mb-1 block">Address</Label>
              <Textarea value={parentForm.parentData.address} onChange={(e) => setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, address: e.target.value }}))} className="min-h-[80px] text-base" placeholder="Enter full address" />
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
                <Input type="email" value={parentForm.parentCredentials.email} onChange={(e) => setParentForm(prev => ({ ...prev, parentCredentials: { ...prev.parentCredentials, email: e.target.value }}))} className="h-10 text-base" placeholder="parent@email.com" required />
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <Label className="text-sm font-bold text-gray-800 mb-1 block">Password *</Label>
                <Input type="password" value={parentForm.parentCredentials.password} onChange={(e) => setParentForm(prev => ({ ...prev, parentCredentials: { ...prev.parentCredentials, password: e.target.value }}))} className="h-10 text-base" placeholder="Enter password" required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowFormView(null)} className="flex-1 h-11">Cancel</Button>
          <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold shadow-lg" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Parent'}
          </Button>
        </div>
      </form>
    </div>
  )
}
