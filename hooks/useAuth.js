import { useState, useEffect } from 'react'
import { toast } from 'sonner'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [school, setSchool] = useState(null)

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    const savedSchool = localStorage.getItem('school')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      if (savedSchool) setSchool(JSON.parse(savedSchool))
    }
  }, [])

  const login = async (authData) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(authData)
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Login failed')
      }
      
      const result = await response.json()
      
      setToken(result.token)
      setUser(result.user)
      setSchool(result.school)
      localStorage.setItem('token', result.token)
      localStorage.setItem('user', JSON.stringify(result.user))
      if (result.school) localStorage.setItem('school', JSON.stringify(result.school))
      
      toast.success('Logged in successfully!')
    } catch (error) {
      toast.error(error.message || 'Login failed')
    }
  }

  const logout = () => {
    setUser(null)
    setSchool(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('school')
    toast.success('Logged out successfully')
  }

  return { user, token, school, login, logout, setSchool }
}
