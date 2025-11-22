"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { comparePassword } from "@/lib/password"

interface LoginPageProps {
  onLogin: (credentials: { username: string; password: string }) => void
  sessionExpired?: boolean
}

export function LoginPage({ onLogin, sessionExpired }: LoginPageProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [displayMessage, setDisplayMessage] = useState(
    sessionExpired ? "Session expired due to inactivity. Please login again." : "",
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Query the admins table to verify credentials
      const { data, error: queryError } = await supabase
        .from("admins")
        .select("id, username, password_hash")
        .eq("username", username)
        .single()

      if (queryError || !data) {
        setError("Invalid username or password")
        setUsername("")
        setPassword("")
        setIsLoading(false)
        return
      }

      // Compare password with hashed password from database
      const isPasswordValid = await comparePassword(password, data.password_hash)
      
      if (isPasswordValid) {
        onLogin({ username, password })
        setError("")
        setDisplayMessage("")
      } else {
        setError("Invalid username or password")
        setUsername("")
        setPassword("")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-muted px-4">
      <Card className="w-full max-w-sm border-0 shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">LP</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Loyalty Program</CardTitle>
          <CardDescription>Admin Access</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {displayMessage && (
              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-amber-800">{displayMessage}</p>
              </div>
            )}
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
            <Button type="submit" className="w-full h-10" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
