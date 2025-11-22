"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Edit2, Plus, Minus, Trash2, Search, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Customer {
  id: string
  name: string
  points: number
  joinDate: string
}

interface CustomerTableProps {
  customers: Customer[]
  onEdit: (customer: Customer) => void
  onDelete: (id: string) => void
  onAddPoints: (customer: Customer) => void
  onRedeemPoints: (customer: Customer) => void
  onSearch?: (searchQuery?: string) => void
}

export function CustomerTable({ customers, onEdit, onDelete, onAddPoints, onRedeemPoints, onSearch }: CustomerTableProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const isInitialMount = useRef(true)
  const lastSearchQueryRef = useRef<string>("")

  // Debounce search to avoid too many API calls
  useEffect(() => {
    if (!onSearch) return

    // Skip the effect on initial mount if search query is empty
    if (isInitialMount.current) {
      isInitialMount.current = false
      if (!searchQuery.trim()) {
        return
      }
    }

    // Skip if the query hasn't actually changed
    const trimmedQuery = searchQuery.trim()
    if (trimmedQuery === lastSearchQueryRef.current) {
      return
    }

    const timeoutId = setTimeout(() => {
      // Double-check the query hasn't changed during the timeout
      if (trimmedQuery === searchQuery.trim()) {
        lastSearchQueryRef.current = trimmedQuery
        if (trimmedQuery) {
          setIsSearching(true)
          onSearch(trimmedQuery)
          setTimeout(() => setIsSearching(false), 300)
        } else {
          onSearch()
        }
      }
    }, 500) // Wait 500ms after user stops typing

    return () => clearTimeout(timeoutId)
  }, [searchQuery, onSearch])

  const handleSearch = useCallback(() => {
    if (onSearch) {
      const trimmedQuery = searchQuery.trim()
      // Only search if query has changed
      if (trimmedQuery !== lastSearchQueryRef.current) {
        lastSearchQueryRef.current = trimmedQuery
        setIsSearching(true)
        onSearch(trimmedQuery || undefined)
        setTimeout(() => setIsSearching(false), 300)
      }
    }
  }, [searchQuery, onSearch])

  const handleClearSearch = useCallback(() => {
    setSearchQuery("")
    lastSearchQueryRef.current = ""
    if (onSearch) {
      onSearch()
    }
  }, [onSearch])

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customer by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-9 pr-9"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {onSearch && (
          <Button onClick={handleSearch} variant="outline" size="sm" className="gap-2" disabled={isSearching}>
            <Search className="w-4 h-4" />
            {isSearching ? "Searching..." : "Search"}
          </Button>
        )}
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-12 border border-border rounded-lg">
          {searchQuery ? (
            <p className="text-muted-foreground">No customers found matching "{searchQuery}"</p>
          ) : (
            <p className="text-muted-foreground">No customers yet. Add your first customer to get started.</p>
          )}
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="px-4 py-3 text-center text-sm font-medium text-foreground">Actions</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Name</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Points</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-foreground">Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          <DropdownMenuItem onClick={() => onAddPoints(customer)} className="gap-2 cursor-pointer">
                            <Plus className="w-4 h-4" />
                            <span>Add Points</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onRedeemPoints(customer)} className="gap-2 cursor-pointer">
                            <Minus className="w-4 h-4" />
                            <span>Redeem Points</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(customer.id)}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">{customer.name}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-primary">{customer.points.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{customer.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
