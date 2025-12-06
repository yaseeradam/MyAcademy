'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2, CreditCard, CheckCircle, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'

import PaystackPop from '@paystack/inline-js'

// ... existing imports ...

export default function SchoolFeesPage() {
  // ... existing state ...

  const handlePay = async (feeId) => {
    setProcessingId(feeId)
    try {
      // 1. Initialize on Backend
      const res = await fetch('/api/fees/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ feeId })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Payment initialization failed')

      // 2. Open Paystack Popup
      const paystack = new PaystackPop()
      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: data.email,
        amount: data.amount,
        ref: data.reference,
        onSuccess: async (transaction) => {
            // 3. Verify on Backend
            try {
                const verifyRes = await fetch(`/api/fees/verify?reference=${transaction.reference}`)
                const verifyData = await verifyRes.json()
                
                if (verifyData.success) {
                    toast.success('School fee paid successfully!')
                    fetchFees() // Refresh list
                    setProcessingId(null)
                } else {
                    toast.error('Payment verification failed.')
                    setProcessingId(null)
                }
            } catch (err) {
                console.error(err)
                toast.error('Error verifying payment')
                setProcessingId(null)
            }
        },
        onCancel: () => {
            setProcessingId(null)
            toast.info('Payment cancelled')
        }
      })

    } catch (error) {
      toast.error(error.message)
      setProcessingId(null)
    }
  }

  if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin h-8 w-8" /></div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">School Fees</h2>
      </div>

      <div className="grid gap-6">
            <Card>
                <CardHeader>
                    <CardTitle>Outstanding & History</CardTitle>
                    <CardDescription>View and pay your child's school fees</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Student</TableHead>
                                <TableHead>Purpose</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                        No fee records found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fees.map((fee) => (
                                    <TableRow key={fee.id}>
                                        <TableCell>{fee.studentName}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{fee.purpose}</div>
                                            <div className="text-xs text-gray-500">{fee.description}</div>
                                        </TableCell>
                                        <TableCell>{fee.dueDate ? format(new Date(fee.dueDate), 'MMM dd, yyyy') : 'N/A'}</TableCell>
                                        <TableCell>₦{fee.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={fee.status === 'paid' ? 'success' : 'outline'} className={
                                                fee.status === 'paid' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                            }>
                                                {fee.status === 'paid' ? (
                                                    <span className="flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Paid</span>
                                                ) : (
                                                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Pending</span>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {fee.status !== 'paid' && (
                                                <Button 
                                                    size="sm" 
                                                    onClick={() => handlePay(fee.id)}
                                                    disabled={!!processingId}
                                                >
                                                    {processingId === fee.id ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Pay Now'}
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
      </div>
    </div>
  )
}
