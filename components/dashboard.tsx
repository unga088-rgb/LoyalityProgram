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

  // ⭐ Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Fetch customers from Supabase
  const fetchCustomers = useCallback(async (searchQuery?: string) => {
    if (isFetchingRef.current) return

    try {
      isFetchingRef.current = true
      setIsLoading(true)
      setError(null)

      let query = supabase.from("customers").select("*")

      // Search filter
      if (searchQuery && searchQuery.trim()) {
        query = query.ilike("name", `%${searchQuery.trim()}%`)
        setCurrentSearchQuery(searchQuery.trim())
      } else {
        setCurrentSearchQuery("")
      }

      // ⭐ SORT ALPHABETICALLY
      const { data, error: fetchError } = await query.order("name", { ascending: true })

      if (fetchError) throw fetchError

      const transformed: Customer[] =
        data?.map((c: SupabaseCustomer) => ({
          id: c.id,
          name: c.name,
          points: c.points,
          joinDate: c.join_date
        })) || []

      setCustomers(transformed)

      // ⭐ Reset pagination whenever list is refreshed (search/add/edit/delete)
      setCurrentPage(1)

    } catch (err) {
      console.error("Error fetching customers:", err)
      setError("Failed to load customers. Please refresh.")
    } finally {
      setIsLoading(false)
      isFetchingRef.current = false
    }
  }, [])

  // Fetch on mount
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Add customer
  const handleAddCustomer = async (data: { name: string; points: number }) => {
    try {
      const joinDate = new Date().toISOString().split("T")[0]

      const { error } = await supabase.from("customers").insert({
        name: data.name,
        points: data.points,
        join_date: joinDate
      })

      if (error) throw error

      await fetchCustomers(currentSearchQuery)
      setAddDialogOpen(false)

    } catch (err) {
      console.error("Error adding customer:", err)
      setError("Failed to add customer.")
    }
  }

  // Edit customer
  const handleEditCustomer = async (data: { name: string }) => {
    if (!selectedCustomer) return

    try {
      const { error } = await supabase
        .from("customers")
        .update({ name: data.name })
        .eq("id", selectedCustomer.id)

      if (error) throw error

      await fetchCustomers(currentSearchQuery)
      setEditDialogOpen(false)
      setSelectedCustomer(null)

    } catch (err) {
      console.error("Error editing customer:", err)
      setError("Failed to update customer.")
    }
  }

  // Delete
  const handleDeleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id)
      if (error) throw error

      await fetchCustomers(currentSearchQuery)

    } catch (err) {
      console.error("Delete error:", err)
      setError("Failed to delete customer.")
    }
  }

  // Update points
  const handleUpdatePoints = async (type: "add" | "redeem", points: number) => {
    if (!selectedCustomer) return

    try {
      const newPoints =
        type === "add"
          ? selectedCustomer.points + points
          : Math.max(0, selectedCustomer.points - points)

      const { error } = await supabase
        .from("customers")
        .update({ points: newPoints })
        .eq("id", selectedCustomer.id)

      if (error) throw error

      await fetchCustomers(currentSearchQuery)
      setPointsEditOpen(false)
      setSelectedCustomer(null)
      setPointsAction(null)

    } catch (err) {
      console.error("Points update error:", err)
      setError("Failed to update points.")
    }
  }

  // Selection handlers
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

  // Pagination calculations
  const totalCustomers = customers.length
  const totalPages = Math.ceil(totalCustomers / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentPageCustomers = customers.slice(startIndex, startIndex + itemsPerPage)

  return (
    <div className="min-h-screen bg-background">

      {/* Header */}
      <div className="border-b bg-card">
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

      {/* Main */}
      <div className="container mx-auto px-4 py-8">

        {/* Stats */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active members</p>
          </CardContent>
        </Card>

        {/* Customer List */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Customers</CardTitle>
              <CardDescription>Manage loyalty program members</CardDescription>
            </div>
            <Button size="sm" onClick={() => setAddDialogOpen(true)}>Add Customer</Button>
          </CardHeader>

          <CardContent>
            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Table */}
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Loading customers...</div>
            ) : (
              <>
                <CustomerTable
                  customers={currentPageCustomers}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteCustomer}
                  onAddPoints={handleAddPointsClick}
                  onRedeemPoints={handleRedeemPointsClick}
                  onSearch={fetchCustomers}
                />

                {/* ⭐ Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                    >
                      Prev
                    </Button>

                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddCustomerDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSubmit={handleAddCustomer} />
      <EditCustomerDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} customer={selectedCustomer} onSubmit={handleEditCustomer} />
      <PointsEditForm open={pointsEditOpen} onOpenChange={setPointsEditOpen} customer={selectedCustomer} action={pointsAction} onSubmit={handleUpdatePoints} />
    </div>
  )
}
