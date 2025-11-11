'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SchoolSettingsPage({ 
  schoolSettings,
  setSchoolSettings,
  handleLogoUpload,
  handleSaveSettings
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">School Settings</h2>
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
          <CardDescription>Configure your school's information and appearance</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-2">
                <Label htmlFor="schoolName">School Name</Label>
                <Input
                  id="schoolName"
                  value={schoolSettings.schoolName}
                  onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Enter school name"
                />
              </div>
              {schoolSettings.logo && (
                <img src={schoolSettings.logo} alt="Logo" className="w-24 h-32 object-cover border-2 border-gray-300 rounded" />
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="schoolEmail">School Email</Label>
              <Input
                id="schoolEmail"
                type="email"
                value={schoolSettings.email}
                onChange={(e) => setSchoolSettings(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter school email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                value={schoolSettings.phoneNumber}
                onChange={(e) => setSchoolSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                placeholder="Enter school phone number"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={schoolSettings.address}
                onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter school address"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo">School Logo</Label>
              <Input
                id="logoFile"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-gray-500 mt-1">Upload passport-sized logo (max 2MB)</p>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
