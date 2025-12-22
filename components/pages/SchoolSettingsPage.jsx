'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2 } from 'lucide-react'

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
            
            <div className="border-t pt-6 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Grading System</h3>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSchoolSettings(prev => ({
                    ...prev,
                    gradingScale: [
                      ...(prev.gradingScale || []), 
                      { min: 0, max: 0, grade: '', remark: '' }
                    ]
                  }))}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Grade Range
                </Button>
              </div>
              
              <div className="space-y-3">
                {(schoolSettings.gradingScale || []).sort((a, b) => b.min - a.min).map((grade, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end bg-gray-50 p-3 rounded">
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500">Min Score</Label>
                      <Input 
                        type="number" 
                        value={grade.min} 
                        onChange={(e) => {
                          const newScale = [...(schoolSettings.gradingScale || [])]
                          newScale[index].min = parseFloat(e.target.value)
                          setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500">Max Score</Label>
                      <Input 
                        type="number" 
                        value={grade.max} 
                        onChange={(e) => {
                          const newScale = [...(schoolSettings.gradingScale || [])]
                          newScale[index].max = parseFloat(e.target.value)
                          setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                        }}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label className="text-xs text-gray-500">Grade</Label>
                      <Input 
                        value={grade.grade} 
                        onChange={(e) => {
                          const newScale = [...(schoolSettings.gradingScale || [])]
                          newScale[index].grade = e.target.value
                          setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                        }}
                        placeholder="A"
                      />
                    </div>
                    <div className="col-span-5">
                      <Label className="text-xs text-gray-500">Remark</Label>
                      <Input 
                        value={grade.remark} 
                        onChange={(e) => {
                          const newScale = [...(schoolSettings.gradingScale || [])]
                          newScale[index].remark = e.target.value
                          setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                        }}
                        placeholder="Excellent"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button 
                        type="button" 
                        variant="destructive" 
                        size="icon"
                        onClick={() => {
                          const newScale = [...(schoolSettings.gradingScale || [])]
                          newScale.splice(index, 1)
                          setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                {(!schoolSettings.gradingScale || schoolSettings.gradingScale.length === 0) && (
                  <div className="text-center p-4 text-gray-500 text-sm border-2 border-dashed rounded">
                    No grading scale defined. Click "Add Grade Range" to start.
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit">Save Settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
