"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

interface AddCustomerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; points: number }) => void
}

export function AddCustomerDialog({ open, onOpenChange, onSubmit }: AddCustomerDialogProps) {
  const [name, setName] = useState("")
  const [points, setPoints] = useState("")
  const [error, setError] = useState("")

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      setName("")
      setPoints("")
      setError("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError("Please enter customer name")
      return
    }
    const pointsValue = Number.parseInt(points) || 0
    if (pointsValue < 0) {
      setError("Points cannot be negative")
      return
    }
    onSubmit({ name, points: pointsValue })
    setName("")
    setPoints("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
          <DialogDescription>Add a new customer to your loyalty program</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Name</label>
            <Input placeholder="Customer name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Initial Points</label>
            <Input type="number" placeholder="0" value={points} onChange={(e) => setPoints(e.target.value)} min="0" />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Customer</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
