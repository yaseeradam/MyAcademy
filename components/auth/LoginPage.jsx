'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  School,
  GraduationCap,
  Users,
  BookOpen,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Pencil,
  Award,
  Calendar,
  ClipboardCheck
} from 'lucide-react'

export default function LoginPage({ onLogin }) {
  const [authData, setAuthData] = useState({ email: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await onLogin(authData)
    } catch (err) {
      setError(err.message || 'Invalid email or password')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#0a1628] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-600/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-600/15 to-indigo-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-0 right-1/3 w-72 h-72 bg-gradient-to-br from-amber-400/10 to-yellow-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating school icons */}
        <div className={`absolute transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <BookOpen className="absolute top-[15%] left-[10%] w-8 h-8 text-amber-500/20 animate-float" style={{ animationDelay: '0s' }} />
          <GraduationCap className="absolute top-[25%] right-[15%] w-10 h-10 text-amber-400/15 animate-float" style={{ animationDelay: '1s' }} />
          <Pencil className="absolute bottom-[30%] left-[20%] w-6 h-6 text-blue-400/20 animate-float" style={{ animationDelay: '2s' }} />
          <Award className="absolute top-[60%] left-[8%] w-8 h-8 text-amber-500/15 animate-float" style={{ animationDelay: '0.5s' }} />
          <Calendar className="absolute bottom-[20%] right-[25%] w-7 h-7 text-blue-300/15 animate-float" style={{ animationDelay: '1.5s' }} />
          <ClipboardCheck className="absolute top-[40%] right-[8%] w-9 h-9 text-amber-400/10 animate-float" style={{ animationDelay: '2.5s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* Left Side - Branding */}
      <div className={`hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10 transition-all duration-700 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
        <div>
          {/* Logo & Title */}
          <div className="flex items-center gap-4 mb-16">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl blur-lg opacity-50" />
              <img
                src="/logo.png"
                alt="My Academy Logo"
                className="relative w-16 h-16 rounded-2xl shadow-2xl object-cover"
              />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white tracking-tight">My Academy</h1>
              <p className="text-blue-200/70 text-sm font-medium tracking-wide">School Management System</p>
            </div>
          </div>

          {/* Tagline */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold text-white leading-tight mb-4">
              Empowering<br />
              <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Education</span><br />
              Through Technology
            </h2>
            <p className="text-blue-200/60 text-lg max-w-md">
              A comprehensive platform designed to streamline academic operations and enhance the learning experience.
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="group p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                <GraduationCap className="h-6 w-6 text-amber-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Student Records</h3>
              <p className="text-blue-200/50 text-sm">Complete academic profiles</p>
            </div>

            <div className="group p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Staff Portal</h3>
              <p className="text-blue-200/50 text-sm">Streamlined communication</p>
            </div>

            <div className="group p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                <BookOpen className="h-6 w-6 text-emerald-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Curriculum</h3>
              <p className="text-blue-200/50 text-sm">Comprehensive tools</p>
            </div>

            <div className="group p-5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber-500/30 transition-all duration-300">
              <div className="p-3 bg-gradient-to-br from-purple-400/20 to-pink-500/20 rounded-xl w-fit mb-3 group-hover:scale-110 transition-transform">
                <ClipboardCheck className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-1">Attendance</h3>
              <p className="text-blue-200/50 text-sm">Real-time tracking</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-blue-200/40 text-sm">
          <p>© 2024 My Academy. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={`flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10 transition-all duration-700 delay-300 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl blur-md opacity-50" />
              <img
                src="/logo.png"
                alt="My Academy Logo"
                className="relative w-12 h-12 rounded-xl shadow-xl object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Academy</h1>
              <p className="text-blue-200/60 text-xs">School Management System</p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="border-0 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/20 overflow-hidden">
            {/* Card Header Gradient */}
            <div className="h-1.5 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400" />

            <CardContent className="p-8 lg:p-10">
              {/* Welcome Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-amber-400/10 to-orange-500/10 rounded-2xl mb-4">
                  <Lock className="h-6 w-6 text-amber-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-blue-200/60">Sign in to access your dashboard</p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-blue-200/80 font-medium text-sm">
                    Email Address
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/40 group-focus-within:text-amber-400 transition-colors" />
                      <Input
                        id="email"
                        type="email"
                        value={authData.email}
                        onChange={(e) => setAuthData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="your.email@school.edu"
                        className="pl-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-amber-400/50 focus:ring-amber-400/20 rounded-xl transition-all"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-blue-200/80 font-medium text-sm">
                    Password
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-orange-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-300/40 group-focus-within:text-amber-400 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={authData.password}
                        onChange={(e) => setAuthData(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Enter your password"
                        className="pl-12 pr-12 h-14 bg-white/5 border-white/10 text-white placeholder:text-blue-200/30 focus:border-amber-400/50 focus:ring-amber-400/20 rounded-xl transition-all"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-blue-300/40 hover:text-amber-400 focus:outline-none transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl animate-shake">
                    <p className="text-sm text-red-400 font-medium text-center">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold text-base shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl group"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing In...
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      Sign In
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </span>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center">
                  <span className="px-4 text-sm text-blue-200/40 bg-[#0f1a2e]">
                    Secure Login
                  </span>
                </div>
              </div>

              {/* Help Text */}
              <p className="text-center text-sm text-blue-200/40">
                Need help? Contact{' '}
                <a href="mailto:support@myacademy.com" className="text-amber-400 hover:text-amber-300 font-medium transition-colors">
                  IT Support
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 mt-6 text-blue-200/30 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Protected by 256-bit SSL encryption</span>
          </div>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}
