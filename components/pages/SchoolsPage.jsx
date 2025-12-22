'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, EyeOff, Edit, School, Search, UserPlus, Lock, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

export default function SchoolsPage({ 
  schools,
  showMasterSchoolModal,
  setShowMasterSchoolModal,
  masterSchoolForm,
  setMasterSchoolForm,
  handleCreateSchool,
  onToggleSchoolStatus,
  apiCall,
  onEdit,
  onDelete
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddAdminModal, setShowAddAdminModal] = useState(false)
  const [selectedSchool, setSelectedSchool] = useState(null)
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' })
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [resetEmail, setResetEmail] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleAddAdmin = async (e) => {
    e.preventDefault()
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast.error('All fields are required')
      return
    }

    setAddingAdmin(true)
    try {
      await apiCall('school/admins', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: selectedSchool.id,
          name: adminForm.name,
          email: adminForm.email,
          password: adminForm.password
        })
      })
      toast.success('✅ Admin added successfully!')
      setShowAddAdminModal(false)
      setAdminForm({ name: '', email: '', password: '' })
      setSelectedSchool(null)
    } catch (error) {
      toast.error('❌ Failed to add admin: ' + error.message)
    } finally {
      setAddingAdmin(false)
    }
  }


  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!resetPassword || !resetEmail) {
      toast.error('Email and New password are required')
      return
    }

    setIsResetting(true)
    try {
      await apiCall('master/schools/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          schoolId: selectedSchool.id,
          adminEmail: resetEmail,
          newPassword: resetPassword
        })
      })
      toast.success('✅ Password reset successfully!')
      setShowResetPasswordModal(false)
      setResetPassword('')
      setResetEmail('')
      setSelectedSchool(null)
    } catch (error) {
      toast.error('❌ Failed to reset password: ' + error.message)
    } finally {
      setIsResetting(false)
    }
  }

  const filteredSchools = schools?.filter(school => 
    school.name?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || []
  const colors = [
    'border-l-4 border-l-blue-500 bg-white',
    'border-l-4 border-l-green-500 bg-white',
    'border-l-4 border-l-purple-500 bg-white',
    'border-l-4 border-l-orange-500 bg-white',
    'border-l-4 border-l-pink-500 bg-white',
    'border-l-4 border-l-indigo-500 bg-white',
    'border-l-4 border-l-teal-500 bg-white',
    'border-l-4 border-l-red-500 bg-white'
  ]

  return (
    <div>
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Schools Management</h2>
        <Dialog open={showMasterSchoolModal} onOpenChange={setShowMasterSchoolModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create School
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New School</DialogTitle>
              <DialogDescription>
                Set up a new school with admin credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSchool}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName">School Name</Label>
                  <Input
                    id="schoolName"
                    value={masterSchoolForm.schoolName}
                    onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, schoolName: e.target.value }))}
                    placeholder="Enter school name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName">Admin Name</Label>
                  <Input
                    id="adminName"
                    value={masterSchoolForm.adminName}
                    onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, adminName: e.target.value }))}
                    placeholder="Enter admin full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={masterSchoolForm.adminEmail}
                    onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="Enter admin email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={masterSchoolForm.adminPassword}
                    onChange={(e) => setMasterSchoolForm(prev => ({ ...prev, adminPassword: e.target.value }))}
                    placeholder="Enter admin password"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Create School</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search schools by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSchools.map((school, index) => {
          const colorClass = colors[index % colors.length]

          return (
            <Card key={school.id} className={`hover:shadow-lg transition-all duration-300 ${colorClass}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${school.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <School className={`h-5 w-5 ${school.active ? 'text-green-600' : 'text-gray-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{school.name}</CardTitle>
                      <Badge variant={school.active ? "default" : "secondary"} className="mt-1">
                        {school.active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  Created: {new Date(school.createdAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Admin ID:</span>
                    <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{school.adminId}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Status:</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${school.active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span className={school.active ? 'text-green-600 font-medium' : 'text-gray-500'}>
                        {school.active ? 'Operational' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setSelectedSchool(school)
                      setShowAddAdminModal(true)
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    Add Admin
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => onEdit(school)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                        setSelectedSchool(school)
                        setResetEmail('') // Reset email on open
                        setResetPassword('') // Reset password on open
                        setShowPassword(false) // Reset visibility on open
                        setShowResetPasswordModal(true)
                    }}
                  >
                    <Lock className="h-4 w-4 mr-1" />
                    Reset Pass
                  </Button>
                  {school.active !== false ? (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-red-600 hover:bg-red-50 border-red-200"
                      onClick={() => onToggleSchoolStatus?.(school.id, false)}
                    >
                      Deactivate
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1 text-green-600 hover:bg-green-50 border-green-200"
                      onClick={() => onToggleSchoolStatus?.(school.id, true)}
                    >
                      Activate
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="flex-shrink-0"
                    onClick={() => { if (window.confirm('Are you sure you want to delete this school?')) onDelete(school.id) }} 
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add School Admin</DialogTitle>
            <DialogDescription>
              Add a new administrator for {selectedSchool?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="adminName">Admin Name</Label>
                <Input
                  id="adminName"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="Enter admin name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminEmail">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="Enter admin email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">Password</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminForm.password}
                  onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddAdminModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addingAdmin}>
                {addingAdmin ? 'Adding...' : 'Add Admin'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset School Admin Password</DialogTitle>
            <DialogDescription>
              Enter a new password for {selectedSchool?.name}'s admin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="resetEmail">Admin Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowResetPasswordModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
