'use client'

import { School } from 'lucide-react'

export default function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <School className="h-8 w-8 text-blue-600 mx-auto mb-4 absolute top-4 left-1/2 transform -translate-x-1/2" />
        </div>
        <p className="text-gray-600">Loading EduManage...</p>
      </div>
    </div>
  )
}
