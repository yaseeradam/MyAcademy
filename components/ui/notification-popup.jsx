import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

export function NotificationPopup({ 
  type = 'info', 
  title, 
  message, 
  isVisible = false, 
  onClose, 
  autoClose = true, 
  duration = 5000 
}) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, autoClose, duration, onClose])

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info
  }

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  }

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500'
  }

  const Icon = icons[type]

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg border p-4 shadow-lg ${colors[type]} transform transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
        <div className="flex items-start">
          <Icon className={`h-5 w-5 mt-0.5 ${iconColors[type]}`} />
          <div className="ml-3 flex-1">
            {title && <h3 className="text-sm font-medium">{title}</h3>}
            {message && <p className={`text-sm ${title ? 'mt-1' : ''}`}>{message}</p>}
          </div>
          <button
            onClick={() => {
              setShow(false)
              onClose?.()
            }}
            className="ml-4 inline-flex text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function useNotification() {
  const [notification, setNotification] = useState(null)

  const showNotification = (type, title, message, options = {}) => {
    setNotification({
      type,
      title,
      message,
      isVisible: true,
      ...options
    })
  }

  const hideNotification = () => {
    setNotification(prev => prev ? { ...prev, isVisible: false } : null)
  }

  const NotificationComponent = notification ? (
    <NotificationPopup
      {...notification}
      onClose={hideNotification}
    />
  ) : null

  return {
    showSuccess: (title, message, options) => showNotification('success', title, message, options),
    showError: (title, message, options) => showNotification('error', title, message, options),
    showWarning: (title, message, options) => showNotification('warning', title, message, options),
    showInfo: (title, message, options) => showNotification('info', title, message, options),
    hideNotification,
    NotificationComponent
  }
}