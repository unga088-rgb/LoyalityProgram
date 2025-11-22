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

interface Customer {
  id: string
  name: string
  points: number
  joinDate: string
}

interface PointsEditFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  action: "add" | "redeem" | null
  onSubmit: (type: "add" | "redeem", points: number) => void
}

export function PointsEditForm({ open, onOpenChange, customer, action, onSubmit }: PointsEditFormProps) {
  const [pointsValue, setPointsValue] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      setPointsValue("")
      setError("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const pointsNum = Number.parseInt(pointsValue, 10)

    if (!pointsValue.trim()) {
      setError("Please enter a number")
      return
    }

    if (isNaN(pointsNum)) {
      setError("Please enter a valid number")
      return
    }

    if (pointsNum <= 0) {
      setError("Points must be greater than 0")
      return
    }

    if (action === "redeem" && customer && pointsNum > customer.points) {
      setError(`Cannot redeem more than available points (${customer.points})`)
      return
    }

    if (action) {
      onSubmit(action, pointsNum)
      setPointsValue("")
      setError("")
    }
  }

  const isAdd = action === "add"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isAdd ? "Add Points" : "Redeem Points"}</DialogTitle>
          <DialogDescription className="space-y-1">
            <div>
              <span className="font-medium">Customer:</span> {customer?.name}
            </div>
            <div>
              <span className="font-medium">Total Points:</span>{" "}
              <span className="text-primary font-semibold">{customer?.points.toLocaleString()}</span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">{isAdd ? "Points to Add" : "Points to Redeem"}</label>
            <Input
              type="number"
              placeholder={isAdd ? "Enter points to add" : "Enter points to redeem"}
              value={pointsValue}
              onChange={(e) => setPointsValue(e.target.value)}
              min="1"
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant={isAdd ? "default" : "destructive"}>
              {isAdd ? "Add Points" : "Redeem Points"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
