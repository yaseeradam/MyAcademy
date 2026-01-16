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
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
    error: 'bg-rose-50 border-rose-200 text-rose-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    info: 'bg-sky-50 border-sky-200 text-sky-800'
  }

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-sky-500'
  }

  const Icon = icons[type]

  if (!show) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full">
      <div className={`rounded-lg border p-4 shadow-lg shadow-slate-200/70 ${colors[type]} transform transition-all duration-300 ${show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
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
            className="ml-4 inline-flex text-slate-400 hover:text-slate-600"
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
