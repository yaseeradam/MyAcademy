'use client'

import { useState, useCallback } from 'react'

export function useModal() {
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('Processing...')
  const [status, setStatus] = useState({ open: false, type: null, title: '', message: '' })

  const showLoading = useCallback((message = 'Processing...') => {
    setLoadingMessage(message)
    setLoading(true)
  }, [])

  const hideLoading = useCallback(() => {
    setLoading(false)
  }, [])

  const showSuccess = useCallback((title, message) => {
    setLoading(false)
    setStatus({ open: true, type: 'success', title, message })
    setTimeout(() => setStatus(prev => ({ ...prev, open: false })), 3000)
  }, [])

  const showError = useCallback((title, message) => {
    setLoading(false)
    setStatus({ open: true, type: 'error', title, message })
  }, [])

  const closeStatus = useCallback(() => {
    setStatus(prev => ({ ...prev, open: false }))
  }, [])

  return {
    loading,
    loadingMessage,
    status,
    showLoading,
    hideLoading,
    showSuccess,
    showError,
    closeStatus
  }
}
