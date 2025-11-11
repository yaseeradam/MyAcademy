'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function MasterSettingsPage({ masterSettings, stats }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Master Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Configuration</CardTitle>
            <CardDescription>Core system settings and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>System Name</Label>
              <Input value={masterSettings.systemName} readOnly />
            </div>
            <div className="space-y-2">
              <Label>System Email</Label>
              <Input value={masterSettings.systemEmail} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Default Currency</Label>
              <Input value={masterSettings.defaultCurrency} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Input value={masterSettings.timezone} readOnly />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Limits</CardTitle>
            <CardDescription>Platform limitations and quotas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Maximum Schools</Label>
              <Input value={masterSettings.maxSchools} readOnly />
            </div>
            <div className="space-y-2">
              <Label>System Version</Label>
              <Input value={masterSettings.systemVersion} readOnly />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={masterSettings.allowRegistration} disabled />
              <Label>Allow New School Registration</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox checked={masterSettings.maintenanceMode} disabled />
              <Label>Maintenance Mode</Label>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Statistics</CardTitle>
            <CardDescription>Current system usage and metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalSchools || 0}</div>
                <div className="text-sm text-gray-600">Total Schools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.activeSchools || 0}</div>
                <div className="text-sm text-gray-600">Active Schools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalUsers || 0}</div>
                <div className="text-sm text-gray-600">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
