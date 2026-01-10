'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Settings, Database, Save, Building2, Users, Activity, Server } from 'lucide-react'

export default function MasterSettingsPage({ masterSettings, setMasterSettings, handleSaveMasterSettings, stats }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Master Settings</h2>
        <p className="text-blue-200/60 text-sm mt-1">Configure system-wide settings</p>
      </div>

      <form onSubmit={handleSaveMasterSettings}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* System Configuration Card */}
          <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg mr-3">
                  <Settings className="w-5 h-5 text-white" />
                </div>
                System Configuration
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-200/80">System Name</Label>
                  <Input
                    value={masterSettings.systemName}
                    onChange={(e) => setMasterSettings({ ...masterSettings, systemName: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200/80">System Email</Label>
                  <Input
                    type="email"
                    value={masterSettings.systemEmail}
                    onChange={(e) => setMasterSettings({ ...masterSettings, systemEmail: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200/80">Default Currency</Label>
                  <Input
                    value={masterSettings.defaultCurrency}
                    onChange={(e) => setMasterSettings({ ...masterSettings, defaultCurrency: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200/80">Timezone</Label>
                  <Input
                    value={masterSettings.timezone}
                    onChange={(e) => setMasterSettings({ ...masterSettings, timezone: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Limits Card */}
          <Card className="border-0 bg-white/5 backdrop-blur-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg mr-3">
                  <Database className="w-5 h-5 text-white" />
                </div>
                System Limits
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-blue-200/80">Max Schools</Label>
                  <Input
                    type="number"
                    value={masterSettings.maxSchools}
                    onChange={(e) => setMasterSettings({ ...masterSettings, maxSchools: parseInt(e.target.value) })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-blue-200/80">System Version</Label>
                  <Input
                    value={masterSettings.systemVersion}
                    onChange={(e) => setMasterSettings({ ...masterSettings, systemVersion: e.target.value })}
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="flex items-center space-x-3 pt-6 col-span-1 md:col-span-2">
                  <Checkbox
                    id="allowRegistration"
                    checked={masterSettings.allowRegistration}
                    onCheckedChange={(checked) => setMasterSettings({ ...masterSettings, allowRegistration: checked })}
                    className="border-white/30 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                  />
                  <Label htmlFor="allowRegistration" className="text-blue-200/80">Allow New School Registration</Label>
                </div>
                <div className="flex items-center space-x-3 col-span-1 md:col-span-2">
                  <Checkbox
                    id="maintenanceMode"
                    checked={masterSettings.maintenanceMode}
                    onCheckedChange={(checked) => setMasterSettings({ ...masterSettings, maintenanceMode: checked })}
                    className="border-white/30 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
                  />
                  <Label htmlFor="maintenanceMode" className="text-blue-200/80">Maintenance Mode</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end mt-6">
          <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30">
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </form>

      {/* System Statistics Card */}
      <Card className="border-0 bg-white/5 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5">
          <CardTitle className="text-white">System Statistics</CardTitle>
          <CardDescription className="text-blue-200/60">Current system usage and metrics</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl w-fit mx-auto mb-3">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalSchools || 0}</div>
              <div className="text-sm text-blue-200/60">Total Schools</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl w-fit mx-auto mb-3">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.activeSchools || 0}</div>
              <div className="text-sm text-blue-200/60">Active Schools</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl w-fit mx-auto mb-3">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">{stats.totalUsers || 0}</div>
              <div className="text-sm text-blue-200/60">Total Users</div>
            </div>
            <div className="text-center p-4 bg-white/5 rounded-xl">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl w-fit mx-auto mb-3">
                <Server className="h-5 w-5 text-white" />
              </div>
              <div className="text-2xl font-bold text-white">99.9%</div>
              <div className="text-sm text-blue-200/60">Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}