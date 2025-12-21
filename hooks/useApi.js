import { toast } from 'sonner'

export function useApi(token) {
  const apiCall = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
          ...options.headers
        },
        ...options
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('school')
          toast.error('Session expired. Redirecting to login...')
          window.location.reload()
          throw new Error('Session expired')
        }
        const error = await response.json()
        throw new Error(error.error || 'API Error')
      }
      
      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      toast.error(error.message || 'Something went wrong')
      throw error
    }
  }

  return { apiCall }
}
