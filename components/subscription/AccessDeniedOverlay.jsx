'use client'

import { Lock, Shield, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AccessDeniedOverlay({ schoolName }) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md"></div>

      {/* Content Card */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-orange-50 mb-6">
          <Lock className="h-10 w-10 text-orange-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Temporarily Suspended</h2>
        
        <p className="text-gray-600 mb-8 leading-relaxed">
          Access to <span className="font-semibold text-gray-900">{schoolName || 'this school'}</span> is currently restricted due to an expired subscription.
        </p>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left flex items-start space-x-4">
            <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="font-semibold text-blue-900 text-sm mb-1">Teacher & Parent Action Required</h3>
                <p className="text-sm text-blue-700 leading-snug">
                    Please contact your School Administrator immediately. Only they have the permissions to renew the subscription and restore access for everyone.
                </p>
            </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">My Academy Systems</p>
        </div>
      </div>
    </div>
  )
}
