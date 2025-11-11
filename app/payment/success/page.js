'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState('verifying') // 'verifying', 'success', 'failed'
  const [paymentDetails, setPaymentDetails] = useState(null)

  useEffect(() => {
    verifyPayment()
  }, [])

  const verifyPayment = async () => {
    try {
      const sessionId = searchParams.get('session_id')
      const reference = searchParams.get('reference')

      if (sessionId) {
        // Handle Stripe payment verification
        const response = await fetch(`/api/payments/verify-stripe?session_id=${sessionId}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setPaymentDetails(data.payment)
          toast.success('Payment successful! Your subscription has been upgraded.')
        } else {
          setStatus('failed')
          toast.error('Payment verification failed.')
        }
      } else if (reference) {
        // Handle Paystack payment verification
        const response = await fetch(`/api/payments/verify-paystack?reference=${reference}`)
        const data = await response.json()

        if (data.success) {
          setStatus('success')
          setPaymentDetails(data.payment)
          toast.success('Payment successful! Your subscription has been upgraded.')
        } else {
          setStatus('failed')
          toast.error('Payment verification failed.')
        }
      } else {
        setStatus('failed')
        toast.error('Invalid payment callback.')
      }
    } catch (error) {
      console.error('Payment verification error:', error)
      setStatus('failed')
      toast.error('Payment verification failed.')
    }
  }

  const handleContinue = () => {
    router.push('/?tab=billing')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'verifying' && (
            <>
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>Please wait while we verify your payment...</CardDescription>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle className="text-green-600">Payment Successful!</CardTitle>
              <CardDescription>
                Your subscription has been upgraded successfully.
              </CardDescription>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <CardTitle className="text-red-600">Payment Failed</CardTitle>
              <CardDescription>
                We couldn't verify your payment. Please contact support if you were charged.
              </CardDescription>
            </>
          )}
        </CardHeader>

        {status === 'success' && paymentDetails && (
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-gray-600 space-y-1">
                <div><strong>Plan:</strong> {paymentDetails.planName}</div>
                <div><strong>Amount:</strong> ${paymentDetails.amount}</div>
                <div><strong>Payment ID:</strong> {paymentDetails.id}</div>
              </div>
            </div>

            <Button onClick={handleContinue} className="w-full">
              Continue to Dashboard
            </Button>
          </CardContent>
        )}

        {status === 'failed' && (
          <CardContent>
            <Button onClick={handleContinue} variant="outline" className="w-full">
              Back to Billing
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  )
}

export default PaymentSuccess
