'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Settings, Building2 } from 'lucide-react'

export default function SchoolSettingsPage({
  schoolSettings,
  setSchoolSettings,
  handleLogoUpload,
  handleSaveSettings
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
          <Settings className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900">School Settings</h2>
          <p className="text-slate-500 text-sm">Configure your school's information and appearance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-200/70 bg-white/80 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center text-slate-900">
                <Building2 className="h-5 w-5 mr-2 text-indigo-400" />
                School Information
              </CardTitle>
              <CardDescription className="text-slate-500">
                Update your school's basic details and contact info
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="schoolName" className="text-slate-700">School Name</Label>
                    <Input
                      id="schoolName"
                      value={schoolSettings.schoolName}
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                      placeholder="Enter school name"
                      className="bg-white/80 border-slate-200/80 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-sky-300 focus:ring-sky-200/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schoolEmail" className="text-slate-700">School Email</Label>
                    <Input
                      id="schoolEmail"
                      type="email"
                      value={schoolSettings.email}
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter school email"
                      className="bg-white/80 border-slate-200/80 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-sky-300 focus:ring-sky-200/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-slate-700">Phone Number</Label>
                    <Input
                      id="phoneNumber"
                      value={schoolSettings.phoneNumber}
                      onChange={(e) => setSchoolSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="Enter school phone number"
                      className="bg-white/80 border-slate-200/80 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-sky-300 focus:ring-sky-200/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-slate-700">Address</Label>
                  <Textarea
                    id="address"
                    value={schoolSettings.address}
                    onChange={(e) => setSchoolSettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter school address"
                    rows={3}
                    className="bg-white/80 border-slate-200/80 text-slate-900 placeholder:text-slate-500 shadow-sm focus:border-sky-300 focus:ring-sky-200/50"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200/70">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-slate-900">Grading System</h3>
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
                      className="bg-white/80 border-slate-200/80 text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Grade Range
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {(schoolSettings.gradingScale || []).sort((a, b) => b.min - a.min).map((grade, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end bg-white/80 p-3 rounded-lg border border-slate-200/70 hover:border-slate-300 transition-colors">
                        <div className="col-span-2">
                          <Label className="text-xs text-slate-500 mb-1 block">Min</Label>
                          <Input
                            type="number"
                            value={grade.min}
                            onChange={(e) => {
                              const newScale = [...(schoolSettings.gradingScale || [])]
                              newScale[index].min = parseFloat(e.target.value)
                              setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                            }}
                            className="h-8 bg-white border-slate-200/80 text-slate-900 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-slate-500 mb-1 block">Max</Label>
                          <Input
                            type="number"
                            value={grade.max}
                            onChange={(e) => {
                              const newScale = [...(schoolSettings.gradingScale || [])]
                              newScale[index].max = parseFloat(e.target.value)
                              setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                            }}
                            className="h-8 bg-white border-slate-200/80 text-slate-900 text-sm"
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs text-slate-500 mb-1 block">Grade</Label>
                          <Input
                            value={grade.grade}
                            onChange={(e) => {
                              const newScale = [...(schoolSettings.gradingScale || [])]
                              newScale[index].grade = e.target.value
                              setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                            }}
                            placeholder="A"
                            className="h-8 bg-white border-slate-200/80 text-slate-900 text-sm"
                          />
                        </div>
                        <div className="col-span-4">
                          <Label className="text-xs text-slate-500 mb-1 block">Remark</Label>
                          <Input
                            value={grade.remark}
                            onChange={(e) => {
                              const newScale = [...(schoolSettings.gradingScale || [])]
                              newScale[index].remark = e.target.value
                              setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                            }}
                            placeholder="Excellent"
                            className="h-8 bg-white border-slate-200/80 text-slate-900 text-sm"
                          />
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const newScale = [...(schoolSettings.gradingScale || [])]
                              newScale.splice(index, 1)
                              setSchoolSettings(prev => ({ ...prev, gradingScale: newScale }))
                            }}
                            className="h-8 w-8 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {(!schoolSettings.gradingScale || schoolSettings.gradingScale.length === 0) && (
                      <div className="text-center p-6 text-slate-400 text-sm border-2 border-dashed border-slate-200/80 rounded-lg">
                        No grading scale defined. Click "Add Grade Range" to start.
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/20">
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column (Logo) */}
        <div className="lg:col-span-1">
          <Card className="border border-slate-200/70 bg-white/80 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-slate-900">School Logo</CardTitle>
              <CardDescription className="text-slate-500">
                Upload your official school logo
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-2 border-dashed border-slate-200/80 mb-6 overflow-hidden relative group">
                {schoolSettings.logo ? (
                  <img src={schoolSettings.logo} alt="School Logo" className="w-full h-full object-contain p-2" />
                ) : (
                  <Building2 className="h-16 w-16 text-slate-300" />
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Change Logo</p>
                </div>
                <Input
                  id="logoFile"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              <div className="text-center w-full">
                <p className="text-xs text-slate-500 mb-2">Supported formats: PNG, JPG, WEBP (Max 2MB)</p>
                <Button variant="outline" className="w-full bg-white/80 border-slate-200/80 text-slate-700 hover:bg-slate-100" onClick={() => document.getElementById('logoFile').click()}>
                  Upload New Logo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
