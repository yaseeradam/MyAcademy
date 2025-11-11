'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CreditCard, Smartphone, Building2, Hash } from 'lucide-react'
import { toast } from 'sonner'

export default function NigerianPayments({ amount, description, onSuccess, onCancel }) {
  const [paymentMethod, setPaymentMethod] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)

  const paymentMethods = [
    { id: 'paystack', name: 'Paystack', icon: CreditCard, description: 'Cards, Bank Transfer, USSD' },
    { id: 'opay', name: 'Opay', icon: Smartphone, description: 'Mobile Wallet Payment' },
    { id: 'palmpay', name: 'PalmPay', icon: Smartphone, description: 'Mobile Wallet Payment' },
    { id: 'bank_transfer', name: 'Bank Transfer', icon: Building2, description: 'Direct Bank Transfer' },
    { id: 'ussd', name: 'USSD Payment', icon: Hash, description: '*737#, *901#, *894#' }
  ]

  const handlePaystackPayment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100,
          email: 'user@example.com',
          description
        })
      })
      const data = await response.json()
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (error) {
      toast.error('Payment initialization failed')
    }
    setLoading(false)
  }

  const handleOpayPayment = async () => {
    if (!phoneNumber) return toast.error('Phone number required')
    setLoading(true)
    try {
      const response = await fetch('/api/payments/opay/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phoneNumber,
          description
        })
      })
      const data = await response.json()
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } catch (error) {
      toast.error('Opay payment failed')
    }
    setLoading(false)
  }

  const handlePalmPayPayment = async () => {
    if (!phoneNumber) return toast.error('Phone number required')
    setLoading(true)
    try {
      const response = await fetch('/api/payments/palmpay/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          phoneNumber,
          description
        })
      })
      const data = await response.json()
      if (data.payment_url) {
        window.location.href = data.payment_url
      }
    } catch (error) {
      toast.error('PalmPay payment failed')
    }
    setLoading(false)
  }

  const handlePayment = () => {
    switch (paymentMethod) {
      case 'paystack': return handlePaystackPayment()
      case 'opay': return handleOpayPayment()
      case 'palmpay': return handlePalmPayPayment()
      case 'bank_transfer': 
        toast.info('Bank Details: GTBank - 0123456789 - EduManage Nigeria')
        break
      case 'ussd': 
        toast.info('USSD: *737*Amount*0123456789# (GTBank)')
        break
      default: toast.error('Please select a payment method')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Nigerian Payment Options</CardTitle>
        <p className="text-center text-gray-600">Amount: ₦{amount?.toLocaleString()}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Select Payment Method</Label>
          <Select value={paymentMethod} onValueChange={setPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Choose payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => (
                <SelectItem key={method.id} value={method.id}>
                  <div className="flex items-center gap-2">
                    <method.icon className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{method.name}</div>
                      <div className="text-xs text-gray-500">{method.description}</div>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {(paymentMethod === 'opay' || paymentMethod === 'palmpay') && (
          <div>
            <Label>Phone Number</Label>
            <Input
              type="tel"
              placeholder="08012345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={handlePayment} 
            disabled={!paymentMethod || loading}
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}