"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CustomerTable } from "@/components/customer-table"
import { AddCustomerDialog } from "@/components/add-customer-dialog"
import { EditCustomerDialog } from "@/components/edit-customer-dialog"
import { PointsEditForm } from "@/components/points-edit-form"
import { LogOut } from "lucide-react"
import { supabase, type Customer as SupabaseCustomer } from "@/lib/supabase"

// Local interface matching the component expectations
interface Customer {
  id: string
  name: string
  points: number
  joinDate: string
}

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [pointsEditOpen, setPointsEditOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [pointsAction, setPointsAction] = useState<"add" | "redeem" | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSearchQuery, setCurrentSearchQuery] = useState<string>("")
  const isFetchingRef = useRef(false)

  // Fetch customers from Supabase - memoized to prevent unnecessary re-renders
  const fetchCustomers = useCallback(async (searchQuery?: string) => {
    // Prevent duplicate simultaneous requests
    if (isFetchingRef.current) {
      return
    }

    try {
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)
      
      let query = supabase
        .from("customers")
        .select("*")

      // If search query provided, filter by name (case-insensitive)
      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery.trim()}%`)
        setCurrentSearchQuery(searchQuery.trim())
      } else {
        setCurrentSearchQuery("")
      }

      const { data, error: fetchError } = await query.order("join_date", { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Transform Supabase data to match component interface
      const transformedCustomers: Customer[] =
        data?.map((customer: SupabaseCustomer) => ({
          id: customer.id,
          name: customer.name,
          points: customer.points,
          joinDate: customer.join_date,
        })) || []

      setCustomers(transformedCustomers)
    } catch (err) {
      console.error("Error fetching customers:", err)
      setError("Failed to load customers. Please refresh the page.")
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Fetch customers on mount only
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  const handleAddCustomer = async (data: { name: string; points: number }) => {
    try {
      const joinDate = new Date().toISOString().split("T")[0]
      const { data: newCustomer, error: insertError } = await supabase
        .from("customers")
        .insert({
          name: data.name,
          points: data.points,
          join_date: joinDate,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Refresh the customer list from Supabase (preserve search if active)
      await fetchCustomers(currentSearchQuery || undefined)
      setAddDialogOpen(false)
    } catch (err) {
      console.error("Error adding customer:", err)
      setError("Failed to add customer. Please try again.")
    }
  }

  const handleEditCustomer = async (data: { name: string }) => {
    if (!selectedCustomer) return

    try {
      const { error: updateError } = await supabase
        .from("customers")
        .update({ name: data.name })
        .eq("id", selectedCustomer.id)

      if (updateError) {
        throw updateError
      }

      // Refresh the customer list from Supabase (preserve search if active)
      await fetchCustomers(currentSearchQuery || undefined)
      setEditDialogOpen(false)
      setSelectedCustomer(null)
    } catch (err) {
      console.error("Error updating customer:", err)
      setError("Failed to update customer. Please try again.")
    }
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from("customers").delete().eq("id", id)

      if (deleteError) {
        throw deleteError
      }

      // Refresh the customer list from Supabase (preserve search if active)
      await fetchCustomers(currentSearchQuery || undefined)
    } catch (err) {
      console.error("Error deleting customer:", err)
      setError("Failed to delete customer. Please try again.")
    }
  }

  const handleUpdatePoints = async (type: "add" | "redeem", points: number) => {
    if (!selectedCustomer) return

    try {
      const newPoints =
        type === "add" ? selectedCustomer.points + points : Math.max(0, selectedCustomer.points - points)

      const { error: updateError } = await supabase
        .from("customers")
        .update({ points: newPoints })
        .eq("id", selectedCustomer.id)

      if (updateError) {
        throw updateError
      }

      // Refresh the customer list from Supabase (preserve search if active)
      await fetchCustomers(currentSearchQuery || undefined)
      setPointsEditOpen(false)
      setSelectedCustomer(null)
      setPointsAction(null)
    } catch (err) {
      console.error("Error updating points:", err)
      setError("Failed to update points. Please try again.")
    }
  }

  const handleEditClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setEditDialogOpen(true)
  }

  const handleAddPointsClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPointsAction("add")
    setPointsEditOpen(true)
  }

  const handleRedeemPointsClick = (customer: Customer) => {
    setSelectedCustomer(customer)
    setPointsAction("redeem")
    setPointsEditOpen(true)
  }

  const totalCustomers = customers.length

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">LP</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">Loyalty Program</h1>
              <p className="text-sm text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Customers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">Active members</p>
            </CardContent>
          </Card>
        </div>

        {/* Customers Section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage your loyalty program members</CardDescription>
            </div>
            <Button onClick={() => setAddDialogOpen(true)} size="sm">
              Add Customer
            </Button>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading customers...</p>
              </div>
            ) : (
              <CustomerTable
                customers={customers}
                onEdit={handleEditClick}
                onDelete={handleDeleteCustomer}
                onAddPoints={handleAddPointsClick}
                onRedeemPoints={handleRedeemPointsClick}
                onSearch={fetchCustomers}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddCustomerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSubmit={handleAddCustomer} />
      <EditCustomerDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        customer={selectedCustomer}
        onSubmit={handleEditCustomer}
      />
      <PointsEditForm
        open={pointsEditOpen}
        onOpenChange={setPointsEditOpen}
        customer={selectedCustomer}
        action={pointsAction}
        onSubmit={handleUpdatePoints}
      />
    </div>
  )
}
