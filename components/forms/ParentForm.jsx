'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff, Users2 } from 'lucide-react'
import { useState } from 'react'
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
  const [showPassword, setShowPassword] = useState(false)

  // Quick strength check helper
  const getStrength = (pass) => {
    let strength = 0
    if (!pass) return strength
    if (pass.length >= 8) strength += 1
    if (/[A-Z]/.test(pass)) strength += 1
    if (/[0-9]/.test(pass)) strength += 1
    if (/[^A-Za-z0-9]/.test(pass)) strength += 1
    return strength
  }
  const strength = getStrength(parentForm?.parentCredentials?.password || '')

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl">
        <button onClick={() => setShowFormView(null)} className="mb-3 flex items-center text-white/80 hover:text-white transition-colors">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span className="font-medium">Back to Parents</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-white/20 rounded-xl">
            <Users2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Add New Parent</h1>
            <p className="text-white/70 text-sm">Fill in the parent information below</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateParent} className="bg-[#0f1d32] rounded-b-2xl p-6 border border-white/5 border-t-0">
        <div className="space-y-6">
          {/* Photo Section */}
          <div className="bg-white/5 p-5 rounded-xl border border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <div className="w-1 h-5 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full mr-3"></div>
              Parent Photo
            </h2>
            <div className="flex items-center gap-4">
              {parentPhotoPreview && (
                <img src={parentPhotoPreview} alt="Preview" className="h-20 w-20 rounded-xl object-cover ring-2 ring-amber-400/50" />
              )}
              <div className="flex-1 space-y-2">
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" onChange={(e) => handlePhotoUpload(e, 'parent')} className="hidden" id="parent-file" />
                  <Button type="button" variant="outline" className="w-full h-10 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white" onClick={() => document.getElementById('parent-file').click()}>
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Photo from Device
                  </Button>
                </label>
                <label className="block cursor-pointer">
                  <Input type="file" accept="image/*" capture="environment" onChange={(e) => handlePhotoUpload(e, 'parent')} className="hidden" id="parent-camera-form" />
                  <Button type="button" variant="outline" className="w-full h-10 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white" onClick={() => document.getElementById('parent-camera-form').click()}>
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
                <Label className="text-blue-200/80">Full Name *</Label>
                <Input value={parentForm.parentData.name} onChange={(e) => setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, name: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="Enter full name" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Phone Number *</Label>
                <Input value={parentForm.parentData.phoneNumber} onChange={(e) => setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, phoneNumber: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="Enter phone" required />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <Label className="text-blue-200/80">Address</Label>
              <Textarea value={parentForm.parentData.address} onChange={(e) => setParentForm(prev => ({ ...prev, parentData: { ...prev.parentData, address: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 min-h-[80px]" placeholder="Enter full address" />
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
                <Input type="email" value={parentForm.parentCredentials.email} onChange={(e) => setParentForm(prev => ({ ...prev, parentCredentials: { ...prev.parentCredentials, email: e.target.value } }))} className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40" placeholder="parent@email.com" required />
              </div>
              <div className="space-y-2">
                <Label className="text-blue-200/80">Password *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={parentForm.parentCredentials.password}
                    onChange={(e) => setParentForm(prev => ({ ...prev, parentCredentials: { ...prev.parentCredentials, password: e.target.value } }))}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 pr-10"
                    placeholder="Enter password"
                    required={!parentForm.parentData.id && !parentForm.parentData._id}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {parentForm.parentCredentials.password && (
                  <div className="space-y-1 mt-2">
                    <div className="flex space-x-1 h-1">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`h-full flex-1 rounded-full transition-colors duration-300 ${strength >= level
                              ? (strength <= 2 ? 'bg-red-500' : strength === 3 ? 'bg-yellow-500' : 'bg-green-500')
                              : 'bg-white/10'
                            }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-blue-200/60 text-right">
                      {strength <= 2 ? 'Weak' : strength === 3 ? 'Medium' : 'Strong'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button type="button" variant="outline" onClick={() => setShowFormView(null)} className="flex-1 h-11 bg-transparent border-white/10 text-blue-200/80 hover:bg-white/10 hover:text-white">Cancel</Button>
          <Button type="submit" className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : (parentForm.parentData.id || parentForm.parentData._id ? 'Update Parent' : 'Create Parent')}
          </Button>
        </div>
      </form>
    </div>
  )
}
