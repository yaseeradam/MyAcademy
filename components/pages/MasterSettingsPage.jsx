'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Settings, Database, Save } from 'lucide-react'

export default function MasterSettingsPage({ masterSettings, setMasterSettings, handleSaveMasterSettings, stats }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Master Settings</h2>
      
      <form onSubmit={handleSaveMasterSettings}>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Settings className="w-5 h-5 mr-2 text-blue-600" />
                System Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>System Name</Label>
                  <Input 
                      value={masterSettings.systemName} 
                      onChange={(e) => setMasterSettings({...masterSettings, systemName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>System Email</Label>
                  <Input 
                      type="email" 
                      value={masterSettings.systemEmail} 
                      onChange={(e) => setMasterSettings({...masterSettings, systemEmail: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Default Currency</Label>
                  <Input 
                      value={masterSettings.defaultCurrency} 
                      onChange={(e) => setMasterSettings({...masterSettings, defaultCurrency: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input 
                      value={masterSettings.timezone} 
                      onChange={(e) => setMasterSettings({...masterSettings, timezone: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <Database className="w-5 h-5 mr-2 text-purple-600" />
                System Limits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Max Schools</Label>
                  <Input 
                      type="number" 
                      value={masterSettings.maxSchools} 
                      onChange={(e) => setMasterSettings({...masterSettings, maxSchools: parseInt(e.target.value)})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>System Version</Label>
                  <Input 
                      value={masterSettings.systemVersion} 
                      onChange={(e) => setMasterSettings({...masterSettings, systemVersion: e.target.value})}
                  />
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox 
                      id="allowRegistration" 
                      checked={masterSettings.allowRegistration} 
                      onCheckedChange={(checked) => setMasterSettings({...masterSettings, allowRegistration: checked})}
                  />
                  <Label htmlFor="allowRegistration">Allow New School Registration</Label>
                </div>
                <div className="flex items-center space-x-2 pt-8">
                  <Checkbox 
                      id="maintenanceMode" 
                      checked={masterSettings.maintenanceMode} 
                      onCheckedChange={(checked) => setMasterSettings({...masterSettings, maintenanceMode: checked})}
                  />
                  <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
          
       </div>
          
       <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                 <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
       </div>
      </form>

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
  )
}