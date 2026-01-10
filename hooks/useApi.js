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
          // Don't aggressively logout - just throw an error
          // Session management is handled by useAppData
          const error = await response.json().catch(() => ({}))
          throw new Error(error.error || 'Unauthorized')
        }
        const error = await response.json()
        throw new Error(error.error || 'API Error')
      }

      return await response.json()
    } catch (error) {
      console.error('API Error:', error)
      // Only show toast for non-401 errors to avoid duplicate messages
      if (!error.message?.includes('Unauthorized')) {
        toast.error(error.message || 'Something went wrong')
      }
      throw error
    }
  }

  return { apiCall }
}
