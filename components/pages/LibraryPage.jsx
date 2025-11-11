'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, BookOpen, BookMarked, ArrowLeftRight, ArrowLeft } from 'lucide-react'

export default function LibraryPage({ books, students, showModal, setShowModal, showIssueModal, setShowIssueModal, form, setForm, issueForm, setIssueForm, handleSubmit, handleIssue, handleReturn, searchTerm, setSearchTerm, onBack }) {
  const filteredBooks = books.filter(b => b.title.toLowerCase().includes(searchTerm.toLowerCase()) || b.author.toLowerCase().includes(searchTerm.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" /> Back</Button>
          <h2 className="text-2xl font-bold text-gray-800">Library Management</h2>
        </div>
        <Button onClick={() => { setForm({ title: '', author: '', isbn: '', category: '', quantity: '', available: '' }); setShowModal(true) }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" /> Add Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <BookOpen className="h-5 w-5" />
              Total Books
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">{books.reduce((sum, b) => sum + b.quantity, 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <BookMarked className="h-5 w-5" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">{books.reduce((sum, b) => sum + b.available, 0)}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <ArrowLeftRight className="h-5 w-5" />
              Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">{books.reduce((sum, b) => sum + (b.quantity - b.available), 0)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Book Catalog</CardTitle>
            <Input placeholder="Search books..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Author</th>
                  <th className="p-3 text-left">ISBN</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-center">Total</th>
                  <th className="p-3 text-center">Available</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredBooks.map(book => (
                  <tr key={book._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{book.title}</td>
                    <td className="p-3">{book.author}</td>
                    <td className="p-3 text-sm text-gray-600">{book.isbn}</td>
                    <td className="p-3"><span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{book.category}</span></td>
                    <td className="p-3 text-center">{book.quantity}</td>
                    <td className="p-3 text-center">
                      <span className={`font-semibold ${book.available > 0 ? 'text-green-600' : 'text-red-600'}`}>{book.available}</span>
                    </td>
                    <td className="p-3 text-center">
                      <Button size="sm" disabled={book.available === 0} onClick={() => { setIssueForm({ bookId: book._id, studentId: '', dueDate: '' }); setShowIssueModal(true) }}>
                        Issue
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Issued Books</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Book</th>
                  <th className="p-3 text-left">Student</th>
                  <th className="p-3 text-left">Issue Date</th>
                  <th className="p-3 text-left">Due Date</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {books.flatMap(book => (book.issuedTo || []).map((issue, i) => {
                  const student = students.find(s => s._id === issue.studentId)
                  const isOverdue = new Date(issue.dueDate) < new Date()
                  return (
                    <tr key={`${book._id}-${i}`} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{book.title}</td>
                      <td className="p-3">{student?.name}</td>
                      <td className="p-3 text-sm">{new Date(issue.issuedDate).toLocaleDateString()}</td>
                      <td className="p-3 text-sm">{new Date(issue.dueDate).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${isOverdue ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {isOverdue ? 'Overdue' : 'Active'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Button size="sm" onClick={() => handleReturn(book._id, issue.studentId)}>Return</Button>
                      </td>
                    </tr>
                  )
                }))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Book</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} required />
            </div>
            <div>
              <Label>Author</Label>
              <Input value={form.author} onChange={(e) => setForm({...form, author: e.target.value})} required />
            </div>
            <div>
              <Label>ISBN</Label>
              <Input value={form.isbn} onChange={(e) => setForm({...form, isbn: e.target.value})} required />
            </div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fiction">Fiction</SelectItem>
                  <SelectItem value="Non-Fiction">Non-Fiction</SelectItem>
                  <SelectItem value="Science">Science</SelectItem>
                  <SelectItem value="Mathematics">Mathematics</SelectItem>
                  <SelectItem value="History">History</SelectItem>
                  <SelectItem value="Literature">Literature</SelectItem>
                  <SelectItem value="Reference">Reference</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Quantity</Label>
              <Input type="number" value={form.quantity} onChange={(e) => setForm({...form, quantity: e.target.value, available: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Add Book</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showIssueModal} onOpenChange={setShowIssueModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Book</DialogTitle></DialogHeader>
          <form onSubmit={handleIssue} className="space-y-4">
            <div>
              <Label>Student</Label>
              <Select value={issueForm.studentId} onValueChange={(v) => setIssueForm({...issueForm, studentId: v})}>
                <SelectTrigger><SelectValue placeholder="Select student" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s._id} value={s._id}>{s.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Due Date</Label>
              <Input type="date" value={issueForm.dueDate} onChange={(e) => setIssueForm({...issueForm, dueDate: e.target.value})} required />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">Issue Book</Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
