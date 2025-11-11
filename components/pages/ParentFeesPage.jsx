'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CreditCard, CheckCircle, XCircle, Download, Receipt } from 'lucide-react'
import jsPDF from 'jspdf'

export default function ParentFeesPage({ user, apiCall, modal }) {
  const [children, setChildren] = useState([])
  const [feeRecords, setFeeRecords] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showReceiptModal, setShowReceiptModal] = useState(false)
  const [selectedReceipt, setSelectedReceipt] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [childrenData, feesData] = await Promise.all([
        apiCall('parent/students'),
        apiCall('parent/fees')
      ])
      setChildren(childrenData)
      setFeeRecords(feesData)
    } catch (error) {
      console.error('Error loading data:', error)
    }
  }

  const getChildFeeStatus = (childId) => {
    const feeRecord = feeRecords.find(f => f.studentId === childId && f.status === 'paid')
    return feeRecord ? { paid: true, record: feeRecord } : { paid: false, record: null }
  }

  const handlePayment = (child) => {
    setSelectedChild(child)
    setShowPaymentModal(true)
  }

  const processPayment = async (paymentMethod) => {
    modal?.showLoading('Processing payment...')
    try {
      const payment = await apiCall('parent/pay-fees', {
        method: 'POST',
        body: JSON.stringify({
          studentId: selectedChild.id,
          amount: 50000,
          paymentMethod,
          term: 'First Term',
          academicYear: new Date().getFullYear()
        })
      })
      
      modal?.showSuccess('Payment Successful', 'School fees paid successfully!')
      setShowPaymentModal(false)
      setSelectedReceipt(payment)
      setShowReceiptModal(true)
      loadData()
    } catch (error) {
      modal?.showError('Payment Failed', error.message || 'Failed to process payment')
    }
  }

  const downloadReceipt = (receipt) => {
    const doc = new jsPDF()
    const child = children.find(c => c.id === receipt.studentId)
    
    doc.setFontSize(20)
    doc.text('SCHOOL FEES RECEIPT', 105, 20, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Receipt No: ${receipt.receiptNumber}`, 20, 40)
    doc.text(`Date: ${new Date(receipt.paidAt).toLocaleDateString()}`, 20, 50)
    doc.text(`Student: ${child?.firstName} ${child?.lastName}`, 20, 60)
    doc.text(`Admission No: ${child?.admissionNumber}`, 20, 70)
    doc.text(`Class: ${child?.className || 'N/A'}`, 20, 80)
    doc.text(`Term: ${receipt.term}`, 20, 90)
    doc.text(`Academic Year: ${receipt.academicYear}`, 20, 100)
    doc.text(`Amount Paid: ₦${receipt.amount.toLocaleString()}`, 20, 110)
    doc.text(`Payment Method: ${receipt.paymentMethod}`, 20, 120)
    doc.text(`Status: PAID`, 20, 130)
    
    doc.save(`receipt-${receipt.receiptNumber}.pdf`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">School Fees Payment</h2>
          <p className="text-sm text-gray-600 mt-1">Manage school fees for your children</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => {
          const feeStatus = getChildFeeStatus(child.id)
          
          return (
            <Card key={child.id} className={feeStatus.paid ? 'border-green-200 bg-green-50' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="text-lg">{child.firstName} {child.lastName}</span>
                  {feeStatus.paid ? (
                    <Badge className="bg-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Paid
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unpaid
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Admission No:</span>
                    <span className="font-medium">{child.admissionNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Class:</span>
                    <span className="font-medium">{child.className || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fee Amount:</span>
                    <span className="font-bold text-lg">₦50,000</span>
                  </div>
                </div>

                {feeStatus.paid ? (
                  <div className="space-y-2">
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => {
                        setSelectedReceipt(feeStatus.record)
                        setShowReceiptModal(true)
                      }}
                    >
                      <Receipt className="h-4 w-4 mr-2" />
                      View Receipt
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => downloadReceipt(feeStatus.record)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Receipt
                    </Button>
                  </div>
                ) : (
                  <Button 
                    className="w-full" 
                    onClick={() => handlePayment(child)}
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Pay School Fees
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {children.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">No children enrolled</p>
          </CardContent>
        </Card>
      )}

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay School Fees</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Student:</span>
                <span className="font-medium">{selectedChild?.firstName} {selectedChild?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-bold text-lg">₦50,000</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">Select Payment Method:</p>
              <Button 
                className="w-full" 
                onClick={() => processPayment('Card')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Pay with Card
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => processPayment('Bank Transfer')}
              >
                Pay with Bank Transfer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receipt Modal */}
      <Dialog open={showReceiptModal} onOpenChange={setShowReceiptModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              Payment Receipt
            </DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                <p className="text-center text-green-800 font-semibold">Payment Successful!</p>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Receipt No:</span>
                  <span className="font-mono font-medium">{selectedReceipt.receiptNumber}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{new Date(selectedReceipt.paidAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Student:</span>
                  <span className="font-medium">
                    {children.find(c => c.id === selectedReceipt.studentId)?.firstName} {children.find(c => c.id === selectedReceipt.studentId)?.lastName}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Term:</span>
                  <span className="font-medium">{selectedReceipt.term}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Academic Year:</span>
                  <span className="font-medium">{selectedReceipt.academicYear}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{selectedReceipt.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-gray-900 font-semibold">Amount Paid:</span>
                  <span className="font-bold text-lg text-green-600">₦{selectedReceipt.amount.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={() => downloadReceipt(selectedReceipt)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Receipt
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
