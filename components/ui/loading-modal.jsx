'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'

export function LoadingModal({ open, message = 'Processing...' }) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-md" hideClose>
        <div className="flex flex-col items-center justify-center text-center space-y-4 py-6">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
