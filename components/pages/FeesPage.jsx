'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, DollarSign, CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'

export default function FeesPage({ fees, students, classes, showModal, setShowModal, showPaymentModal, setShowPaymentModal, form, setForm, paymentForm, setPaymentForm, handleSubmit, handlePayment, onBack }) {
  const getStudentFeeStatus = (studentId) => {
    const studentFees = fees.filter(f => f.studentId === studentId)
    const total = studentFees.reduce((sum, f) => sum + f.amount, 0)
    const paid = studentFees.reduce((sum, f) => sum + (f.paid || 0), 0)
    return { total, paid, balance: total - paid }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Fee Management</h2>
        </div>
        <Button onClick={() => { setForm({ studentId: '', classId: '', feeType: '', amount: '', dueDate: '', term: '' }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Fee
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="h-5 w-5" />
              Total Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              ₦{fees.reduce((sum, f) => sum + (f.paid || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <XCircle className="h-5 w-5" />
              Outstanding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-900">
              ₦{fees.reduce((sum, f) => sum + (f.amount - (f.paid || 0)), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <DollarSign className="h-5 w-5" />
              Total Expected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              ₦{fees.reduce((sum, f) => sum + f.amount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student Fee Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Class</th>
                  <th className="p-3 text-right">Total Fee</th>
                  <th className="p-3 text-right">Paid</th>
                  <th className="p-3 text-right">Balance</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => {
                  const status = getStudentFeeStatus(student._id)
                  const cls = classes.find(c => c._id === student.classId)
                  return (
                    <tr key={student._id} className="border-t hover:bg-gray-50">
                      <td className="p-3">{student.name}</td>
                      <td className="p-3">{cls?.name}</td>
                      <td className="p-3 text-right">₦{status.total.toLocaleString()}</td>
                      <td className="p-3 text-right text-green-600">₦{status.paid.toLocaleString()}</td>
                      <td className="p-3 text-right text-red-600">₦{status.balance.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        {status.balance === 0 ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Paid</span>
                        ) : status.paid > 0 ? (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Partial</span>
                        ) : (
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs">Unpaid</span>
                        )}
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" onClick={() => { setPaymentForm({ studentId: student._id, amount: '', paymentMethod: '', transactionId: '' }); setShowPaymentModal(true) }}>
                          Record Payment
                        </Button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Fee</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={form.studentId} onValueChange={(v) => setForm({...form, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Fee Type</Label>
              <Select value={form.feeType} onValueChange={(v) => setForm({...form, feeType: v})}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tuition">Tuition</SelectItem>
                  <SelectItem value="Transport">Transport</SelectItem>
                  <SelectItem value="Uniform">Uniform</SelectItem>
                  <SelectItem value="Books">Books</SelectItem>
                  <SelectItem value="Exam">Exam</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₦)</Label>
              <Input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})} required />
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm({...form, dueDate: e.target.value})} required />
            </div>
            <div>
              <Label>Term</Label>
              <Select value={form.term} onValueChange={(v) => setForm({...form, term: v})}>
                <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="First Term">First Term</SelectItem>
                  <SelectItem value="Second Term">Second Term</SelectItem>
                  <SelectItem value="Third Term">Third Term</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Fee</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Record Payment</DialogTitle></DialogHeader>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <Label>Amount (₦)</Label>
              <Input type="number" value={paymentForm.amount} onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})} required />
            </div>
            <div>
              <Label>Payment Method</Label>
              <Select value={paymentForm.paymentMethod} onValueChange={(v) => setPaymentForm({...paymentForm, paymentMethod: v})}>
                <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Transaction ID (Optional)</Label>
              <Input value={paymentForm.transactionId} onChange={(e) => setPaymentForm({...paymentForm, transactionId: e.target.value})} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Record Payment</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
