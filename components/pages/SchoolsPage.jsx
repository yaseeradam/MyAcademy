"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  EyeOff,
  Edit,
  School,
  Search,
  UserPlus,
  Lock,
  Trash2,
  Users,
  Key,
  Ban,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

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
  onDelete,
  onAddAdmin,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [adminForm, setAdminForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [resetPassword, setResetPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleAddAdmin = async (e) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email || !adminForm.password) {
      toast.error("All fields are required");
      return;
    }
    if (adminForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setAddingAdmin(true);
    try {
      await onAddAdmin(selectedSchool.id, adminForm);
      toast.success("✅ Admin added successfully!");
      setShowAddAdminModal(false);
      setAdminForm({ name: "", email: "", password: "" });
      setSelectedSchool(null);
      setShowAdminPassword(false);
    } catch (error) {
      toast.error("❌ Failed to add admin: " + error.message);
    } finally {
      setAddingAdmin(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetPassword || !resetEmail) {
      toast.error("Email and New password are required");
      return;
    }

    setIsResetting(true);
    toast.loading("Resetting password...");
    try {
      await apiCall("master/schools/reset-password", {
        method: "POST",
        body: JSON.stringify({
          schoolId: selectedSchool.id,
          adminEmail: resetEmail,
          newPassword: resetPassword,
        }),
      });
      toast.dismiss();
      toast.success("✅ Password reset successfully!");
      setShowResetPasswordModal(false);
      setResetPassword("");
      setResetEmail("");
      setSelectedSchool(null);
    } catch (error) {
      toast.dismiss();
      toast.error("❌ Failed to reset password: " + error.message);
    } finally {
      setIsResetting(false);
    }
  };

  const filteredSchools =
    schools?.filter((school) =>
      school.name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Schools Management</h2>
          <p className="text-blue-200/60 text-sm mt-1">Manage all registered schools</p>
        </div>
        <Dialog open={showMasterSchoolModal} onOpenChange={setShowMasterSchoolModal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/30">
              <Plus className="h-4 w-4 mr-2" />
              Create School
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1d32] border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Create New School</DialogTitle>
              <DialogDescription className="text-blue-200/60">
                Set up a new school with admin credentials.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSchool}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="schoolName" className="text-blue-200/80">School Name</Label>
                  <Input
                    id="schoolName"
                    value={masterSchoolForm.schoolName}
                    onChange={(e) => setMasterSchoolForm((prev) => ({ ...prev, schoolName: e.target.value }))}
                    placeholder="Enter school name"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminName" className="text-blue-200/80">Admin Name</Label>
                  <Input
                    id="adminName"
                    value={masterSchoolForm.adminName}
                    onChange={(e) => setMasterSchoolForm((prev) => ({ ...prev, adminName: e.target.value }))}
                    placeholder="Enter admin full name"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminEmail" className="text-blue-200/80">Admin Email</Label>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={masterSchoolForm.adminEmail}
                    onChange={(e) => setMasterSchoolForm((prev) => ({ ...prev, adminEmail: e.target.value }))}
                    placeholder="Enter admin email"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword" className="text-blue-200/80">Admin Password</Label>
                  <Input
                    id="adminPassword"
                    type="password"
                    value={masterSchoolForm.adminPassword}
                    onChange={(e) => setMasterSchoolForm((prev) => ({ ...prev, adminPassword: e.target.value }))}
                    placeholder="Enter admin password"
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                  Create School
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-200/40" />
        <Input
          type="text"
          placeholder="Search schools by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-11 bg-white/5 border-white/10 text-white placeholder:text-blue-200/40 focus:border-amber-500/50"
        />
      </div>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchools.map((school) => (
          <Card key={school.id} className="border-0 bg-white/5 backdrop-blur-xl overflow-hidden hover:bg-white/10 transition-all duration-300 group">
            <CardHeader className="border-b border-white/5 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {/* School logo or default logo */}
                  <div className={`p-1 rounded-xl ring-2 ${school.active ? 'ring-emerald-400/50' : 'ring-red-400/50'}`}>
                    <img
                      src={school.logo || '/logo.png'}
                      alt={school.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-white">{school.name}</CardTitle>
                    <Badge className={`mt-1 ${school.active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' : 'bg-red-500/20 text-red-300 border-red-400/30'}`}>
                      {school.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
              <CardDescription className="text-blue-200/60 mt-2">
                Created: {new Date(school.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-200/60">Admin ID:</span>
                  <span className="font-mono text-xs bg-white/10 px-2 py-1 rounded text-blue-200/80">
                    {school.adminId?.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-blue-200/60">Status:</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${school.active ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                    <span className={school.active ? 'text-emerald-400' : 'text-red-400'}>
                      {school.active ? "Operational" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-blue-300 hover:bg-blue-500/20 border-blue-500/30 hover:border-blue-500/50"
                  onClick={() => {
                    setSelectedSchool(school);
                    setAdminForm({ name: "", email: "", password: "" });
                    setShowAddAdminModal(true);
                  }}
                >
                  <Users className="h-3.5 w-3.5 mr-1" /> Add Admin
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-purple-300 hover:bg-purple-500/20 border-purple-500/30 hover:border-purple-500/50"
                  onClick={() => onEdit(school)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-transparent text-amber-300 hover:bg-amber-500/20 border-amber-500/30 hover:border-amber-500/50"
                  onClick={() => {
                    setSelectedSchool(school);
                    setResetEmail("");
                    setResetPassword("");
                    setShowPassword(false);
                    setShowResetPasswordModal(true);
                  }}
                >
                  <Key className="h-3.5 w-3.5 mr-1" /> Reset
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className={school.active
                    ? "bg-transparent text-orange-300 hover:bg-orange-500/20 border-orange-500/30 hover:border-orange-500/50"
                    : "bg-transparent text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/30 hover:border-emerald-500/50"
                  }
                  onClick={() => onToggleSchoolStatus?.(school.id, !school.active)}
                >
                  {school.active ? <Ban className="h-3.5 w-3.5 mr-1" /> : <CheckCircle className="h-3.5 w-3.5 mr-1" />}
                  {school.active ? "Disable" : "Enable"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="col-span-2 bg-transparent text-red-400 hover:bg-red-500/20 border-red-500/30 hover:border-red-500/50"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete this school?"))
                      onDelete?.(school.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete School
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSchools.length === 0 && (
        <div className="text-center py-12">
          <School className="h-12 w-12 mx-auto mb-3 text-blue-200/40" />
          <p className="text-blue-200/60">No schools found</p>
        </div>
      )}

      {/* Add Admin Modal */}
      <Dialog open={showAddAdminModal} onOpenChange={setShowAddAdminModal}>
        <DialogContent className="bg-[#0f1d32] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Add School Admin</DialogTitle>
            <DialogDescription className="text-blue-200/60">
              Add a new administrator for {selectedSchool?.name}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddAdmin}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="adminName" className="text-blue-200/80">Admin Name</Label>
                <Input
                  id="adminName"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  placeholder="Enter admin name"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                />
              </div>
              <div>
                <Label htmlFor="adminEmail" className="text-blue-200/80">Admin Email</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  placeholder="Enter admin email"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                />
              </div>
              <div>
                <Label className="text-blue-200/80">Admin Password</Label>
                <div className="relative">
                  <Input
                    type={showAdminPassword ? "text" : "password"}
                    value={adminForm.password}
                    onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
                    placeholder="Enter admin password"
                    className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 hover:text-white"
                  >
                    {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {/* Password Strength Meter */}
                {adminForm.password && (
                  <div className="space-y-1 mt-2">
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${adminForm.password.length >= 8 &&
                          /[A-Z]/.test(adminForm.password) &&
                          /[0-9]/.test(adminForm.password) &&
                          /[^A-Za-z0-9]/.test(adminForm.password)
                          ? "bg-emerald-500 w-full"
                          : adminForm.password.length >= 8 &&
                            (/[A-Z]/.test(adminForm.password) || /[0-9]/.test(adminForm.password))
                            ? "bg-amber-500 w-2/3"
                            : "bg-red-500 w-1/3"
                          }`}
                      />
                    </div>
                    <p className="text-xs text-blue-200/60 text-right">
                      {adminForm.password.length < 8
                        ? "Too short"
                        : adminForm.password.length >= 8 &&
                          /[A-Z]/.test(adminForm.password) &&
                          /[0-9]/.test(adminForm.password) &&
                          /[^A-Za-z0-9]/.test(adminForm.password)
                          ? "Strong"
                          : "Medium"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddAdminModal(false)} className="border-white/10 text-blue-200/80 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={addingAdmin} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                {addingAdmin ? "Adding..." : "Add Admin"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Modal */}
      <Dialog open={showResetPasswordModal} onOpenChange={setShowResetPasswordModal}>
        <DialogContent className="bg-[#0f1d32] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">Reset School Admin Password</DialogTitle>
            <DialogDescription className="text-blue-200/60">
              Enter a new password for {selectedSchool?.name}'s admin.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="resetEmail" className="text-blue-200/80">Admin Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter admin email"
                  required
                  className="bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                />
              </div>
              <div>
                <Label htmlFor="newPassword" className="text-blue-200/80">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    placeholder="Enter new password"
                    required
                    className="pr-10 bg-white/5 border-white/10 text-white placeholder:text-blue-200/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200/60 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowResetPasswordModal(false)} className="border-white/10 text-blue-200/80 hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={isResetting} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white">
                {isResetting ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
