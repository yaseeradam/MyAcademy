import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { School } from 'lucide-react'

export default function LoginPage({ authData, onAuthDataChange, onSubmit }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <School className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">EduManage Nigeria</CardTitle>
          <CardDescription>School Management System</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={authData.email}
                onChange={(e) => onAuthDataChange({ ...authData, email: e.target.value })}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={authData.password}
                onChange={(e) => onAuthDataChange({ ...authData, password: e.target.value })}
                placeholder="Enter your password"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          
          <div className="mt-6 p-3 bg-gray-50 rounded-lg text-xs">
            <p className="font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <p><strong>Developer:</strong> dev@system.com / dev123</p>
            <p><strong>School Admin:</strong> admin@school.com / admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
