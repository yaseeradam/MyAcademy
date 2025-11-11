'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, User } from 'lucide-react'

export default function ProfileSettings({ currentUser, onUpdate }) {
  const [uploading, setUploading] = useState(false)
  const [profilePicture, setProfilePicture] = useState(currentUser.profilePicture || '')

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB')
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const token = localStorage.getItem('token')
      const response = await fetch('/api/upload-profile', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setProfilePicture(data.url)
        
        // Update user profile
        const updateResponse = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ profilePicture: data.url })
        })

        if (updateResponse.ok) {
          onUpdate?.({ ...currentUser, profilePicture: data.url })
          alert('Profile picture updated successfully!')
        }
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      alert('Failed to upload profile picture')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Avatar className="h-32 w-32 ring-4 ring-purple-100">
              {profilePicture ? (
                <img src={profilePicture} alt={currentUser.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-4xl">
                  {currentUser.name?.charAt(0).toUpperCase() || <User className="h-16 w-16" />}
                </AvatarFallback>
              )}
            </Avatar>
            <label htmlFor="profile-upload" className="absolute bottom-0 right-0 p-2 bg-purple-600 rounded-full cursor-pointer hover:bg-purple-700 transition-colors shadow-lg">
              <Camera className="h-5 w-5 text-white" />
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold">{currentUser.name}</h3>
            <p className="text-sm text-gray-500">{currentUser.email}</p>
            <p className="text-xs text-gray-400 capitalize mt-1">{currentUser.role?.replace('_', ' ')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={currentUser.name} disabled className="bg-gray-50" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={currentUser.email} disabled className="bg-gray-50" />
          </div>
          <div>
            <Label>Role</Label>
            <Input value={currentUser.role?.replace('_', ' ')} disabled className="bg-gray-50 capitalize" />
          </div>
        </div>

        {uploading && (
          <div className="text-center text-sm text-gray-600">
            <Upload className="h-5 w-5 animate-spin mx-auto mb-2" />
            Uploading...
          </div>
        )}
      </CardContent>
    </Card>
  )
}
