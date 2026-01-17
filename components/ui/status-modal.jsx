'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function StatusModal({ open, onOpenChange, type, title, message }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-white border-slate-200 text-slate-800 shadow-xl shadow-slate-200/70">
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
          {type === 'success' ? (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          ) : (
            <XCircle className="h-16 w-16 text-red-500" />
          )}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="text-sm text-slate-500">{message}</p>
          </div>
          <Button onClick={() => onOpenChange(false)} className="w-full bg-sky-500 hover:bg-sky-600 text-white">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
