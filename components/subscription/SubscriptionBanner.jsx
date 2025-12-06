'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, Clock } from 'lucide-react'

export default function SubscriptionBanner({ status, daysRemaining, message }) {
  if (status === 'grace_period') {
    return (
      <div className="bg-orange-50 p-2 border-b border-orange-200">
        <div className="max-w-7xl mx-auto flex items-center justify-center text-orange-800 text-sm font-medium">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>Warning: School subscription has expired. Access will be locked in {daysRemaining} days. {message}</span>
        </div>
      </div>
    )
  }
  
  // Optionally show warning for upcoming expiry (e.g. < 7 days)
  if (status === 'active' && daysRemaining <= 7 && daysRemaining > 0) {
     return (
        <div className="bg-yellow-50 p-2 border-b border-yellow-200">
            <div className="max-w-7xl mx-auto flex items-center justify-center text-yellow-800 text-sm font-medium">
                <Clock className="h-4 w-4 mr-2" />
                <span>Notice: Subscription expires in {daysRemaining} days. Please renew soon.</span>
            </div>
        </div>
     )
  }

  return null
}
