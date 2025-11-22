"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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

interface PointsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSubmit: (type: "add" | "redeem", points: number) => void
}

export function PointsDialog({ open, onOpenChange, customer, onSubmit }: PointsDialogProps) {
  const [points, setPoints] = useState("")
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("add")

  useEffect(() => {
    if (open) {
      setPoints("")
      setError("")
    }
  }, [open])

  const handleSubmit = (e: React.FormEvent, type: "add" | "redeem") => {
    e.preventDefault()
    const pointsNum = Number.parseInt(points, 10)
    if (!points.trim() || isNaN(pointsNum) || pointsNum <= 0) {
      setError("Please enter a valid number")
      return
    }
    if (type === "redeem" && customer && pointsNum > customer.points) {
      setError("Not enough points to redeem")
      return
    }
    onSubmit(type, pointsNum)
    setPoints("")
    setError("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Points</DialogTitle>
          <DialogDescription>
            {customer?.name} - Current Points:{" "}
            <span className="font-bold text-primary">{customer?.points.toLocaleString()}</span>
          </DialogDescription>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add">Add Points</TabsTrigger>
            <TabsTrigger value="redeem">Redeem Points</TabsTrigger>
          </TabsList>
          <TabsContent value="add">
            <form onSubmit={(e) => handleSubmit(e, "add")} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Points to Add</label>
                <Input
                  type="number"
                  placeholder="Enter points"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="1"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Points</Button>
              </DialogFooter>
            </form>
          </TabsContent>
          <TabsContent value="redeem">
            <form onSubmit={(e) => handleSubmit(e, "redeem")} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Points to Redeem</label>
                <Input
                  type="number"
                  placeholder="Enter points"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  min="1"
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="destructive">
                  Redeem Points
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
